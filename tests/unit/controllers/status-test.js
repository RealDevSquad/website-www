import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import {
  OOO_STATUS_REQUEST_FAILURE_MESSAGE,
  USER_STATES,
} from 'website-www/constants/user-status';
import Service from '@ember/service';
import sinon from 'sinon';
import { UPDATE_USER_STATUS } from 'website-www/constants/apis';
import { CREATE_OOO_REQUEST_URL } from 'website-www/constants/apis';
import { getUTCMidnightTimestampFromDate } from 'website-www/utils/date-conversion';

class MockToastService extends Service {
  success() {}
  error() {}
}

module('Unit | Controller | status', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:toast', MockToastService);
    this.fetchStub = sinon.stub(window, 'fetch');
  });

  hooks.afterEach(function () {
    this.fetchStub.restore();
  });

  test('it initializes with default values', function (assert) {
    const controller = this.owner.lookup('controller:status');
    assert.false(
      controller.isStatusUpdating,
      'isStatusUpdating is false by default',
    );
    assert.false(
      controller.showUserStateModal,
      'showUserStateModal is false by default',
    );
    assert.strictEqual(
      controller.newStatus,
      undefined,
      'newStatus is undefined by default',
    );
  });

  test('updateStatus sends the correct request', async function (assert) {
    const mockResponse = {
      data: {
        currentStatus: { state: USER_STATES.ACTIVE },
      },
    };

    this.fetchStub.resolves(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const controller = this.owner.lookup('controller:status');
    const newStatus = { currentStatus: { state: 'ACTIVE' } };
    await controller.updateStatus(newStatus);

    assert.ok(this.fetchStub.calledOnce, 'Fetch was called once');
    assert.ok(
      this.fetchStub.calledWith(UPDATE_USER_STATUS),
      'Fetch was called with the correct URL',
    );
  });

  test('updateStatus correctly handles different user states', async function (assert) {
    assert.expect(10);
    const controller = this.owner.lookup('controller:status');
    const toastService = this.owner.lookup('service:toast');
    toastService.success = sinon.spy();
    toastService.error = sinon.spy();

    const mockResponses = {
      ACTIVE: { data: { currentStatus: { state: USER_STATES.ACTIVE } } },
      OOO: { data: { currentStatus: { state: USER_STATES.OOO } } },
      ONBOARDING: {
        data: { currentStatus: { state: USER_STATES.ONBOARDING } },
      },
      IDLE: { data: { currentStatus: { state: USER_STATES.IDLE } } },
      DNE: { data: { currentStatus: { state: USER_STATES.DNE } } },
    };

    const setupFetchResponse = (status) => {
      this.fetchStub.resolves(
        new Response(JSON.stringify(mockResponses[status]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    };

    for (const state of Object.keys(mockResponses)) {
      setupFetchResponse(state);

      const newStatus = { currentStatus: { state: USER_STATES[state] } };
      await controller.updateStatus(newStatus);
      assert.ok(
        toastService.success.calledOnce,
        `Success toast is shown for ${state}`,
      );
      assert.strictEqual(
        controller.status,
        USER_STATES[state],
        `Status is updated to ${state}`,
      );
      toastService.success.resetHistory();
      this.fetchStub.resetHistory();
    }
  });

  test('toggleUserStateModal works with OOO status', function (assert) {
    let controller = this.owner.lookup('controller:status');
    controller.status = USER_STATES.OOO;
    controller.toggleUserStateModal();
    assert.ok(
      controller.showUserStateModal,
      'User state modal is shown for OOO status',
    );
  });

  test('createOOORequest sends correct request and shows success toast (under dev flag)', async function (assert) {
    assert.expect(5);
    const controller = this.owner.lookup('controller:status');
    const toastService = this.owner.lookup('service:toast');
    toastService.success = sinon.spy();
    toastService.error = sinon.spy();

    const from = new Date(Date.now()).toISOString().slice(0, 10);
    const until = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const reason = 'Travel';

    const expectedBody = {
      type: 'OOO',
      from: getUTCMidnightTimestampFromDate(from),
      until: getUTCMidnightTimestampFromDate(until),
      reason,
    };

    const mockSuccessBody = { message: 'OOO request created' };
    this.fetchStub.resolves(
      new Response(JSON.stringify(mockSuccessBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await controller.createOOORequest(from, until, reason);

    assert.ok(this.fetchStub.calledOnce, 'fetch called once');
    const [calledUrl, calledOptions] = this.fetchStub.firstCall.args;
    assert.strictEqual(calledUrl, CREATE_OOO_REQUEST_URL, 'called correct URL');
    assert.deepEqual(
      JSON.parse(calledOptions.body),
      expectedBody,
      'request body matches expected payload',
    );
    assert.ok(toastService.success.calledOnce, 'success toast called');
    assert.false(
      controller.isStatusUpdating,
      'isStatusUpdating reset to false',
    );
  });

  test('createOOORequest shows error toast on non-ok response (under dev flag)', async function (assert) {
    assert.expect(5);
    const controller = this.owner.lookup('controller:status');
    const toastService = this.owner.lookup('service:toast');
    toastService.success = sinon.spy();
    toastService.error = sinon.spy();

    const from = new Date(Date.now()).toISOString().slice(0, 10);
    const until = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const reason = 'Personal';

    const mockErrorBody = { message: OOO_STATUS_REQUEST_FAILURE_MESSAGE };
    this.fetchStub.resolves(
      new Response(JSON.stringify(mockErrorBody), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await controller.createOOORequest(from, until, reason);

    assert.ok(this.fetchStub.calledOnce, 'fetch called once');
    assert.ok(toastService.error.calledOnce, 'error toast called');
    assert.ok(toastService.success.notCalled, 'success toast not called');
    assert.strictEqual(
      toastService.error.firstCall.args[0],
      OOO_STATUS_REQUEST_FAILURE_MESSAGE,
      'error toast uses API message when provided',
    );
    assert.false(
      controller.isStatusUpdating,
      'isStatusUpdating reset to false',
    );
  });
});
