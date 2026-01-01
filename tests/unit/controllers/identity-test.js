import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';

module('Unit | Controller | index', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:identity');
  });

  test('it initializes userData and profileURL correctly', function (assert) {
    assert.strictEqual(
      controller.userData,
      null,
      'userData is initialized to null',
    );
    assert.strictEqual(
      controller.profileURL,
      null,
      'profileURL is initialized to null',
    );
  });

  test('it checks if setState updates the state correctly', function (assert) {
    controller.setState('getStarted');

    assert.strictEqual(
      controller.state,
      'getStarted',
      'state is updated correctly',
    );
  });

  test('action setState updates the state correctly', function (assert) {
    controller.setState('not-linked');

    assert.strictEqual(
      controller.state,
      'not-linked',
      'state is updated correctly',
    );
  });
});
