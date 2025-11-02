import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class WelcomeScreenComponent extends Component {
  @service applicationTerms;

  @tracked showModal = false;

  @action
  handleCheckboxClick(e) {
    if (this.applicationTerms.hasUserAcceptedTerms) {
      this.applicationTerms.setTermsAcceptance(false);
    } else {
      e.target.checked = false;
      this.showModal = true;
    }
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  @action
  acceptTerms() {
    this.showModal = false;
    this.applicationTerms.setTermsAcceptance(true);
  }
}
