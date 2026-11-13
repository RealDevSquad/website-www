import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import sinon from 'sinon';
import {
  ROLES,
  PARTICIPANTS_COUNT_POLL_TIME,
  PARTICIPANTS_REFRESH_BUFFER_MS,
} from 'website-www/constants/live';

const NOT_AUTHORIZED = "You're not authorized to join with this role!";
const PLEASE_LOGIN = 'Please login to join with this role!';

module('Unit | Service | live', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:live');
    assert.ok(service);
  });

  test('userData stays in sync with the login service', function (assert) {
    const service = this.owner.lookup('service:live');
    const login = this.owner.lookup('service:login');

    assert.strictEqual(service.userData, undefined);

    const user = { roles: { super_user: true } };
    login.userData = user;

    assert.strictEqual(service.userData, user);
  });

  module('joinSession', function (hooks) {
    hooks.beforeEach(function () {
      this.service = this.owner.lookup('service:live');

      this.joinAdminRoom = sinon
        .stub(this.service, 'joinAdminRoom')
        .resolves('test-token');
      sinon.stub(this.service.hmsActions, 'join').resolves();
      sinon.stub(this.service, 'addPeer').resolves(null);

      this.toastError = sinon.stub(this.service.toast, 'error');
      this.toastInfo = sinon.stub(this.service.toast, 'info');
      sinon.stub(this.service.toast, 'success');
    });

    const allowed = [
      ['member', { super_user: false, member: true }, ROLES.moderator],
      ['super_user', { super_user: true, member: false }, ROLES.host],
    ];

    allowed.forEach(([who, roles, role]) => {
      test(`${who} can join as ${role}`, async function (assert) {
        this.service.login.userData = { roles };

        await this.service.joinSession('room-id', 'test-user', role);

        assert.true(
          this.joinAdminRoom.calledOnceWith('room-id', role, 'test-user'),
        );
        assert.false(this.toastError.calledWith(NOT_AUTHORIZED));
      });
    });

    const blocked = [
      ['member', { super_user: false, member: true }, ROLES.host],
      [
        'user with no roles',
        { super_user: false, member: false },
        ROLES.moderator,
      ],
    ];

    blocked.forEach(([who, roles, role]) => {
      test(`${who} cannot join as ${role}`, async function (assert) {
        this.service.login.userData = { roles };

        await this.service.joinSession('room-id', 'test-user', role);

        assert.true(this.joinAdminRoom.notCalled);
        assert.true(this.toastError.calledWith(NOT_AUTHORIZED));
        assert.false(this.service.isLoading);
      });
    });

    test('logged out user is asked to login when joining as moderator', async function (assert) {
      this.service.login.userData = undefined;

      await this.service.joinSession('room-id', 'test-user', ROLES.moderator);

      assert.true(this.joinAdminRoom.notCalled);
      assert.true(this.toastInfo.calledWith(PLEASE_LOGIN));
    });
  });

  module('participants count', function (hooks) {
    const ROOM_ID = 'room-1';
    const COUNTS = { host: 1, moderator: 1, maven: 0, guest: 3 };
    const ZERO = { host: 0, moderator: 0, maven: 0, guest: 0 };

    const jsonResponse = (status, body) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });

    const liveBody = (countsByRole, refreshAfterMs = 5000) => ({
      message: 'Participants count fetched successfully',
      data: {
        total: Object.values(countsByRole).reduce((a, b) => a + b, 0),
        countsByRole,
        refreshAfterMs,
      },
    });

    const endedBody = (message) => ({
      message,
      data: { total: null, countsByRole: null },
    });

    hooks.beforeEach(function () {
      this.clock = sinon.useFakeTimers({
        toFake: [
          'setTimeout',
          'clearTimeout',
          'setInterval',
          'clearInterval',
          'Date',
        ],
      });
      this.service = this.owner.lookup('service:live');
      this.service.activeRoomId = ROOM_ID;
      this.fetchStub = sinon.stub(window, 'fetch');
      this.respondWith = (status, body) =>
        this.fetchStub.callsFake(async () => jsonResponse(status, body));
    });

    hooks.afterEach(function () {
      this.service.stopParticipantsPolling();
      this.clock.restore();
      sinon.restore();
    });

    test('calls the endpoint right away when the user joins', function (assert) {
      this.respondWith(200, liveBody(COUNTS));

      this.service.startParticipantsPolling(ROOM_ID);

      assert.true(this.fetchStub.calledOnce);
      assert.true(
        this.fetchStub.firstCall.args[0].endsWith(
          `/events/${ROOM_ID}/participants`,
        ),
      );
    });

    test('stores the server count', async function (assert) {
      this.respondWith(200, liveBody(COUNTS));

      this.service.startParticipantsPolling(ROOM_ID);
      await this.clock.tickAsync(0);

      assert.false(this.service.hideParticipantsCount);
      assert.deepEqual(this.service.participantsByRole, COUNTS);
    });

    test('live with total 0 stores zeros and keeps polling', async function (assert) {
      this.respondWith(200, liveBody(ZERO));

      this.service.startParticipantsPolling(ROOM_ID);
      await this.clock.tickAsync(0);

      assert.deepEqual(this.service.participantsByRole, ZERO);

      await this.clock.tickAsync(PARTICIPANTS_COUNT_POLL_TIME);
      assert.strictEqual(this.fetchStub.callCount, 2);
    });

    test('several joins/leaves before the cache expires share one call', async function (assert) {
      this.respondWith(200, liveBody(COUNTS, 5000));
      this.service.startParticipantsPolling(ROOM_ID);
      await this.clock.tickAsync(0);
      assert.strictEqual(this.fetchStub.callCount, 1);

      this.service.scheduleParticipantsRefresh();
      this.service.scheduleParticipantsRefresh();
      this.service.scheduleParticipantsRefresh();

      await this.clock.tickAsync(5000 + PARTICIPANTS_REFRESH_BUFFER_MS - 1);
      assert.strictEqual(
        this.fetchStub.callCount,
        1,
        'not called before refreshAfterMs + 0.5s',
      );

      await this.clock.tickAsync(1);
      assert.strictEqual(this.fetchStub.callCount, 2, 'one shared call');
    });

    test('the 10-second poll calls the endpoint when there are no joins/leaves', async function (assert) {
      this.respondWith(200, liveBody(COUNTS));
      this.service.startParticipantsPolling(ROOM_ID);
      await this.clock.tickAsync(0);

      await this.clock.tickAsync(PARTICIPANTS_COUNT_POLL_TIME - 1);
      assert.strictEqual(this.fetchStub.callCount, 1);

      await this.clock.tickAsync(1);
      assert.strictEqual(this.fetchStub.callCount, 2);
    });

    [400, 502].forEach((status) => {
      test(`${status} keeps the last count and the next poll retries`, async function (assert) {
        this.respondWith(200, liveBody(COUNTS));
        this.service.startParticipantsPolling(ROOM_ID);
        await this.clock.tickAsync(0);

        this.respondWith(status, {
          message: 'Unable to fetch participants count',
        });
        await this.clock.tickAsync(PARTICIPANTS_COUNT_POLL_TIME);

        assert.false(this.service.hideParticipantsCount);
        assert.deepEqual(this.service.participantsByRole, COUNTS);

        await this.clock.tickAsync(PARTICIPANTS_COUNT_POLL_TIME);
        assert.strictEqual(this.fetchStub.callCount, 3, 'still polling');
      });
    });

    test('network failure keeps the last count', async function (assert) {
      sinon.stub(console, 'error');
      this.respondWith(200, liveBody(COUNTS));
      this.service.startParticipantsPolling(ROOM_ID);
      await this.clock.tickAsync(0);

      this.fetchStub.rejects(new TypeError('Failed to fetch'));
      await this.clock.tickAsync(PARTICIPANTS_COUNT_POLL_TIME);

      assert.deepEqual(this.service.participantsByRole, COUNTS);
    });

    ['Event has ended', 'Event is not live'].forEach((message) => {
      test(`"${message}" stops polling and hides the count`, async function (assert) {
        this.respondWith(200, endedBody(message));
        this.service.startParticipantsPolling(ROOM_ID);
        await this.clock.tickAsync(0);

        assert.true(this.service.hideParticipantsCount);
        assert.strictEqual(this.service.participantsByRole, null);

        await this.clock.tickAsync(PARTICIPANTS_COUNT_POLL_TIME * 2);
        assert.strictEqual(this.fetchStub.callCount, 1, 'no more polls');
      });
    });

    test('404 stops polling and clears the count', async function (assert) {
      this.respondWith(404, { message: 'Event not found' });
      this.service.startParticipantsPolling(ROOM_ID);
      await this.clock.tickAsync(0);

      assert.true(this.service.hideParticipantsCount);
      assert.strictEqual(this.service.participantsByRole, null);

      await this.clock.tickAsync(PARTICIPANTS_COUNT_POLL_TIME * 2);
      assert.strictEqual(this.fetchStub.callCount, 1);
    });

    test('leaving the room stops polling and resets the count', async function (assert) {
      this.respondWith(200, liveBody(COUNTS));
      this.service.startParticipantsPolling(ROOM_ID);
      await this.clock.tickAsync(0);

      this.service.onConnection(false);

      assert.false(this.service.hideParticipantsCount);
      assert.strictEqual(this.service.participantsByRole, null);

      await this.clock.tickAsync(PARTICIPANTS_COUNT_POLL_TIME * 2);
      assert.strictEqual(this.fetchStub.callCount, 1);
    });

    module('stale responses', function (hooks) {
      hooks.beforeEach(function () {
        this.pendingBodies = [];
        this.fetchStub.callsFake(async () => ({
          ok: true,
          status: 200,
          json: () =>
            new Promise((resolve) => this.pendingBodies.push(resolve)),
        }));
      });

      test('stopping polling aborts the in-flight request', async function (assert) {
        this.service.startParticipantsPolling(ROOM_ID);
        const { signal } = this.fetchStub.firstCall.args[1];

        assert.false(signal.aborted);
        this.service.stopParticipantsPolling();
        assert.true(signal.aborted);
      });

      test('ignores a body that resolves after polling stops', async function (assert) {
        this.service.startParticipantsPolling(ROOM_ID);
        await this.clock.tickAsync(0);

        this.service.stopParticipantsPolling();
        this.pendingBodies[0](liveBody(COUNTS));
        await this.clock.tickAsync(0);

        assert.strictEqual(this.service.participantsByRole, null);
      });

      test('an old room ended response does not stop the new room polling', async function (assert) {
        this.service.startParticipantsPolling(ROOM_ID);
        await this.clock.tickAsync(0);

        this.service.activeRoomId = 'room-2';
        this.service.startParticipantsPolling('room-2');
        await this.clock.tickAsync(0);

        this.pendingBodies[0](endedBody('Event has ended'));
        await this.clock.tickAsync(0);

        assert.false(this.service.hideParticipantsCount);
        assert.ok(this.service.participantsPollTimer, 'new room still polling');

        this.pendingBodies[1](liveBody(COUNTS));
        await this.clock.tickAsync(0);
        assert.deepEqual(this.service.participantsByRole, COUNTS);
      });

      test('ignores an old response after polling restarts for the same room', async function (assert) {
        this.service.startParticipantsPolling(ROOM_ID);
        await this.clock.tickAsync(0);

        this.service.startParticipantsPolling(ROOM_ID);
        await this.clock.tickAsync(0);

        this.pendingBodies[0](liveBody(COUNTS));
        await this.clock.tickAsync(0);

        assert.strictEqual(this.service.participantsByRole, null);
      });
    });
  });
});
