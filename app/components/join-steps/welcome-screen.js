import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class WelcomeScreenComponent extends Component {
  @tracked isTermsAccepted = false;
  @tracked showModal = false;

  @action
  openModal(event) {
    event.preventDefault();
    this.showModal = true;
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  @action
  acceptTerms() {
    this.isTermsAccepted = true;
    this.showModal = false;
    if (this.args.onTermsChange) {
      this.args.onTermsChange(this.isTermsAccepted);
    }
  }

  get canProceed() {
    return this.isTermsAccepted;
  }
}
