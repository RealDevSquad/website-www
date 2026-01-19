import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import sinon from 'sinon';
import {
  APPLICATION_BY_ID_URL,
  SELF_USER_PROFILE_URL,
} from 'website-www/constants/apis';

module('Unit | Route | applications/detail', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.fetchStub = sinon.stub(window, 'fetch');
    this.route = this.owner.lookup('route:applications/detail');
    sinon.stub(this.route.toast, 'error');
  });

  hooks.afterEach(function () {
    this.fetchStub.restore();
    sinon.restore();
  });

  test('it exists', function (assert) {
    assert.expect(1);
    const route = this.owner.lookup('route:applications/detail');
    assert.ok(route, 'The applications/detail route exists');
  });

  test('fetches application by id successfully', async function (assert) {
    const mockApplication = { id: '123', userId: 'user1' };
    const mockUser = { first_name: 'John' };
    const applicationId = '123';

    this.fetchStub
      .onCall(0)
      .resolves(new Response(JSON.stringify(mockUser), { status: 200 }));

    this.fetchStub.onCall(1).resolves(
      new Response(JSON.stringify({ application: mockApplication }), {
        status: 200,
      }),
    );

    const result = await this.route.model({ id: applicationId });

    assert.deepEqual(
      result,
      { application: mockApplication, currentUser: mockUser },
      'Returns application and currentUser from API',
    );
    assert.ok(
      this.fetchStub.firstCall.calledWith(
        SELF_USER_PROFILE_URL,
        sinon.match.object,
      ),
      'First API call is made to check user profile',
    );
    assert.ok(
      this.fetchStub.secondCall.calledWith(
        APPLICATION_BY_ID_URL(applicationId),
        sinon.match.object,
      ),
      'Second API call is made to fetch application by id',
    );
  });

  test('displays error toast and redirects on 401 response', async function (assert) {
    this.fetchStub.resolves(new Response(JSON.stringify({}), { status: 401 }));

    const result = await this.route.model({ id: '123' });

    assert.deepEqual(
      result,
      { application: null, currentUser: null },
      'Returns null object for 401',
    );
    assert.ok(this.route.toast.error.calledOnce, 'Error toast is displayed');
  });

  test('displays error toast on 404 response', async function (assert) {
    this.fetchStub
      .onCall(0)
      .resolves(new Response(JSON.stringify({}), { status: 200 }));
    this.fetchStub
      .onCall(1)
      .resolves(new Response(JSON.stringify({}), { status: 404 }));

    const result = await this.route.model({ id: '123' });

    assert.deepEqual(
      result,
      { application: null, currentUser: null },
      'Returns null object for 404',
    );
    assert.ok(
      this.route.toast.error.calledOnce,
      'Error toast is displayed for 404',
    );
  });

  test('displays error toast on API error', async function (assert) {
    this.fetchStub
      .onCall(0)
      .resolves(new Response(JSON.stringify({}), { status: 200 }));
    this.fetchStub
      .onCall(1)
      .resolves(new Response(JSON.stringify({}), { status: 500 }));

    const result = await this.route.model({ id: '123' });

    assert.deepEqual(
      result,
      { application: null, currentUser: null },
      'Returns null object on error',
    );
    assert.ok(this.route.toast.error.calledOnce, 'Error toast is displayed');
  });
});
