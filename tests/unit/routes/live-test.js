import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import { visit } from '@ember/test-helpers';
import Service from '@ember/service';

class LoginStub extends Service {
  isLoading = false;
  isLoggedIn = false;
  userData = null;
}

module('Unit | Route | live', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:login', LoginStub);
  });
  // TODO - remove tests for dev mode when it goes to prod
  test('it exists', function (assert) {
    let route = this.owner.lookup('route:live');
    assert.ok(route);
  });

  test('visiting /live', async function (assert) {
    await visit('/live?dev=true');
    assert.expect(2);

    assert.dom('[data-test-live-roles-card]').exists();
    assert.dom('[data-test-live-roles-card-title]').exists();
  });
});
