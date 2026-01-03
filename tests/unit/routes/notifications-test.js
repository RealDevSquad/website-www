import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';

module('Unit | Route | notifications', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    assert.expect(1);
    const route = this.owner.lookup('route:notifications');
    assert.ok(route, 'The route exists');
  });
});
