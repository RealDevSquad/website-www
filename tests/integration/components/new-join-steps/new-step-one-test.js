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
        this.toast.error.calledWith(
          'Invalid file type. Please upload an image file.',
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
        this.toast.error.calledWith('Image size must be less than 2MB'),
        'Shows error for oversized file',
      );
    });

    test('imagePreview and imageUrl are updated on successful upload', async function (assert) {
      const fetchStub = sinon.stub(window, 'fetch').resolves({
        ok: true,
        json: async () => ({ url: 'https://example.com/photo.jpg' }),
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
      assert.ok(
        this.toast.success.calledWith('Profile image uploaded successfully!'),
        'Shows success toast',
      );

      fetchStub.restore();
    });

    test('shows error toast on image upload API failure', async function (assert) {
      const fetchStub = sinon.stub(window, 'fetch').resolves({
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
        this.toast.error.calledWith('Server error'),
        'Shows error toast with API message',
      );

      fetchStub.restore();
    });
  },
);
