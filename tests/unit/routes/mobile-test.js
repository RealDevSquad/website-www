import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import sinon from 'sinon';
import { SELF_USER_PROFILE_URL } from 'website-www/constants/apis';
import { nonSuperUserData } from 'website-www/tests/constants/users-data';

module('Unit | Route | mobile', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.fetchStub = sinon.stub(window, 'fetch');
    this.route = this.owner.lookup('route:mobile');
  });

  hooks.afterEach(function () {
    this.fetchStub.restore();
  });

  test('it exists', function (assert) {
    assert.expect(1);
    const route = this.owner.lookup('route:mobile');
    assert.ok(route, 'The mobile route exists');
  });

  test('it fetches user profile and returns userId if API responds with 200', async function (assert) {
    const userId = nonSuperUserData.userId;
    this.fetchStub.resolves(
      new Response(JSON.stringify({ id: userId }), { status: 200 }),
    );

    const result = await this.route.model();

    assert.ok(
      this.fetchStub.calledOnceWith(SELF_USER_PROFILE_URL, {
        credentials: 'include',
      }),
      'Fetch called with correct URL and options',
    );
    assert.strictEqual(
      result.userId,
      userId,
      'Returns the correct userId from API',
    );
  });

  test('displays error in case of 401 response', async function (assert) {
    this.fetchStub.resolves(new Response(JSON.stringify({}), { status: 401 }));
    const result = await this.route.model();
    assert.strictEqual(result, undefined, 'No result returned for 401');
  });
});
