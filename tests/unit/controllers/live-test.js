import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import sinon from 'sinon';
import { BUTTONS_TYPE } from 'website-www/constants/live';

module('Unit | Controller | live', function (hooks) {
  setupTest(hooks);

  let controller;
  let liveServiceStub;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:live');
    liveServiceStub = {
      togglePictureInPicture: sinon.stub(),
      shareScreen: sinon.stub(),
      leaveSession: sinon.stub(),
    };

    Object.defineProperty(controller, 'liveService', {
      value: liveServiceStub,
      configurable: true,
      writable: true,
    });
  });

  test('it toggles picture in picture from the pop out button', function (assert) {
    controller.buttonClickHandler(BUTTONS_TYPE.PICTURE_IN_PICTURE);

    assert.true(
      liveServiceStub.togglePictureInPicture.calledOnce,
      'the live service toggles picture in picture',
    );
    assert.true(
      liveServiceStub.shareScreen.notCalled,
      'no other live action is triggered',
    );
  });

  test('it shares the screen from the screen share button', function (assert) {
    controller.buttonClickHandler(BUTTONS_TYPE.SCREEN_SHARE);

    assert.true(
      liveServiceStub.shareScreen.calledOnce,
      'the live service starts the screen share',
    );
    assert.true(
      liveServiceStub.togglePictureInPicture.notCalled,
      'picture in picture is untouched',
    );
  });
});
