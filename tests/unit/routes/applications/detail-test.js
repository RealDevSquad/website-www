import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import sinon from 'sinon';
import {
  APPLICATIONS_BY_USER_URL,
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

  test('fetches application by userId successfully', async function (assert) {
    const mockApplications = [
      { id: '123', userId: 'user1', status: 'pending' },
    ];
    const mockUser = { first_name: 'John', id: 'user1' };

    this.fetchStub
      .onCall(0)
      .resolves(new Response(JSON.stringify(mockUser), { status: 200 }));

    this.fetchStub.onCall(1).resolves(
      new Response(JSON.stringify({ applications: mockApplications }), {
        status: 200,
      }),
    );

    const result = await this.route.model({ id: '123' }); // params.id still passed but unused

    assert.deepEqual(
      result,
      { application: mockApplications[0], currentUser: mockUser },
      'Returns first application and currentUser from API',
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
        APPLICATIONS_BY_USER_URL('user1'),
        sinon.match.object,
      ),
      'Second API call is made to fetch applications by userId',
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
      .resolves(new Response(JSON.stringify({ id: 'user1' }), { status: 200 }));
    this.fetchStub
      .onCall(1)
      .resolves(
        new Response(JSON.stringify({ applications: [] }), { status: 404 }),
      );

    const result = await this.route.model({ id: '123' });

    assert.deepEqual(
      result,
      { application: null, currentUser: { id: 'user1' } },
      'Returns null application for 404 but returns user',
    );
    assert.ok(
      this.fetchStub.secondCall.calledWith(
        APPLICATIONS_BY_USER_URL('user1'),
        sinon.match.object,
      ),
      'API call is made to fetch applications by userId',
    );
    assert.ok(this.toast.error.calledOnce, 'Error toast is displayed for 404');
  });

  test('handles empty applications array gracefully', async function (assert) {
    this.fetchStub
      .onCall(0)
      .resolves(new Response(JSON.stringify({ id: 'user1' }), { status: 200 }));
    this.fetchStub
      .onCall(1)
      .resolves(
        new Response(JSON.stringify({ applications: [] }), { status: 200 }),
      );

    const result = await this.route.model({ id: '123' });

    assert.deepEqual(
      result,
      { application: null, currentUser: { id: 'user1' } },
      'Returns null application when array is empty',
    );
    assert.ok(
      this.fetchStub.secondCall.calledWith(
        APPLICATIONS_BY_USER_URL('user1'),
        sinon.match.object,
      ),
      'API call is made to fetch applications by userId',
    );
  });

  test('handles missing userId in user data', async function (assert) {
    this.fetchStub
      .onCall(0)
      .resolves(
        new Response(JSON.stringify({ first_name: 'John' }), { status: 200 }),
      );

    const result = await this.route.model({ id: '123' });

    assert.deepEqual(
      result,
      { application: null, currentUser: { first_name: 'John' } },
      'Returns null application when userId is missing',
    );
    assert.ok(
      this.toast.error.calledOnce,
      'Error toast is displayed for missing userId',
    );
  });
});
