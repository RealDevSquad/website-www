import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import { waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | image uploader', function (hooks) {
  setupRenderingTest(hooks);

  const file = new File(['dummy image data'], 'RDSLogo.png', {
    type: 'image/png',
  });

  test('it renders correct initial state', async function (assert) {
    await render(hbs`
      <Profile::UploadImage
        @uploadUrl="/upload"
        @formKeyName="image"
      />
    `);

    assert.dom('h1').hasText('Upload Image', 'Title is rendered correctly');
    assert
      .dom('p.image-p')
      .hasText('( Max size 2MB )', 'Image size note is rendered');
    assert.dom('[data-test-drop-area]').exists('Drop area is rendered');
    assert
      .dom('[data-test-btn="browse"]')
      .hasText('Browse', 'Browse button is rendered');
    assert.dom('input[type="file"]').exists('File input is rendered');
  });

  test('it handles file selection correctly', async function (assert) {
    await render(hbs`
      <Profile::UploadImage
        @uploadUrl="/upload"
        @formKeyName="image"
      />
    `);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    await triggerEvent('input[type="file"]', 'change', {
      target: { files: [file] },
    });

    assert
      .dom('[data-test-drop-area]')
      .doesNotExist('Drop area is hidden after file selection');
    assert
      .dom('h1')
      .hasText(
        'Crop Selected Image',
        'Crop UI is rendered after file selection',
      );
  });

  test('it handles files of other types properly when dragged and dropped', async function (assert) {
    await render(hbs`
      <Profile::UploadImage
        @uploadUrl="/upload"
        @formKeyName="image"
        @imageCoordinates="{x:1,y:2,width:3,height:5}"
      />
    `);
    const gifFile = new File(['dummy image data'], 'newGif.gif', {
      type: 'image/gif',
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(gifFile);

    await triggerEvent('[data-test-drop-area]', 'dragover', { dataTransfer });
    await triggerEvent('[data-test-drop-area]', 'drop', { dataTransfer });

    await triggerEvent('[data-test-btn="upload-image"]', 'click', {
      dataTransfer,
    });
    await waitFor('p.message-text__failure');
    assert
      .dom('p.message-text__failure')
      .exists('Error message is shown for invalid file type');
  });

  test('it renders crop UI when an image is selected', async function (assert) {
    await render(hbs`
      <Profile::UploadImage
        @uploadUrl="/upload"
        @formKeyName="image"
      />
    `);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    await triggerEvent('input[type="file"]', 'change', {
      target: { files: [file] },
    });

    assert.dom('h1').hasText('Crop Selected Image', 'Crop heading is shown');
    assert
      .dom('button[data-test-btn="upload-image"]')
      .hasText('Upload', 'Upload button is rendered');
  });

  test('it handles drag-and-drop functionality', async function (assert) {
    await render(hbs`
      <Profile::UploadImage
        @uploadUrl="/upload"
        @formKeyName="image"
        @imageCoordinates="{x:1,y:2,z:3}"
      />
    `);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    await triggerEvent('[data-test-drop-area]', 'dragover', { dataTransfer });
    assert
      .dom('[data-test-drop-area]')
      .hasClass('drop-area__highlight', 'Drop area is highlighted during drag');

    await triggerEvent('[data-test-drop-area]', 'drop', { dataTransfer });
    assert
      .dom('h1')
      .hasText('Crop Selected Image', 'Image is selected after drop');
  });
});
