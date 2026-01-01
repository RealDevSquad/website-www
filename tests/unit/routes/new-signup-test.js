import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import { APPS } from 'website-www/constants/urls';
import sinon from 'sinon';
import { SIGNUP_ERROR_MESSAGES } from 'website-www/constants/new-signup';

module('Unit | Route | new-signup', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.fetchStub = sinon.stub(window, 'fetch');
    this.route = this.owner.lookup('route:new-signup');
    sinon.stub(this.route.router, 'transitionTo');
    sinon.stub(this.route.toast, 'error');
    sinon.stub(window, 'open');
    this.clock = sinon.useFakeTimers();
  });

  hooks.afterEach(function () {
    this.fetchStub.restore();
    sinon.restore();
    this.clock.restore();
  });

  test('displays error in case of 401 response', async function (assert) {
    this.fetchStub.resolves(new Response(JSON.stringify({}), { status: 401 }));
    const result = await this.route.model();
    assert.strictEqual(result, undefined, 'No result returned for 401');
  });

  test('shows toast and redirects to app when form already filled', async function (assert) {
    assert.expect(2);

    const user = { incompleteUserDetails: false };
    this.fetchStub.resolves(
      new Response(JSON.stringify(user), { status: 200 }),
    );

    await this.route.model();

    assert.ok(
      this.route.toast.error.calledWith(
        SIGNUP_ERROR_MESSAGES.formAlreadyFilled,
        'Error!',
      ),
      'Shows form already filled error toast',
    );

    const expectedUrl = new URL(APPS.GOTO);

    this.clock.tick(2000);

    assert.ok(
      window.open.calledWith(expectedUrl.toString(), '_self'),
      'Redirects to app URL with dev param after delay',
    );
  });
});
