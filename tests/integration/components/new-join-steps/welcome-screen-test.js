import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | welcome-screen', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with unchecked checkbox by default', async function (assert) {
    await render(hbs`<NewJoinSteps::WelcomeScreen />`);

    assert.dom('[data-test="welcome-logo"]').exists('Logo is displayed');
    assert
      .dom('[data-test="welcome-greeting"]')
      .hasText('Ready to apply to Real Dev Squad?');
    assert.dom('[data-test="terms-checkbox"]').exists('Checkbox exists');
    assert
      .dom('[data-test="terms-checkbox"]')
      .isNotChecked('Checkbox is initially unchecked');
  });

  test('clicking unchecked checkbox opens terms modal', async function (assert) {
    await render(hbs`<NewJoinSteps::WelcomeScreen />`);
    assert
      .dom('[data-test="terms-modal-content"]')
      .doesNotExist('Terms modal is not shown initially');

    await click('[data-test="terms-checkbox"]');
    assert
      .dom('[data-test="terms-modal-content"]')
      .exists('Terms modal is shown after clicking checkbox');
  });

  test('accepting terms in modal sets checkbox to checked', async function (assert) {
    await render(hbs`<NewJoinSteps::WelcomeScreen />`);
    await click('[data-test="terms-checkbox"]');
    await click('[data-test-button="accept-terms"]');

    assert
      .dom('[data-test="terms-modal-content"]')
      .doesNotExist('Terms modal is closed');
    assert
      .dom('[data-test="terms-checkbox"]')
      .isChecked('Checkbox is checked after accepting terms');
  });

  test('can uncheck checkbox after terms have been accepted', async function (assert) {
    const terms = this.owner.lookup('service:joinApplicationTerms');
    terms.hasUserAcceptedTerms = true;

    await render(hbs`<NewJoinSteps::WelcomeScreen />`);
    await click('[data-test="terms-checkbox"]');

    assert
      .dom('[data-test="terms-checkbox"]')
      .isNotChecked('Checkbox is unchecked after click');
    assert.false(terms.hasUserAcceptedTerms, 'Terms is set to false');
  });
});
