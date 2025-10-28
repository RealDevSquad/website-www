import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class TermsModalComponent extends Component {
  @action
  handleAccept() {
    if (this.args.onAccept) {
      this.args.onAccept();
    }
  }
}
