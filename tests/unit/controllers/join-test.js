import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
class MockLoginService extends Service {
  @tracked isLoggedIn = false;
  @tracked userData = null;
}

module('Unit | Controller | join', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:login', MockLoginService);
  });

  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:join');
    assert.ok(controller);
  });

  test('it has queryParams', function (assert) {
    let controller = this.owner.lookup('controller:join');
    assert.deepEqual(controller.queryParams, ['step', 'dev', 'oldOnboarding']);
  });

  test('isOldOnboarding returns values correctly as per oldOnboarding query param', function (assert) {
    let controller = this.owner.lookup('controller:join');

    controller.oldOnboarding = 'true';
    assert.true(controller.isOldOnboarding, 'isOldOnboarding is true');
    controller.oldOnboarding = 'false';
    assert.false(controller.isOldOnboarding, 'isOldOnboarding is false');
    controller.oldOnboarding = null;
    assert.false(
      controller.isOldOnboarding,
      'isOldOnboarding is false for null',
    );
  });

  test('it correctly identifies when a user is logged in', function (assert) {
    let controller = this.owner.lookup('controller:join');
    let loginService = this.owner.lookup('service:login');

    loginService.isLoggedIn = false;
    loginService.userData = null;
    assert.notOk(
      controller.isLoggedIn,
      'isLoggedIn is false when user is not logged in',
    );

    loginService.isLoggedIn = true;
    loginService.userData = null;
    assert.notOk(
      controller.isLoggedIn,
      'isLoggedIn is false when userData is null',
    );

    loginService.isLoggedIn = true;
    loginService.userData = { id: '123', username: 'testuser' };
    assert.ok(
      controller.isLoggedIn,
      'isLoggedIn is true when user is logged in and userData is present',
    );
  });
});
