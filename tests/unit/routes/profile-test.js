import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { APPS } from '../../constants/urls';

const BASE_URL = APPS.STAGING_API_BACKEND;

module('Unit | Route | profile', function (hooks) {
  setupTest(hooks);
  hooks.beforeEach(function () {
    this.fetchStub = sinon.stub(window, 'fetch');
    this.route = this.owner.lookup('route:profile');
  });

  hooks.afterEach(function () {
    this.fetchStub.restore();
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:profile');
    assert.ok(route);
  });

  test('it fetches and transforms model data correctly', async function (assert) {
    this.fetchStub.onCall(0).resolves(
      new Response(JSON.stringify({ developerRoleExistsOnUser: true }), {
        status: 200,
      }),
    );

    this.fetchStub.onCall(1).resolves(
      new Response(
        JSON.stringify({
          first_name: 'John',
          last_name: 'Doe',
          company: 'RDS',
          designation: 'developer',
          linkedin_id: '123_@john',
          twitter_id: '123_@john',
          website: 'website.com',
        }),
        { status: 200 },
      ),
    );

    const model = await this.route.model();

    assert.deepEqual(
      model,
      {
        first_name: 'John',
        last_name: 'Doe',
        company: 'RDS',
        designation: 'developer',
        linkedin_id: '123_@john',
        twitter_id: '123_@john',
        website: 'website.com',
        isDeveloper: true,
      },
      'Model data is fetched and transformed correctly',
    );

    assert.ok(
      this.fetchStub.firstCall.calledWith(`${BASE_URL}/users/isDeveloper`, {
        credentials: 'include',
      }),
      'First API call is made to check developer status',
    );

    assert.ok(
      this.fetchStub.secondCall.calledWith(`${BASE_URL}/users?profile=true`, {
        credentials: 'include',
      }),
      'Second API call is made to fetch user data',
    );
  });
});
