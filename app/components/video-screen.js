import Component from '@glimmer/component';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';

export default class VideoScreen extends Component {
  get liveService() {
    return getOwner(this).lookup('service:live');
  }

  @action registerPictureInPictureListeners(element) {
    this.liveService.registerPictureInPictureListeners(element);
  }

  @action removePictureInPictureListeners(element) {
    this.liveService.removePictureInPictureListeners(element);
  }
}
