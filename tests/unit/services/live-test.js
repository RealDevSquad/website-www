import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import sinon from 'sinon';

module('Unit | Service | live', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:live');
    assert.ok(service);
  });

  module('picture in picture', function (hooks) {
    let service;
    let stubbedDocumentKeys;

    const stubDocumentProperty = function (key, value) {
      stubbedDocumentKeys.push(key);
      Object.defineProperty(document, key, {
        value,
        configurable: true,
        writable: true,
      });
    };

    const setVideoEl = function (videoEl) {
      Object.defineProperty(service, 'videoEl', {
        value: videoEl,
        configurable: true,
        writable: true,
      });
    };

    hooks.beforeEach(function () {
      stubbedDocumentKeys = [];
      service = this.owner.lookup('service:live');
      service.toast = {
        info: sinon.stub(),
        error: sinon.stub(),
        success: sinon.stub(),
      };
    });

    hooks.afterEach(function () {
      stubbedDocumentKeys.forEach((key) => {
        delete document[key];
      });
      delete service.videoEl;
    });

    test('it requests picture in picture when the standard API is available', function (assert) {
      const requestPictureInPicture = sinon.stub().resolves();

      stubDocumentProperty('pictureInPictureEnabled', true);
      stubDocumentProperty('pictureInPictureElement', null);
      setVideoEl({ requestPictureInPicture });

      service.togglePictureInPicture();

      assert.true(
        requestPictureInPicture.calledOnce,
        'requestPictureInPicture is called once',
      );
      assert.true(
        service.toast.info.notCalled,
        'no unsupported message is shown',
      );
    });

    test('it exits picture in picture when a picture in picture element is active', function (assert) {
      const exitPictureInPicture = sinon.stub().resolves();
      const requestPictureInPicture = sinon.stub().resolves();

      stubDocumentProperty('pictureInPictureEnabled', true);
      stubDocumentProperty('pictureInPictureElement', { id: 'video' });
      stubDocumentProperty('exitPictureInPicture', exitPictureInPicture);
      setVideoEl({ requestPictureInPicture });

      service.togglePictureInPicture();

      assert.true(
        exitPictureInPicture.calledOnce,
        'exitPictureInPicture is called once',
      );
      assert.true(
        requestPictureInPicture.notCalled,
        'it does not request picture in picture while one is active',
      );
    });

    test('it uses the webkit presentation mode when only the webkit API exists', function (assert) {
      const webkitSetPresentationMode = sinon.stub();

      stubDocumentProperty('pictureInPictureEnabled', false);
      stubDocumentProperty('pictureInPictureElement', null);
      setVideoEl({
        webkitPresentationMode: 'inline',
        webkitSupportsPresentationMode: sinon.stub().returns(true),
        webkitSetPresentationMode,
      });

      service.togglePictureInPicture();

      assert.true(
        webkitSetPresentationMode.calledOnceWith('picture-in-picture'),
        'it switches the presentation mode to picture in picture',
      );
      assert.true(service.isPictureInPicture, 'the tracked state is updated');
    });

    test('it leaves the webkit presentation mode when already popped out', function (assert) {
      const webkitSetPresentationMode = sinon.stub();

      stubDocumentProperty('pictureInPictureEnabled', false);
      stubDocumentProperty('pictureInPictureElement', null);
      setVideoEl({
        webkitPresentationMode: 'picture-in-picture',
        webkitSupportsPresentationMode: sinon.stub().returns(true),
        webkitSetPresentationMode,
      });

      service.togglePictureInPicture();

      assert.true(
        webkitSetPresentationMode.calledOnceWith('inline'),
        'it switches the presentation mode back to inline',
      );
      assert.false(service.isPictureInPicture, 'the tracked state is updated');
    });

    test('it informs the user when the browser has no picture in picture API', function (assert) {
      stubDocumentProperty('pictureInPictureEnabled', false);
      stubDocumentProperty('pictureInPictureElement', null);
      setVideoEl({});

      service.togglePictureInPicture();

      assert.true(service.toast.info.calledOnce, 'an info toast is shown');
      assert.true(
        service.toast.info.firstCall.args[0].includes('not supported'),
        'the message explains that pop out is unavailable',
      );
    });

    test('it informs the user when the video element is not ready', function (assert) {
      stubDocumentProperty('pictureInPictureEnabled', true);
      stubDocumentProperty('pictureInPictureElement', null);
      setVideoEl(undefined);

      service.togglePictureInPicture();

      assert.true(service.toast.info.calledOnce, 'an info toast is shown');
      assert.false(service.isPictureInPicture, 'the state stays inactive');
    });

    test('it tracks picture in picture state from the video element events', function (assert) {
      const element = document.createElement('video');

      service.registerPictureInPictureListeners(element);

      element.dispatchEvent(new Event('enterpictureinpicture'));
      assert.true(service.isPictureInPicture, 'entering updates the state');

      element.dispatchEvent(new Event('leavepictureinpicture'));
      assert.false(service.isPictureInPicture, 'leaving updates the state');

      element.dispatchEvent(new Event('enterpictureinpicture'));
      assert.true(service.isPictureInPicture, 'entering updates the state');

      service.removePictureInPictureListeners(element);
      assert.false(
        service.isPictureInPicture,
        'the state resets on teardown of the listeners',
      );

      element.dispatchEvent(new Event('enterpictureinpicture'));
      assert.false(
        service.isPictureInPicture,
        'events are ignored once the listeners are removed',
      );
    });

    test('it reports picture in picture support from the platform APIs', function (assert) {
      const videoPrototype = window.HTMLVideoElement.prototype;
      const hasStandardApi = 'requestPictureInPicture' in videoPrototype;
      const hasWebkitApi = 'webkitSupportsPresentationMode' in videoPrototype;
      const hasAnyApi = hasStandardApi || hasWebkitApi;

      stubDocumentProperty('pictureInPictureEnabled', true);
      assert.strictEqual(
        service.isPictureInPictureSupported,
        hasAnyApi,
        'support follows the available APIs when picture in picture is enabled',
      );

      stubDocumentProperty('pictureInPictureEnabled', false);
      assert.strictEqual(
        service.isPictureInPictureSupported,
        hasWebkitApi,
        'only the webkit API can carry support when the standard one is disabled',
      );
    });
  });
});
