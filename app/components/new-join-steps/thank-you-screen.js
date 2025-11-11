import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ThankYouScreenComponent extends Component {
  @action
  handleTrackApplication() {
    // TODO: Add navigation to application tracking page
    console.log('Track application clicked');
  }
}
