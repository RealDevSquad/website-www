import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { STEP_DATA_STORAGE_KEY } from 'website-www/constants/new-join-form';

module(
  'Integration | Component | new-join-steps/new-step-six',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      this.navigateToStep = sinon.stub();
      Object.values(STEP_DATA_STORAGE_KEY).forEach((key) => {
        localStorage.removeItem(key);
      });
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    test('displays profile image when available', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          imageUrl: 'https://example.com/img.jpg',
        }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepSix @navigateToStep={{this.navigateToStep}} />`,
      );

      assert.dom('[data-test="profile-image"]').exists();
    });

    test('shows not uploaded when no profile image', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ firstName: 'John', lastName: 'Doe' }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepSix @navigateToStep={{this.navigateToStep}} />`,
      );

      assert.dom('[data-test="field-empty"]').exists();
    });

    test('shows Not provided for empty fields', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepSix @navigateToStep={{this.navigateToStep}} />`,
      );

      assert.dom('[data-test="field-value"]').hasText('Not provided');
    });

    test('does not show GitHub for non-Developer role', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({
          role: 'Designer',
          firstName: 'John',
          lastName: 'Doe',
        }),
      );
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepFour,
        JSON.stringify({ github: 'johngithub' }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepSix @navigateToStep={{this.navigateToStep}} />`,
      );

      assert.dom('[data-test="field-label"]').doesNotIncludeText('GitHub');
    });

    test('edit buttons are present for each section', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          role: 'Developer',
        }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepSix @navigateToStep={{this.navigateToStep}} />`,
      );

      assert.dom('[data-test-button="edit-step-1"]').exists();
      assert.dom('[data-test-button="edit-step-2"]').exists();
      assert.dom('[data-test-button="edit-step-3"]').exists();
      assert.dom('[data-test-button="edit-step-4"]').exists();
      assert.dom('[data-test-button="edit-step-5"]').exists();
    });

    test('edit button calls navigateToStep with correct step number', async function (assert) {
      localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          role: 'Developer',
        }),
      );

      await render(
        hbs`<NewJoinSteps::NewStepSix @navigateToStep={{this.navigateToStep}} />`,
      );

      await click('[data-test-button="edit-step-1"]');
      assert.true(this.navigateToStep.calledWith(1));

      await click('[data-test-button="edit-step-2"]');
      assert.true(this.navigateToStep.calledWith(2));
    });
  },
);
