import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { STEP_DATA_STORAGE_KEY } from 'website-www/constants/new-join-form';

module(
  'Integration | Component | new-join-steps/new-step-four',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      window.localStorage.clear();
      this.set('setIsPreValid', () => {});
      this.set('setIsValid', () => {});
    });

    test('it renders base social inputs', async function (assert) {
      await render(hbs`
      <NewJoinSteps::NewStepFour
        @setIsPreValid={{this.setIsPreValid}}
        @setIsValid={{this.setIsValid}}
      />
    `);

      assert.dom('[data-test-step="new-step-four"]').exists();
      assert.dom('[data-test-input-field][name="phoneNumber"]').exists();
      assert.dom('[data-test-input-field][name="twitter"]').exists();
      assert.dom('[data-test-input-field][name="linkedin"]').exists();
      assert.dom('[data-test-input-field][name="instagram"]').exists();
      assert.dom('[data-test-input-field][name="peerlist"]').exists();
    });

    test('it shows GitHub input when role is developer', async function (assert) {
      window.localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ role: 'Developer' }),
      );

      await render(hbs`
      <NewJoinSteps::NewStepFour
        @setIsPreValid={{this.setIsPreValid}}
        @setIsValid={{this.setIsValid}}
      />
    `);

      assert.dom('[data-test-input-field][name="github"]').exists();
    });

    test('it shows designer inputs when role is designer', async function (assert) {
      window.localStorage.setItem(
        STEP_DATA_STORAGE_KEY.stepOne,
        JSON.stringify({ role: 'Designer' }),
      );

      await render(hbs`
      <NewJoinSteps::NewStepFour
        @setIsPreValid={{this.setIsPreValid}}
        @setIsValid={{this.setIsValid}}
      />
    `);

      assert.dom('[data-test-input-field][name="behance"]').exists();
      assert.dom('[data-test-input-field][name="dribble"]').exists();
    });
  },
);
