import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import sinon from 'sinon';
import { STEP_DATA_STORAGE_KEY } from 'website-www/constants/new-join-form';
import { APPLICATIONS_DATA } from '../../constants/application-data';

module('Integration | Component | new-join-steps/base-step', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.isPreValid = () => {};

    class OnboardingStub extends Service {
      applicationData = null;
    }

    class ToastStub extends Service {
      success = sinon.stub();
      error = sinon.stub();
    }

    this.owner.register('service:onboarding', OnboardingStub);
    this.owner.register('service:toast', ToastStub);

    const onboarding = this.owner.lookup('service:onboarding');
    onboarding.applicationData = APPLICATIONS_DATA;
  });

  hooks.afterEach(async function () {
    Object.values(STEP_DATA_STORAGE_KEY).forEach((key) =>
      localStorage.removeItem(key),
    );
    localStorage.removeItem('isValid');
    localStorage.removeItem('currentStep');
  });

  test('initializeFormState prefers localStorage over applicationData', async function (assert) {
    localStorage.setItem(
      'newStepOneData',
      JSON.stringify({
        firstName: 'Local',
        lastName: 'Storage',
        role: 'Designer',
      }),
    );

    await render(
      hbs`<NewJoinSteps::NewStepOne @setIsPreValid={{this.isPreValid}} @isValid={{true}} @setIsValid={{this.isPreValid}} />`,
    );

    const stepOneData = JSON.parse(localStorage.getItem('newStepOneData'));
    assert.strictEqual(stepOneData.firstName, 'Local');
    assert.strictEqual(stepOneData.lastName, 'Storage');
    assert.strictEqual(stepOneData.role, 'Designer');
    assert.notStrictEqual(
      stepOneData.firstName,
      APPLICATIONS_DATA.biodata.firstName,
    );
  });

  test('initializeFormState loads from applicationData when localStorage empty', async function (assert) {
    await render(
      hbs`<NewJoinSteps::NewStepOne @setIsPreValid={{this.isPreValid}} @isValid={{true}} @setIsValid={{this.isPreValid}} />`,
    );

    const stepOneData = JSON.parse(
      localStorage.getItem(STEP_DATA_STORAGE_KEY.stepOne),
    );
    assert.strictEqual(
      stepOneData.firstName,
      APPLICATIONS_DATA.biodata.firstName,
    );
    assert.strictEqual(
      stepOneData.lastName,
      APPLICATIONS_DATA.biodata.lastName,
    );
    assert.strictEqual(stepOneData.city, APPLICATIONS_DATA.location.city);
  });

  test('initializeFormState loads stepTwo data from applicationData', async function (assert) {
    await render(
      hbs`<NewJoinSteps::NewStepTwo @setIsPreValid={{this.isPreValid}} @isValid={{true}} @setIsValid={{this.isPreValid}} />`,
    );

    const stepTwoData = JSON.parse(
      localStorage.getItem(STEP_DATA_STORAGE_KEY.stepTwo),
    );
    assert.strictEqual(
      stepTwoData.institution,
      APPLICATIONS_DATA.professional.institution,
    );
    assert.strictEqual(
      stepTwoData.skills,
      APPLICATIONS_DATA.professional.skills,
    );
    assert.strictEqual(
      stepTwoData.introduction,
      APPLICATIONS_DATA.intro.introduction,
    );
  });

  test('initializeFormState loads stepThree data from applicationData', async function (assert) {
    await render(
      hbs`<NewJoinSteps::NewStepThree @setIsPreValid={{this.isPreValid}} @isValid={{true}} @setIsValid={{this.isPreValid}} />`,
    );

    const stepThreeData = JSON.parse(
      localStorage.getItem(STEP_DATA_STORAGE_KEY.stepThree),
    );
    assert.strictEqual(stepThreeData.forFun, APPLICATIONS_DATA.intro.forFun);
    assert.strictEqual(stepThreeData.funFact, APPLICATIONS_DATA.intro.funFact);
  });

  test('initializeFormState loads stepFour data from applicationData', async function (assert) {
    await render(
      hbs`<NewJoinSteps::NewStepFour @setIsPreValid={{this.isPreValid}} @isValid={{true}} @setIsValid={{this.isPreValid}} />`,
    );

    const stepFourData = JSON.parse(
      localStorage.getItem(STEP_DATA_STORAGE_KEY.stepFour),
    );
    assert.strictEqual(
      stepFourData.twitter,
      APPLICATIONS_DATA.socialLink.twitter,
    );
    assert.strictEqual(
      stepFourData.instagram,
      APPLICATIONS_DATA.socialLink.instagram,
    );
  });

  test('initializeFormState loads stepFive data from applicationData', async function (assert) {
    await render(
      hbs`<NewJoinSteps::NewStepFive @setIsPreValid={{this.isPreValid}} @isValid={{true}} @setIsValid={{this.isPreValid}} />`,
    );

    const stepFiveData = JSON.parse(
      localStorage.getItem(STEP_DATA_STORAGE_KEY.stepFive),
    );
    assert.strictEqual(stepFiveData.whyRds, APPLICATIONS_DATA.intro.whyRds);
    assert.strictEqual(stepFiveData.foundFrom, APPLICATIONS_DATA.foundFrom);
    assert.strictEqual(
      stepFiveData.numberOfHours,
      APPLICATIONS_DATA.intro.numberOfHours,
    );
  });
});
