import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | confirm-modal', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the modal with correct message and buttons', async function (assert) {
    this.setProperties({
      isOpen: true,
      actionButtonDisabled: false,
      openConfirmModal: () => {},
      closeConfirmModal: () => {},
      onConfirm: () => {},
      onCancel: () => {},
    });

    await render(hbs`
      <ConfirmModal
        @isOpen={{this.isOpen}}
        @openModal={{this.openConfirmModal}}
        @closeModal={{this.closeConfirmModal}}
        @actionButtonDisabled={{this.actionButtonDisabled}}
        @onConfirm={{this.onConfirm}}
        @onCancel={{this.onCancel}}
      />
    `);

    assert.dom('[data-test-confirm-modal]').exists();
    assert
      .dom('[data-test-confirm-modal-message]')
      .hasText(
        'Are you sure you are the one who scanned this QR code? Do you want to proceed?',
        'Correct message is shown',
      );
    assert.dom('[data-test-button=confirm-modal-cancel]').exists();
    assert.dom('[data-test-button=confirm-modal-authorise]').exists();
  });

  test('action buttons are disabled when @actionButtonDisabled=true', async function (assert) {
    this.setProperties({
      isOpen: true,
      actionButtonDisabled: true,
      openConfirmModal: () => {},
      closeConfirmModal: () => {},
      onConfirm: () => {},
      onCancel: () => {},
    });

    await render(hbs`
      <ConfirmModal
        @isOpen={{this.isOpen}}
        @openModal={{this.openConfirmModal}}
        @closeModal={{this.closeConfirmModal}}
        @actionButtonDisabled={{this.actionButtonDisabled}}
        @onConfirm={{this.onConfirm}}
        @onCancel={{this.onCancel}}
      />
    `);

    assert
      .dom('[data-test-button=confirm-modal-authorise]')
      .isDisabled('Confirm button is disabled');
    assert
      .dom('[data-test-button=confirm-modal-cancel]')
      .isDisabled('Cancel button is disabled');
  });

  test('calls @onCancel and @onConfirm actions when respective buttons are clicked', async function (assert) {
    this.setProperties({
      isOpen: true,
      actionButtonDisabled: false,
      openConfirmModal: () => {},
      closeConfirmModal: () => {},
      onConfirm: () => assert.step('confirm-called'),
      onCancel: () => assert.step('cancel-called'),
    });

    await render(hbs`
      <ConfirmModal
        @isOpen={{this.isOpen}}
        @openModal={{this.openConfirmModal}}
        @closeModal={{this.closeConfirmModal}}
        @actionButtonDisabled={{this.actionButtonDisabled}}
        @onConfirm={{this.onConfirm}}
        @onCancel={{this.onCancel}}
      />
    `);

    await click('[data-test-button=confirm-modal-authorise]');
    assert.verifySteps(['confirm-called'], 'Confirm action was called');

    assert.step('reset');
    assert.verifySteps(['reset']);

    await click('[data-test-button=confirm-modal-cancel]');
    assert.verifySteps(['cancel-called'], 'Cancel action was called');
  });
});
