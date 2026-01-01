import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import { settled } from '@ember/test-helpers';
import sinon from 'sinon';
import {
  AUTH_STATUS,
  MOBILE_LOGIN_SUCCESS_MESSAGE,
  REQUEST_CANCEL_MESSAGE,
} from 'website-www/constants/auth-status';
import { ERROR_MESSAGES } from 'website-www/constants/error-messages';
import {
  QR_AUTHORIZATION_STATUS_URL,
  USER_AUTHENTICATED_DEVICES_URL,
} from 'website-www/constants/apis';

module('Unit | Controller | mobile', function (hooks) {
  setupTest(hooks);

  let controller;
  let fetchStub;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:mobile');
    controller.toast = {
      success: sinon.stub(),
      error: sinon.stub(),
    };
    controller.router = {
      transitionTo: sinon.stub(),
    };
    fetchStub = sinon.stub(window, 'fetch');
  });

  hooks.afterEach(function () {
    fetchStub.restore();
  });

  test('makes correct API call with given auth status', async function (assert) {
    fetchStub.resolves(new Response(null, { status: 200 }));

    await controller.updateQRAuthStatus(AUTH_STATUS.AUTHORIZED);

    assert.ok(
      fetchStub.calledWith(
        `${QR_AUTHORIZATION_STATUS_URL}/${AUTH_STATUS.AUTHORIZED}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      ),
      'Makes correct API call',
    );
  });

  test('handles successful authorization when user confirms', async function (assert) {
    fetchStub.resolves(new Response(null, { status: 200 }));

    await controller.authorizeDeviceAccess();
    await settled();

    assert.ok(
      controller.router.transitionTo.calledWith('/'),
      'Redirects to home',
    );
    assert.ok(
      controller.toast.success.calledWith(
        MOBILE_LOGIN_SUCCESS_MESSAGE,
        'Success',
      ),
      'Shows success toast',
    );
  });

  test('handles failed authorization when user confirms', async function (assert) {
    fetchStub.resolves(new Response(null, { status: 400 }));

    await controller.authorizeDeviceAccess();
    await settled();

    assert.ok(
      controller.toast.error.calledWith(
        ERROR_MESSAGES.somethingWentWrong,
        'Error!',
        sinon.match.object,
      ),
      'Shows error toast',
    );
  });

  test('handles rejection when user cancels', async function (assert) {
    fetchStub.resolves(new Response(null, { status: 200 }));

    await controller.rejectDeviceAccess();
    await settled();

    assert.ok(
      controller.toast.success.calledWith(REQUEST_CANCEL_MESSAGE, 'Success'),
      'Shows cancel success message',
    );
  });

  test('handles error when rejection fails', async function (assert) {
    fetchStub.resolves(new Response(null, { status: 400 }));

    await controller.rejectDeviceAccess();
    await settled();

    assert.ok(
      controller.toast.error.calledWith(
        ERROR_MESSAGES.somethingWentWrong,
        'Error!',
        sinon.match.object,
      ),
      'Shows error toast',
    );
  });

  test('initiates verification flow when device info fetch succeeds', async function (assert) {
    fetchStub.resolves(new Response(null, { status: 200 }));

    await controller.verifyQRScanned();
    await settled();

    assert.ok(
      fetchStub.calledWith(USER_AUTHENTICATED_DEVICES_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }),
      'Makes device info API call',
    );
  });

  test('shows error toast when device info fetch fails', async function (assert) {
    fetchStub.rejects(new Error('Network error'));

    await controller.verifyQRScanned();
    await settled();

    assert.ok(
      controller.toast.error.calledWith(
        ERROR_MESSAGES.somethingWentWrong,
        'Error!',
        sinon.match.object,
      ),
      'Shows error toast',
    );
  });
});
