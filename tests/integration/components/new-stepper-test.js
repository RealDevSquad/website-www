import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Service from '@ember/service';
import { STEP_DATA_STORAGE_KEY } from 'website-www/constants/new-join-form';
import {
  APPLICATIONS_DATA,
  NEW_STEPS_APPLICATIONS_DATA,
} from 'website-www/tests/constants/application-data';

module('Integration | Component | new-stepper', function (hooks) {
  setupRenderingTest(hooks);

  function seedFormDataToLocalStorage(formData) {
    Object.entries(formData).forEach(([step, data]) => {
      localStorage.setItem(STEP_DATA_STORAGE_KEY[step], JSON.stringify(data));
    });
  }

  function clearFormDataFromLocalStorage() {
    Object.values(STEP_DATA_STORAGE_KEY).forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('isValid');
    localStorage.removeItem('currentStep');
  }

  hooks.beforeEach(function () {
    this.routerService = {
      transitionTo: sinon.stub(),
      replaceWith: sinon.stub(),
      currentRoute: { queryParams: {} },
    };

    const testContext = this;
    class ToastServiceStub extends Service {
      constructor(...args) {
        super(...args);
        this.success = sinon.stub();
        this.error = sinon.stub();
        testContext.toastService = this;
      }
    }

    class OnboardingServiceStub extends Service {
      applicationData = null;
    }
    class JoinApplicationTermsServiceStub extends Service {
      hasUserAcceptedTerms = false;
    }

    this.owner.register('service:router', this.routerService, {
      instantiate: false,
    });
    this.owner.register('service:toast', ToastServiceStub);
    this.owner.register('service:onboarding', OnboardingServiceStub);
    this.owner.register(
      'service:joinApplicationTerms',
      JoinApplicationTermsServiceStub,
    );

    seedFormDataToLocalStorage(NEW_STEPS_APPLICATIONS_DATA);

    this.apiStub = sinon.stub(window, 'fetch').resolves({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ application: { id: 'app-123' } }),
    });
  });

  hooks.afterEach(function () {
    clearFormDataFromLocalStorage();
    sinon.restore();
  });

  module('Edit Application', function (hooks) {
    hooks.beforeEach(function () {
      const onboardingService = this.owner.lookup('service:onboarding');
      onboardingService.applicationData = APPLICATIONS_DATA;
    });

    test('uses PATCH method for updating application', async function (assert) {
      await render(hbs`<NewStepper @step={{6}} @isEditMode={{true}} />`);
      await click('[data-test-button="submit-review"]');

      assert.strictEqual(
        this.apiStub.firstCall.args[1].method,
        'PATCH',
        'Uses PATCH method for editing',
      );
    });

    test('calls correct update API endpoint with application ID', async function (assert) {
      await render(hbs`<NewStepper @step={{6}} @isEditMode={{true}} />`);
      await click('[data-test-button="submit-review"]');

      assert.ok(
        this.apiStub.firstCall.args[0].includes(
          `/applications/${APPLICATIONS_DATA.id}`,
        ),
        'Correct update endpoint called with application ID',
      );
    });

    test('displays success toast with edit-specific message', async function (assert) {
      await render(hbs`<NewStepper @step={{6}} @isEditMode={{true}} />`);
      await click('[data-test-button="submit-review"]');

      assert.ok(
        this.toastService.success.calledWith(
          'You have successfully edited the application',
          'Success!',
        ),
        'Edit success toast displayed',
      );
    });

    test('handles 24hr edit restriction with 409 conflict error', async function (assert) {
      sinon.restore();
      this.apiStub = sinon.stub(window, 'fetch').resolves({
        ok: false,
        status: 409,
        json: () =>
          Promise.resolve({
            message: 'You will be able to edit after 24 hrs.',
          }),
      });

      await render(hbs`<NewStepper @step={{6}} @isEditMode={{true}} />`);
      await click('[data-test-button="submit-review"]');

      assert.ok(
        this.toastService.error.calledWith(
          'You will be able to edit after 24 hrs.',
          'Application Exists!',
        ),
        'Displays 24hr restriction error toast',
      );
      assert.notOk(
        this.routerService.replaceWith.called,
        'Does not redirect when edit blocked',
      );
      assert.notOk(
        this.toastService.success.called,
        'Does not show success toast when edit blocked',
      );
    });

    test('handles server error in edit mode with edit-specific message', async function (assert) {
      sinon.restore();
      this.apiStub = sinon.stub(window, 'fetch').resolves({
        ok: false,
        status: 500,
      });

      await render(hbs`<NewStepper @step={{6}} @isEditMode={{true}} />`);
      await click('[data-test-button="submit-review"]');

      assert.ok(
        this.toastService.error.calledWithMatch(
          'Failed to edit application. Please try again.',
        ),
        'Edit error toast displayed with edit-specific message',
      );
    });

    test('handles network failure in edit mode', async function (assert) {
      sinon.restore();
      sinon.stub(window, 'fetch').rejects(new Error('Network error'));

      await render(hbs`<NewStepper @step={{6}} @isEditMode={{true}} />`);
      await click('[data-test-button="submit-review"]');

      assert.ok(
        this.toastService.error.calledWith(
          'Failed to edit application. Please try again.',
          'Error!',
        ),
        'Network error toast displayed in edit mode',
      );
    });

    test('submit button is disabled during edit submission', async function (assert) {
      let resolveApi;
      const deferredPromise = new Promise((resolve) => {
        resolveApi = resolve;
      });

      sinon.restore();
      sinon.stub(window, 'fetch').returns(deferredPromise);

      await render(hbs`<NewStepper @step={{6}} @isEditMode={{true}} />`);

      const clickPromise = click('[data-test-button="submit-review"]');
      await new Promise((resolve) => setTimeout(resolve, 10));
      assert
        .dom('[data-test-button="submit-review"]')
        .isDisabled('Submit button disabled during edit submission');

      resolveApi({ ok: true, status: 201, json: () => Promise.resolve({}) });
      await clickPromise;
      await settled();
      assert
        .dom('[data-test-button="submit-review"]')
        .isNotDisabled('Submit button enabled after edit completes');
    });

    test('redirects to application detail page after successful edit', async function (assert) {
      await render(hbs`<NewStepper @step={{6}} @isEditMode={{true}} />`);
      await click('[data-test-button="submit-review"]');

      assert.ok(
        this.routerService.transitionTo.calledWith(
          'applications.detail',
          APPLICATIONS_DATA.id,
          {
            queryParams: { dev: true },
          },
        ),
        'Redirects to application detail page after successful edit',
      );
    });
  });

  module('Data Collection and Transformation', function () {
    test('collects and transforms all form data correctly', async function (assert) {
      assert.expect(6);
      await render(hbs`<NewStepper @step={{6}} />`);
      await click('[data-test-button="submit-review"]');

      const submittedData = JSON.parse(this.apiStub.firstCall.args[1].body);

      assert.strictEqual(
        submittedData.firstName,
        NEW_STEPS_APPLICATIONS_DATA.stepOne.firstName,
        'First name collected correctly',
      );
      assert.strictEqual(
        submittedData.role,
        NEW_STEPS_APPLICATIONS_DATA.stepOne.role.toLowerCase(),
        'Role transformed to lowercase format',
      );
      assert.strictEqual(
        submittedData.city,
        NEW_STEPS_APPLICATIONS_DATA.stepOne.city,
        'City collected correctly',
      );
      assert.strictEqual(
        submittedData.country,
        NEW_STEPS_APPLICATIONS_DATA.stepOne.country,
        'Country collected correctly',
      );
      assert.strictEqual(
        submittedData.institution,
        NEW_STEPS_APPLICATIONS_DATA.stepTwo.institution,
        'Institution collected correctly',
      );
      assert.strictEqual(
        submittedData.skills,
        NEW_STEPS_APPLICATIONS_DATA.stepTwo.skills,
        'Skills collected correctly',
      );
    });

    test('groups social links under socialLink property', async function (assert) {
      await render(hbs`<NewStepper @step={{6}} />`);
      await click('[data-test-button="submit-review"]');

      const submittedData = JSON.parse(this.apiStub.firstCall.args[1].body);

      assert.deepEqual(
        submittedData.socialLink,
        NEW_STEPS_APPLICATIONS_DATA.stepFour,
        'Social links grouped correctly',
      );
      assert.strictEqual(
        submittedData.socialLink.github,
        NEW_STEPS_APPLICATIONS_DATA.stepFour.github,
        'GitHub link correct',
      );
      assert.strictEqual(
        submittedData.socialLink.linkedin,
        NEW_STEPS_APPLICATIONS_DATA.stepFour.linkedin,
        'LinkedIn link correct',
      );
    });

    test('handles empty form data gracefully', async function (assert) {
      clearFormDataFromLocalStorage();
      Object.values(STEP_DATA_STORAGE_KEY).forEach((key) => {
        localStorage.setItem(key, '{}');
      });

      await render(hbs`<NewStepper @step={{6}} />`);
      await click('[data-test-button="submit-review"]');

      const submittedData = JSON.parse(this.apiStub.firstCall.args[1].body);

      assert.notOk(submittedData.role, 'Empty role handled correctly');
      assert.strictEqual(
        submittedData.numberOfHours,
        0,
        'Empty hours defaults to 0',
      );
      assert.ok(
        submittedData.socialLink,
        'Social link object exists even when empty',
      );
    });
  });

  module('LocalStorage Management', function () {
    test('clears all step data from localStorage after successful submission', async function (assert) {
      assert.expect(5);

      Object.values(STEP_DATA_STORAGE_KEY).forEach((key) => {
        localStorage.setItem(key, JSON.stringify({ test: 'data' }));
      });

      await render(hbs`<NewStepper @step={{6}} />`);
      await click('[data-test-button="submit-review"]');

      Object.values(STEP_DATA_STORAGE_KEY).forEach((key) => {
        assert.strictEqual(
          localStorage.getItem(key),
          null,
          `${key} removed from localStorage`,
        );
      });
    });

    test('clears validation and step tracking from localStorage', async function (assert) {
      localStorage.setItem('isValid', 'true');
      localStorage.setItem('currentStep', '6');

      await render(hbs`<NewStepper @step={{6}} />`);
      await click('[data-test-button="submit-review"]');

      assert.strictEqual(
        localStorage.getItem('isValid'),
        null,
        'isValid removed',
      );
      assert.strictEqual(
        localStorage.getItem('currentStep'),
        null,
        'currentStep removed',
      );
    });

    test('does not clear localStorage when submission fails', async function (assert) {
      sinon.restore();
      this.apiStub = sinon.stub(window, 'fetch').resolves({
        ok: false,
        status: 500,
        message: 'Error',
      });
      localStorage.setItem('isValid', 'true');

      await render(hbs`<NewStepper @step={{6}} />`);
      await click('[data-test-button="submit-review"]');

      assert.strictEqual(
        localStorage.getItem('isValid'),
        'true',
        'localStorage preserved on error',
      );
    });
  });
});
