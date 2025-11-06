import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | new-join-steps/stepper-header',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders current/total and progress width correctly', async function (assert) {
      assert.expect(5);

      this.setProperties({ currentStep: 2, totalSteps: 5 });

      await render(hbs`
      <NewJoinSteps::StepperHeader
        @currentStep={{this.currentStep}}
        @totalSteps={{this.totalSteps}}
      />
    `);

      assert.dom('[data-test-current-step]').hasText('2', 'shows current step');
      assert
        .dom('[data-test-total-steps]')
        .hasText('of 5', 'shows total steps');

      const progressEl = document.querySelector('[data-test-progress]');
      assert.ok(progressEl, 'progress bar exists');
      assert.strictEqual(
        progressEl?.getAttribute('aria-valuenow'),
        '40',
        'aria-valuenow reflects 40%',
      );

      const fill = document.querySelector('[data-test-progress-fill]');
      assert.ok(
        fill?.getAttribute('style')?.includes('width: 40%'),
        'fill width is 40%',
      );
    });

    test('it handles zero and rounding correctly', async function (assert) {
      assert.expect(3);

      this.setProperties({ currentStep: 0, totalSteps: 1 });

      await render(hbs`
      <NewJoinSteps::StepperHeader
        @currentStep={{this.currentStep}}
        @totalSteps={{this.totalSteps}}
      />
    `);

      const progressEl0 = document.querySelector('[data-test-progress]');
      assert.strictEqual(
        progressEl0?.getAttribute('aria-valuenow'),
        '0',
        '0% at step 0/1',
      );

      this.setProperties({ currentStep: 1, totalSteps: 3 });

      await render(hbs`
      <NewJoinSteps::StepperHeader
        @currentStep={{this.currentStep}}
        @totalSteps={{this.totalSteps}}
      />
    `);

      const progressEl33 = document.querySelector('[data-test-progress]');
      assert.strictEqual(
        progressEl33?.getAttribute('aria-valuenow'),
        '33',
        'rounded to 33%',
      );

      const fill = document.querySelector('[data-test-progress-fill]');
      assert.ok(
        fill?.getAttribute('style')?.includes('width: 33%'),
        'fill width is 33%',
      );
    });
  },
);
