import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import sinon from 'sinon';
import { ROLES } from 'website-www/constants/live';

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
});
