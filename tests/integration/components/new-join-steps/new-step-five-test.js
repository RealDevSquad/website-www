import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Service from '@ember/service';
import { STEP_DATA_STORAGE_KEY } from 'website-www/constants/new-join-form';

module(
  'Integration | Component | new-join-steps/new-step-five',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      localStorage.removeItem(STEP_DATA_STORAGE_KEY.stepFive);

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
      localStorage.removeItem(STEP_DATA_STORAGE_KEY.stepFive);
      sinon.restore();
    });

    test('whyRds validates minimum word count', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepFive @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      await fillIn('textarea[name="whyRds"]', 'short');

      assert
        .dom('[data-test-error="whyRds"]')
        .includesText('more word(s) required');
    });

    test('form data persists to localStorage', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepFive @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      await fillIn(
        'textarea[name="whyRds"]',
        'I want to join because it is great',
      );

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepFive),
      );
      assert.strictEqual(
        storedData.whyRds,
        'I want to join because it is great',
      );
    });

    test('loads from onboarding service when localStorage is empty', async function (assert) {
      const onboarding = this.owner.lookup('service:onboarding');
      onboarding.applicationData = {
        intro: { whyRds: 'Because it is awesome', numberOfHours: 15 },
        foundFrom: 'Twitter',
      };

      await render(
        hbs`<NewJoinSteps::NewStepFive @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepFive),
      );
      assert.strictEqual(storedData.whyRds, 'Because it is awesome');
      assert.strictEqual(storedData.numberOfHours, 15);
      assert.strictEqual(storedData.foundFrom, 'Twitter');
    });

    test('prefers localStorage over applicationData', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepFive,
        JSON.stringify({
          whyRds: 'Local Reason',
          numberOfHours: 10,
          foundFrom: 'LinkedIn',
        }),
      );

      const onboarding = this.owner.lookup('service:onboarding');
      onboarding.applicationData = {
        intro: { whyRds: 'Service Reason', numberOfHours: 20 },
        foundFrom: 'Twitter',
      };

      await render(
        hbs`<NewJoinSteps::NewStepFive @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepFive),
      );
      assert.strictEqual(storedData.whyRds, 'Local Reason');
      assert.strictEqual(storedData.numberOfHours, 10);
      assert.strictEqual(storedData.foundFrom, 'LinkedIn');
    });
  },
);
