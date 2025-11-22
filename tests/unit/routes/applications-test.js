import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import sinon from 'sinon';
import {
  APPLICATIONS_URL,
  SELF_USER_PROFILE_URL,
} from 'website-www/constants/apis';

const APPLICATIONS_SIZE = 6;

module('Unit | Route | applications', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.fetchStub = sinon.stub(window, 'fetch');
    this.route = this.owner.lookup('route:applications');
    sinon.stub(this.route.router, 'replaceWith');
    sinon.stub(this.route.toast, 'error');
  });

  hooks.afterEach(function () {
    this.fetchStub.restore();
    sinon.restore();
  });

  test('it exists', function (assert) {
    assert.expect(1);
    const route = this.owner.lookup('route:applications');
    assert.ok(route, 'The applications route exists');
  });

  test('redirects to page-not-found when dev flag is not true', function (assert) {
    const transition = { to: { queryParams: { dev: 'false' } } };

    this.route.beforeModel(transition);

    assert.ok(
      this.route.router.replaceWith.calledOnceWith('/page-not-found'),
      'Redirected to /page-not-found when dev is not true',
    );
  });

  test('allows access when dev flag is true', function (assert) {
    const transition = { to: { queryParams: { dev: 'true' } } };

    this.route.beforeModel(transition);

    assert.ok(
      this.route.router.replaceWith.notCalled,
      'No redirection occurs when dev query param is true',
    );
  });

  test('returns null when transitioning to applications.detail', async function (assert) {
    const transition = { to: { name: 'applications.detail' } };

    const result = await this.route.model({}, transition);

    assert.strictEqual(result, null, 'Returns null for detail route');
    assert.ok(this.fetchStub.notCalled, 'No API calls made for detail route');
  });

  test('fetches applications successfully', async function (assert) {
    const mockApplications = [
      { id: 1, userId: 'user1' },
      { id: 2, userId: 'user2' },
    ];

    this.fetchStub
      .onCall(0)
      .resolves(
        new Response(JSON.stringify({ first_name: 'John' }), { status: 200 }),
      );

    this.fetchStub.onCall(1).resolves(
      new Response(JSON.stringify({ applications: mockApplications }), {
        status: 200,
      }),
    );

    const transition = { to: { name: 'applications' } };
    const result = await this.route.model({}, transition);

    assert.deepEqual(result, mockApplications, 'Returns applications from API');
    assert.ok(
      this.fetchStub.firstCall.calledWith(
        SELF_USER_PROFILE_URL,
        sinon.match.object,
      ),
      'First API call is made to check user profile',
    );
    assert.ok(
      this.fetchStub.secondCall.calledWith(
        APPLICATIONS_URL(APPLICATIONS_SIZE),
        sinon.match.object,
      ),
      'Second API call is made to fetch applications',
    );
  });

  test('displays error toast and redirects on 401 response', async function (assert) {
    this.fetchStub.resolves(new Response(JSON.stringify({}), { status: 401 }));

    const transition = { to: { name: 'applications' } };
    const result = await this.route.model({}, transition);

    assert.strictEqual(result, null, 'Returns null for 401');
    assert.ok(this.route.toast.error.calledOnce, 'Error toast is displayed');
  });

  test('displays error toast on API error', async function (assert) {
    this.fetchStub
      .onCall(0)
      .resolves(new Response(JSON.stringify({}), { status: 200 }));
    this.fetchStub
      .onCall(1)
      .resolves(new Response(JSON.stringify({}), { status: 500 }));

    const transition = { to: { name: 'applications' } };
    const result = await this.route.model({}, transition);

    assert.strictEqual(result, null, 'Returns null on error');
    assert.ok(this.route.toast.error.calledOnce, 'Error toast is displayed');
  });
});
