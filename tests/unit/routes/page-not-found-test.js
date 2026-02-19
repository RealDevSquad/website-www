import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import { visit } from '@ember/test-helpers';
import Service from '@ember/service';

class LoginStub extends Service {
  isLoading = false;
  isLoggedIn = false;
  userData = null;
}

module('Unit | Route | page-not-found', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:login', LoginStub);
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:page-not-found');
    assert.ok(route);
  });

  test('visiting /*', async function (assert) {
    await visit('/*');

    assert
      .dom('[data-test-img]')
      .hasAttribute('src', '../assets/images/errors/404.svg')
      .hasAttribute('alt', 'Page Not Found');
    assert
      .dom('[data-test-text]')
      .hasText("The page you're looking for cannot be found!");
  });
});
