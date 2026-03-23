import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Service from '@ember/service';
import { STEP_DATA_STORAGE_KEY } from 'website-www/constants/new-join-form';

module(
  'Integration | Component | new-join-steps/new-step-three',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      localStorage.removeItem(STEP_DATA_STORAGE_KEY.stepThree);

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
      localStorage.removeItem(STEP_DATA_STORAGE_KEY.stepThree);
      sinon.restore();
    });

    test('forFun validates minimum and maximum word count', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepThree @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );
      await fillIn('textarea[name="forFun"]', 'short');

      assert
        .dom('[data-test-error="forFun"]')
        .includesText('more word(s) required');

      const longText = Array(501).fill('word').join(' ');
      await fillIn('textarea[name="forFun"]', longText);

      assert
        .dom('[data-test-error="forFun"]')
        .hasText('Maximum 500 words allowed');
    });

    test('funFact validates minimum and maximum word count', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepThree @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );
      await fillIn('textarea[name="funFact"]', 'short');

      assert
        .dom('[data-test-error="funFact"]')
        .includesText('more word(s) required');

      const longText = Array(501).fill('word').join(' ');
      await fillIn('textarea[name="funFact"]', longText);

      assert
        .dom('[data-test-error="funFact"]')
        .hasText('Maximum 500 words allowed');
    });

    test('word count displays correctly for forFun', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepThree @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );
      await fillIn('textarea[name="forFun"]', 'one two three');
      assert.dom('[data-test-word-count="forFun"]').hasText('3/500 words');
    });

    test('word count displays correctly for funFact', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepThree @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );
      await fillIn('textarea[name="funFact"]', 'one two three four five');
      assert.dom('[data-test-word-count="funFact"]').hasText('5/500 words');
    });

    test('form data persists to localStorage', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepThree @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );
      await fillIn('textarea[name="forFun"]', 'I love coding');

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepThree),
      );
      assert.strictEqual(storedData.forFun, 'I love coding');
    });

    test('loads from onboarding service when localStorage is empty', async function (assert) {
      const onboarding = this.owner.lookup('service:onboarding');
      onboarding.applicationData = {
        intro: { forFun: 'Hiking', funFact: 'I code for fun' },
      };

      await render(
        hbs`<NewJoinSteps::NewStepThree @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepThree),
      );
      assert.strictEqual(storedData.forFun, 'Hiking');
      assert.strictEqual(storedData.funFact, 'I code for fun');
    });

    test('prefers localStorage over applicationData', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepThree,
        JSON.stringify({
          forFun: 'Local Hobbies',
          funFact: 'Local Fact',
        }),
      );

      const onboarding = this.owner.lookup('service:onboarding');
      onboarding.applicationData = {
        intro: { forFun: 'Service Hobbies', funFact: 'Service Fact' },
      };

      await render(
        hbs`<NewJoinSteps::NewStepThree @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepThree),
      );
      assert.strictEqual(storedData.forFun, 'Local Hobbies');
      assert.strictEqual(storedData.funFact, 'Local Fact');
    });
  },
);
