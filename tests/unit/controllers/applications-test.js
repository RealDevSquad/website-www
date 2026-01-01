import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';

module('Unit | Controller | applications', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    assert.expect(1);
    const controller = this.owner.lookup('controller:applications');
    assert.ok(controller, 'The applications controller exists');
  });
});
