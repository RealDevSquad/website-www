import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class WelcomeScreenComponent extends Component {
  @service joinApplicationTerms;
  @tracked isTermsModalOpen = false;

  @action
  handleTermsCheckboxChange(e) {
    if (this.joinApplicationTerms.hasUserAcceptedTerms) {
      this.joinApplicationTerms.setTermsAccepted(false);
    } else {
      e.preventDefault();
      this.isTermsModalOpen = true;
    }
  }

  @action
  closeTermsModal() {
    this.isTermsModalOpen = false;
  }

  @action
  acceptTerms() {
    this.isTermsModalOpen = false;
    this.joinApplicationTerms.setTermsAccepted(true);
  }
}
