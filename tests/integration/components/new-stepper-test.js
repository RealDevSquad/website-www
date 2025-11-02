import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | new-stepper', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the welcome screen at step 0', async function (assert) {
    await render(hbs`<NewStepper @step={{0}} />`);

    assert.dom('[data-test="stepper"]').exists('Stepper component is rendered');
    assert
      .dom('[data-test="welcome-screen"]')
      .exists('Welcome screen is rendered');
    assert
      .dom('[data-test="welcome-greeting"]')
      .hasText('Ready to apply to RDS?');
    assert.dom('[data-test-button="start"]').exists('Start button exists');
  });

  test('start button is disabled when terms are not accepted', async function (assert) {
    await render(hbs`<NewStepper @step={{0}} />`);
    assert
      .dom('[data-test-button="start"]')
      .isDisabled('Start button is disabled by default');
  });

  test('start button is enabled when terms are accepted', async function (assert) {
    const terms = this.owner.lookup('service:applicationTerms');
    terms.hasUserAcceptedTerms = true;

    await render(hbs`<NewStepper @step={{0}} />`);
    assert
      .dom('[data-test-button="start"]')
      .isNotDisabled('Start button is enabled when terms are accepted');
  });
});
