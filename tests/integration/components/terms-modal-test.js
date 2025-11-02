import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | terms-modal', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders modal content when @isOpen is true', async function (assert) {
    this.setProperties({
      isOpen: true,
      onAccept: () => {},
      onClose: () => {},
    });
    await render(hbs`
      <TermsModal
        @isOpen={{this.isOpen}}
        @onAccept={{this.onAccept}}
        @onClose={{this.onClose}}
      />
    `);
    assert
      .dom('[data-test="terms-modal-content"]')
      .exists('Modal content is displayed');
  });

  test('it shows Accept Terms button and correctly calls onAccept action', async function (assert) {
    assert.expect(3);
    const terms = this.owner.lookup('service:applicationTerms');
    terms.hasUserAcceptedTerms = false;
    this.setProperties({
      isOpen: true,
      onAccept: () => assert.step('accept-called'),
      onClose: () => {},
    });
    await render(hbs`
      <TermsModal
        @isOpen={{this.isOpen}}
        @onAccept={{this.onAccept}}
        @onClose={{this.onClose}}
      />
    `);
    assert
      .dom('[data-test-button="accept-terms"]')
      .exists('Accept Terms button is displayed');

    await click('[data-test-button="accept-terms"]');
    assert.verifySteps(['accept-called'], 'onAccept action was called');
  });

  test('it does not show Accept Terms button when terms are already accepted', async function (assert) {
    const terms = this.owner.lookup('service:applicationTerms');
    terms.hasUserAcceptedTerms = true;
    this.setProperties({
      isOpen: true,
      onAccept: () => {},
      onClose: () => {},
    });
    await render(hbs`
      <TermsModal
        @isOpen={{this.isOpen}}
        @onAccept={{this.onAccept}}
        @onClose={{this.onClose}}
      />
    `);
    assert
      .dom('[data-test-button="accept-terms"]')
      .doesNotExist('Accept Terms button is not displayed');
  });
});
