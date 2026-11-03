import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import sinon from 'sinon';
import { ROLES } from 'website-www/constants/live';

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), { status });

module('Unit | Service | live', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:live');
    assert.ok(service);
  });

  module('joinSession', function (hooks) {
    hooks.beforeEach(function () {
      this.service = this.owner.lookup('service:live');

      this.fetch = sinon.stub(window, 'fetch');
      this.hmsJoin = sinon.stub(this.service.hmsActions, 'join').resolves();
      sinon.stub(this.service, 'addPeer').resolves(null);

      this.toastError = sinon.stub(this.service.toast, 'error');
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    [ROLES.host, ROLES.moderator].forEach((role) => {
      test(`joins as ${role} with the token from the backend`, async function (assert) {
        this.fetch.resolves(jsonResponse(201, { token: 'test-token' }));

        await this.service.joinSession('room-id', 'test-user', role);

        assert.true(
          this.fetch.calledOnceWith(sinon.match('/events/join-admin')),
        );
        assert.deepEqual(JSON.parse(this.fetch.firstCall.args[1].body), {
          roomId: 'room-id',
          role,
          userId: 'test-user',
        });
        assert.true(
          this.hmsJoin.calledOnceWith({
            userName: 'test-user',
            authToken: 'test-token',
          }),
        );
        assert.true(this.toastError.notCalled);
      });

      test(`shows the backend message when joining as ${role} is rejected`, async function (assert) {
        const message = 'Rejected by the backend';
        this.fetch.resolves(jsonResponse(403, { message }));

        await this.service.joinSession('room-id', 'test-user', role);

        assert.true(this.hmsJoin.notCalled);
        assert.true(this.toastError.calledOnceWith(message));
        assert.false(this.service.isLoading);
      });
    });

    test('shows a generic error when the join request fails', async function (assert) {
      this.fetch.rejects(new Error('Network error'));

      await this.service.joinSession('room-id', 'test-user', ROLES.moderator);

      assert.true(this.hmsJoin.notCalled);
      assert.true(this.toastError.calledOnceWith('Something went wrong!'));
      assert.false(this.service.isLoading);
    });
  });
});
