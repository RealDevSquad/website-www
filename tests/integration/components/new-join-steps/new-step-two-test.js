import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Service from '@ember/service';
import { STEP_DATA_STORAGE_KEY } from 'website-www/constants/new-join-form';

module(
  'Integration | Component | new-join-steps/new-step-two',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      localStorage.removeItem(STEP_DATA_STORAGE_KEY.stepTwo);

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
      localStorage.removeItem(STEP_DATA_STORAGE_KEY.stepTwo);
      sinon.restore();
    });

    test('skills field validates minimum and maximum word count', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepTwo @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      await fillIn('input[name="skills"]', 'js');

      assert
        .dom('[data-test-error="skills"]')
        .includesText('more word(s) required');

      const longText = Array(21).fill('word').join(' ');
      await fillIn('input[name="skills"]', longText);

      assert
        .dom('[data-test-error="skills"]')
        .hasText('Maximum 20 words allowed');
    });

    test('institution field shows error when empty', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepTwo @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      await fillIn('input[name="institution"]', '');

      assert
        .dom('[data-test-error="institution"]')
        .includesText('more word(s) required');
    });

    test('introduction validates min and max word count', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepTwo @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      await fillIn('textarea[name="introduction"]', 'short text');

      assert
        .dom('[data-test-error="introduction"]')
        .includesText('more word(s) required');

      const longText = Array(501).fill('word').join(' ');
      await fillIn('textarea[name="introduction"]', longText);

      assert
        .dom('[data-test-error="introduction"]')
        .hasText('Maximum 500 words allowed');
    });

    test('form data persists to localStorage on input', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepTwo @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      await fillIn('input[name="skills"]', 'JavaScript React Node');

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepTwo),
      );
      assert.strictEqual(storedData.skills, 'JavaScript React Node');
    });

    test('loads from onboarding service when localStorage is empty', async function (assert) {
      const onboarding = this.owner.lookup('service:onboarding');
      onboarding.applicationData = {
        professional: { skills: 'Ember JS', institution: 'MIT' },
        intro: { introduction: 'Experienced developer' },
      };

      await render(
        hbs`<NewJoinSteps::NewStepTwo @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepTwo),
      );
      assert.strictEqual(storedData.skills, 'Ember JS');
      assert.strictEqual(storedData.institution, 'MIT');
      assert.strictEqual(storedData.introduction, 'Experienced developer');
    });

    test('prefers localStorage over applicationData', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepTwo,
        JSON.stringify({
          skills: 'Local Skills',
          institution: 'Local Institution',
          introduction: 'Local Introduction',
        }),
      );

      const onboarding = this.owner.lookup('service:onboarding');
      onboarding.applicationData = {
        professional: {
          skills: 'Service Skills',
          institution: 'Service Institution',
        },
        intro: { introduction: 'Service Introduction' },
      };

      await render(
        hbs`<NewJoinSteps::NewStepTwo @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const storedData = JSON.parse(
        localStorage.getItem(STEP_DATA_STORAGE_KEY.stepTwo),
      );
      assert.strictEqual(storedData.skills, 'Local Skills');
      assert.strictEqual(storedData.institution, 'Local Institution');
      assert.strictEqual(storedData.introduction, 'Local Introduction');
    });
  },
);
