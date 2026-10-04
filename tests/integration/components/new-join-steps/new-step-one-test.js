import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, triggerEvent, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module(
  'Integration | Component | new-join-steps/new-step-one',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      localStorage.removeItem('newStepOneData');

      this.toast = this.owner.lookup('service:toast');
      sinon.stub(this.toast, 'success');
      sinon.stub(this.toast, 'error');

      this.setIsPreValid = sinon.stub();
      this.setIsValid = sinon.stub();

      this.loginService = this.owner.lookup('service:login');
      this.loginService.userData = {
        first_name: 'John',
        last_name: 'Doe',
        role: 'developer',
      };
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    test('handleImageSelect rejects non-image files', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepOne @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const file = new File(['pdf content'], 'document.pdf', {
        type: 'application/pdf',
      });

      await triggerEvent('input[type="file"]', 'change', {
        files: [file],
      });

      assert.ok(
        this.toast.error.calledWithExactly(
          'Invalid file type. Please upload an image file.',
          'Error!',
        ),
        'Shows error for non-image file',
      );
    });

    test('handleImageSelect rejects files larger than 2MB', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepOne @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      await triggerEvent('input[type="file"]', 'change', {
        files: [largeFile],
      });

      assert.ok(
        this.toast.error.calledWithExactly(
          'Image size must be less than 2MB',
          'Error!',
        ),
        'Shows error for oversized file',
      );
    });

    test('imagePreview and imageUrl are updated on successful upload', async function (assert) {
      sinon.stub(window, 'fetch').resolves({
        ok: true,
        json: async () => ({
          image: {
            url: 'https://example.com/photo.jpg',
          },
        }),
      });

      await render(
        hbs`<NewJoinSteps::NewStepOne @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });

      await triggerEvent('input[type="file"]', 'change', {
        files: [file],
      });

      await waitFor('[data-test-image-preview]');

      assert.dom('[data-test-image-preview]').exists();
      assert.dom('[data-test-image-preview]').hasAttribute('src');

      const storedData = JSON.parse(
        localStorage.getItem('newStepOneData') || '{}',
      );
      assert.strictEqual(
        storedData.imageUrl,
        'https://example.com/photo.jpg',
        'Persists returned image URL to localStorage',
      );
      assert.ok(
        this.toast.success.calledWithExactly(
          'Profile image uploaded successfully!',
          'Success!',
          sinon.match.object,
        ),
        'Shows success toast',
      );
    });

    test('shows error toast on image upload API failure', async function (assert) {
      sinon.stub(window, 'fetch').resolves({
        ok: false,
        json: async () => ({ message: 'Server error' }),
      });

      await render(
        hbs`<NewJoinSteps::NewStepOne @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });

      await triggerEvent('input[type="file"]', 'change', {
        files: [file],
      });

      assert.dom('[data-test-image-preview]').doesNotExist();
      assert.ok(
        this.toast.error.calledWithExactly(
          'Server error',
          'Error!',
          sinon.match.object,
        ),
        'Shows error toast with API message',
      );
    });

    test('role is automatically selected when user profile has role', async function (assert) {
      await render(
        hbs`<NewJoinSteps::NewStepOne @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      const storedData = JSON.parse(
        localStorage.getItem('newStepOneData') || '{}',
      );
      assert.strictEqual(
        storedData.role,
        'Developer',
        'Role is automatically selected from user profile',
      );

      assert
        .dom('[data-test="role-button"]')
        .hasAttribute('disabled', '', 'Role buttons are disabled');
    });

    test('role selection is enabled when user profile has no role', async function (assert) {
      this.loginService.userData = {
        first_name: 'John',
        last_name: 'Doe',
      };

      await render(
        hbs`<NewJoinSteps::NewStepOne @setIsPreValid={{this.setIsPreValid}} @setIsValid={{this.setIsValid}} />`,
      );

      assert
        .dom('[data-test="role-button"]')
        .doesNotHaveAttribute('disabled', 'Role buttons are enabled');

      assert.dom('[data-test="role-selection-message"]').doesNotExist();
    });
  },
);
