import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';

module('Unit | Route | notifications', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    assert.expect(1);
    const route = this.owner.lookup('route:notifications');
    assert.ok(route, 'The route exists');
  });

  test('it should redirect to "/page-not-found" page when dev flag is not present', function (assert) {
    assert.expect(3);

    const route = this.owner.lookup('route:notifications');

    let transitionToCalls = [];

    route.router = {
      transitionTo(routeName) {
        transitionToCalls.push(routeName);
      },
    };

    route.beforeModel({
      to: {
        queryParams: { dev: 'false' },
      },
    });
    assert.strictEqual(
      transitionToCalls[0],
      '/page-not-found',
      'Redirected to /page-not-found when dev=false',
    );

    route.beforeModel({
      to: {
        queryParams: {},
      },
    });
    assert.strictEqual(
      transitionToCalls[1],
      '/page-not-found',
      'Redirected to /page-not-found when dev flag is missing',
    );

    route.beforeModel({
      to: {
        queryParams: { dev: 'true' },
      },
    });
    assert.strictEqual(
      transitionToCalls.length,
      2,
      'Did not redirect when dev=true',
    );
  });
});
