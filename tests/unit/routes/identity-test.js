import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import { TOAST_OPTIONS } from 'website-www/constants/toast-options';
import { APPS } from 'website-www/constants/urls';
import sinon from 'sinon';

module('Unit | Route | identity', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.route = this.owner.lookup('route:identity');

    this.route.router = {
      transitionTo: sinon.stub(),
    };
    this.route.toast = {
      error: sinon.stub(),
    };
    this.route.fastboot = {
      isFastBoot: false,
    };
  });

  test('it exists', function (assert) {
    assert.ok(this.route);
  });

  test('model returns null in FastBoot', async function (assert) {
    this.route.fastboot.isFastBoot = true;
    const result = await this.route.model();
    assert.strictEqual(result, null, 'should return null in FastBoot');
  });

  test('model handles 401 unauthorized response', async function (assert) {
    const fetchStub = sinon.stub(window, 'fetch').resolves({
      ok: false,
      status: 401,
    });

    const result = await this.route.model();

    assert.strictEqual(result, null, 'should return null');
    assert.ok(
      this.route.toast.error.calledWith(
        'You are not logged in. Please login to continue.',
        '',
        TOAST_OPTIONS,
      ),
      'should show error toast',
    );

    fetchStub.restore();
  });

  test('model handles successful response with invalid discord role', async function (assert) {
    const fetchStub = sinon.stub(window, 'fetch').resolves({
      ok: true,
      json: () =>
        Promise.resolve({
          roles: {
            in_discord: false,
          },
        }),
    });

    const result = await this.route.model();

    assert.strictEqual(result, null, 'should return null');
    assert.ok(
      this.route.router.transitionTo.calledWith('index'),
      'should redirect to index',
    );

    fetchStub.restore();
  });

  test('model handles network error', async function (assert) {
    const fetchStub = sinon
      .stub(window, 'fetch')
      .rejects(new Error('Network error'));

    const result = await this.route.model();

    assert.deepEqual(result, null, 'should return null');
    assert.ok(
      this.route.router.transitionTo.calledWith('index'),
      'should redirect to index',
    );

    fetchStub.restore();
  });

  test('model handles non-401 error response', async function (assert) {
    const fetchStub = sinon.stub(window, 'fetch').resolves({
      ok: false,
      status: 500,
    });

    const result = await this.route.model();

    assert.strictEqual(result, null, 'should return null');
    assert.ok(
      this.route.router.transitionTo.calledWith('index'),
      'should redirect to index',
    );

    fetchStub.restore();
  });

  test('model handles successful response with valid discord role', async function (assert) {
    const mockData = {
      roles: {
        in_discord: true,
      },
      someOtherData: 'test',
    };

    const fetchStub = sinon.stub(window, 'fetch').resolves({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await this.route.model();

    assert.deepEqual(result, mockData, 'should return the API response data');
    assert.ok(fetchStub.called, 'fetch should be called');

    const [actualUrl, actualOptions] = fetchStub.firstCall.args;

    assert.strictEqual(
      actualUrl,
      `${APPS.API_BACKEND}/users?profile=true`,
      'should call correct URL',
    );

    assert.deepEqual(
      actualOptions,
      {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
      'should pass correct options',
    );

    fetchStub.restore();
  });
});
