import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Service from '@ember/service';
import { STEP_DATA_STORAGE_KEY } from 'website-www/constants/new-join-form';

module(
  'Integration | Component | new-join-steps/new-step-four',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      localStorage.removeItem(STEP_DATA_STORAGE_KEY.stepFour);
      localStorage.removeItem(STEP_DATA_STORAGE_KEY.stepOne);

      this.setIsPreValid = sinon.stub();
      this.setIsValid = sinon.stub();

      class OnboardingStub extends Service {
        applicationData = null;
      }

      class ToastStub extends Service {
        success = sinon.stub();
        error = sinon.stub();
      }

      this.owner.register('service:onboarding', OnboardingStub);
      this.owner.register('service:toast', ToastStub);
    });

    hooks.afterEach(function () {
      localStorage.removeItem(STEP_DATA_STORAGE_KEY.stepFour);
      localStorage.removeItem(STEP_DATA_STORAGE_KEY.stepOne);
      sinon.restore();
    });

    test('phone number validates valid format', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ role: 'Developer' }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepFour @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      await fillIn('input[name="phoneNumber"]', '+91 80000 00000');
      assert.dom('[data-test-error="phoneNumber"]').doesNotExist();
    });

    test('phone number shows error for invalid format', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ role: 'Developer' }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepFour @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      await fillIn('input[name="phoneNumber"]', 'invalid');
      assert
        .dom('[data-test-error="phoneNumber"]')
        .hasText('Please enter a valid phone number (e.g., +91 80000 00000)');
    });

    test('shows GitHub field for Developer role', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ role: 'Developer' }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepFour @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );
      assert.dom('input[name="github"]').exists();
    });

    test('does not show GitHub field for Designer role', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ role: 'Designer' }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepFour @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );
      assert.dom('input[name="github"]').doesNotExist();
    });

    test('shows Behance and Dribbble for Designer role', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ role: 'Designer' }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepFour @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );
      assert.dom('input[name="behance"]').exists();
      assert.dom('input[name="dribbble"]').exists();
    });

    test('does not show Behance and Dribbble for Developer role', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ role: 'Developer' }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepFour @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );
      assert.dom('input[name="behance"]').doesNotExist();
      assert.dom('input[name="dribbble"]').doesNotExist();
    });

    test('extracts username from URL', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ role: 'Developer' }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepFour @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      await fillIn('input[name="twitter"]', 'https://twitter.com/username');

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepFour),
      );
      assert.strictEqual(storedData.twitter, 'username');
    });

    test('form data persists to localStorage', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ role: 'Developer' }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepFour @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      await fillIn('input[name="twitter"]', 'testuser');

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepFour),
      );
      assert.strictEqual(storedData.twitter, 'testuser');
    });

    test('loads from onboarding service when localStorage is empty', async function (assert) {
      const onboarding = this.owner.lookup('service:onboarding');
      onboarding.applicationData = {
        socialLink: {
          twitter: 'serviceuser',
          linkedin: 'service-linkedin',
          github: 'servicegithub',
          instagram: 'serviceinstagram',
          peerlist: 'servicepeerlist',
        },
      };

      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ role: 'Developer' }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepFour @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepFour),
      );
      assert.strictEqual(storedData.twitter, 'serviceuser');
      assert.strictEqual(storedData.linkedin, 'service-linkedin');
      assert.strictEqual(storedData.github, 'servicegithub');
    });

    test('prefers localStorage over applicationData', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepFour,
        JSON.stringify({
          twitter: 'localuser',
          linkedin: 'local-linkedin',
        }),
      );

      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ role: 'Developer' }),
      );

      const onboarding = this.owner.lookup('service:onboarding');
      onboarding.applicationData = {
        socialLink: { twitter: 'serviceuser', linkedin: 'service-linkedin' },
      };

      await render(
        hbs`<NewJoinSteps::NewStepFour @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepFour),
      );
      assert.strictEqual(storedData.twitter, 'localuser');
      assert.strictEqual(storedData.linkedin, 'local-linkedin');
    });
  },
);
