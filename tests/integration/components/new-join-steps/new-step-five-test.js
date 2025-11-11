import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';

module(
  'Integration | Component | new-join-steps/new-step-five',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      window.localStorage.clear();
      this.set('setIsPreValid', () => {});
      this.set('setIsValid', () => {});
    });

    test('it renders the feedback and discovery fields', async function (assert) {
      await render(hbs`
      <NewJoinSteps::NewStepFive
        @setIsPreValid={{this.setIsPreValid}}
        @setIsValid={{this.setIsValid}}
      />
    `);

      assert.dom('[data-test-step="new-step-five"]').exists();
      assert.dom('[data-test-textarea-field][name="whyRds"]').exists();
      assert.dom('[data-test-input-field][name="numberOfHours"]').exists();
      assert.dom('[data-test-dropdown-field][name="foundFrom"]').exists();
    });

    test('it renders heard from options in dropdown', async function (assert) {
      await render(hbs`
      <NewJoinSteps::NewStepFive
        @setIsPreValid={{this.setIsPreValid}}
        @setIsValid={{this.setIsValid}}
      />
    `);

      assert.dom('[data-test-dropdown-option="Twitter"]').exists();
      assert.dom('[data-test-dropdown-option="LinkedIn"]').exists();
    });

    test('it pre-populates saved answers from local storage', async function (assert) {
      window.localStorage.setItem(
        'newStepFiveData',
        JSON.stringify({
          whyRds: 'Building real projects',
          foundFrom: 'Other',
        }),
      );

      await render(hbs`
      <NewJoinSteps::NewStepFive
        @setIsPreValid={{this.setIsPreValid}}
        @setIsValid={{this.setIsValid}}
      />
    `);

      assert
        .dom('[data-test-textarea-field][name="whyRds"]')
        .hasValue('Building real projects');
      assert
        .dom('[data-test-dropdown-field][name="foundFrom"]')
        .hasValue('Other');
    });
  },
);
