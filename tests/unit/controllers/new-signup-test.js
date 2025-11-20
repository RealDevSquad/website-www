import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'website-www/tests/helpers';
import {
  SIGNUP_ERROR_MESSAGES,
  NEW_SIGNUP_STEPS,
} from 'website-www/constants/new-signup';
import { fakeUserData } from 'website-www/tests/constants/users-data';
import { TOAST_OPTIONS } from 'website-www/constants/toast-options';

module('Unit | Controller | new-signup', function (hooks) {
  setupTest(hooks);

  let controller;
  let fetchStub;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:new-signup');
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
    sinon.restore();
    fetchStub.restore();
  });

  test('correct initial currentStep for signup and step transitions', function (assert) {
    assert.strictEqual(
      controller.currentStep,
      NEW_SIGNUP_STEPS[0],
      'Starts at get-started step',
    );

    controller.send('changeStep', NEW_SIGNUP_STEPS[1]);
    assert.strictEqual(
      controller.currentStep,
      NEW_SIGNUP_STEPS[1],
      'Step updated to firstName',
    );

    controller.send('changeStep', NEW_SIGNUP_STEPS[2]);
    assert.strictEqual(
      controller.currentStep,
      NEW_SIGNUP_STEPS[2],
      'Step updated to lastName',
    );

    controller.send('changeStep', NEW_SIGNUP_STEPS[3]);
    assert.strictEqual(
      controller.currentStep,
      NEW_SIGNUP_STEPS[3],
      'Step updated to username',
    );

    controller.send('changeStep', NEW_SIGNUP_STEPS[4]);
    assert.strictEqual(
      controller.currentStep,
      NEW_SIGNUP_STEPS[4],
      'Step updated to role',
    );
  });

  test('handleInputChange correctly updates value', function (assert) {
    controller.send('handleInputChange', 'firstName', fakeUserData.first_name);
    assert.strictEqual(
      controller.signupDetails.firstName,
      fakeUserData.first_name,
      'First name updated',
    );

    controller.send('handleInputChange', 'lastName', fakeUserData.last_name);
    assert.strictEqual(
      controller.signupDetails.lastName,
      fakeUserData.last_name,
      'Last name updated',
    );

    controller.send('handleInputChange', 'username', fakeUserData.username);
    assert.strictEqual(
      controller.signupDetails.username,
      fakeUserData.username,
      'User name updated',
    );
  });

test('handleCheckboxInputChange updates role and toggles button state', function (assert) {
  controller.send('handleCheckboxInputChange', 'developer');
  assert.equal(controller.signupDetails.role, 'developer');
  assert.false(
    controller.isButtonDisabled,
    'Button enabled when one role is selected',
  );

  controller.send('handleCheckboxInputChange', 'developer');
  assert.equal(
    controller.signupDetails.role,
    'developer',
    'Role remains selected when same role is chosen again',
  );
  assert.false(
    controller.isButtonDisabled,
    'Button remains enabled when role is selected',
  );

  controller.send('handleCheckboxInputChange', '');
  assert.strictEqual(
    controller.signupDetails.role,
    '',
    'Role is unset when empty value is passed',
  );
  assert.true(
    controller.isButtonDisabled,
    'Button disabled when no role selected',
  );
});

  test('generateUsername returns username on success', async function (assert) {
    fetchStub.resolves({
      json: () => Promise.resolve(fakeUserData),
    });

    const result = await controller.generateUsername(
      fakeUserData.first_name,
      fakeUserData.last_name,
    );
    assert.strictEqual(
      result,
      fakeUserData.username,
      'Generated username returned successfully',
    );
  });

  test('generateUsername shows error toast on failure', async function (assert) {
    fetchStub.rejects(new Error(SIGNUP_ERROR_MESSAGES.usernameGeneration));

    await assert.rejects(
      controller.generateUsername(
        fakeUserData.first_name,
        fakeUserData.last_name,
      ),
      new Error(SIGNUP_ERROR_MESSAGES.usernameGeneration),
      'Function should throw the correct error',
    );

    assert.ok(
      controller.toast.error.calledOnce,
      'Toast error should be called once',
    );
    assert.ok(
      controller.toast.error.calledWith(
        SIGNUP_ERROR_MESSAGES.usernameGeneration,
        'error!',
        TOAST_OPTIONS,
      ),
      'Toast error should be called with correct parameters',
    );
  });

  test('signup handles successful flow', async function (assert) {
    const controller = this.owner.lookup('controller:new-signup');

    controller.dev = 'false';
    controller.signupDetails = {
      firstName: fakeUserData.first_name,
      lastName: fakeUserData.last_name,
    };

    sinon.stub(controller, 'generateUsername').resolves(fakeUserData.username);
    sinon.stub(controller, 'checkUserName').resolves(true);
    sinon.stub(controller, 'registerUser').resolves({ status: 204 });

    await controller.signup();

    assert.strictEqual(
      controller.currentStep,
      controller.LAST_STEP,
      'Successfully moved to LAST_STEP',
    );
  });

  test('signup catches error and shows correct error message', async function (assert) {
    controller.dev = 'false';
    controller.signupDetails = {
      firstName: fakeUserData.first_name,
      lastName: fakeUserData.last_name,
    };

    sinon.stub(controller, 'generateUsername').resolves(fakeUserData.username);
    sinon.stub(controller, 'checkUserName').resolves(true);
    sinon
      .stub(controller, 'registerUser')
      .throws(new Error(SIGNUP_ERROR_MESSAGES.others));

    await controller.signup();

    assert.strictEqual(
      controller.error,
      SIGNUP_ERROR_MESSAGES.others,
      'Error message shown',
    );
    assert.false(controller.isLoading, 'Loading state reset');
    assert.false(controller.isButtonDisabled, 'Button re-enabled after error');
  });

  test('signup catches error and shows correct error message (dev flag enabled)', async function (assert) {
    controller.signupDev = 'true'; // replace signupDev with dev once dev is removed from new-signup
    controller.signupDetails = {
      firstName: fakeUserData.first_name,
      lastName: fakeUserData.last_name,
      roles: 'developer',
    };

    sinon.stub(controller, 'checkUserName').resolves(true);
    sinon
      .stub(controller, 'registerUser')
      .throws(new Error(SIGNUP_ERROR_MESSAGES.others));

    await controller.signup();

    assert.strictEqual(
      controller.error,
      SIGNUP_ERROR_MESSAGES.others,
      'Error message shown',
    );
    assert.false(controller.isLoading, 'Loading state reset');
    assert.false(controller.isButtonDisabled, 'Button re-enabled after error');
  });
});
