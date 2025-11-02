import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class WelcomeScreenComponent extends Component {
  @tracked showModal = false;

  @action
  openModal(e) {
    const isCheckboxClick = e?.target?.tagName === 'INPUT';
    if (isCheckboxClick) {
      e.preventDefault();

      if (this.args.isTermsAccepted) {
        this.args.onTermsChange(false);
        return;
      }
    }
    this.showModal = true;
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  @action
  acceptTerms() {
    this.showModal = false;
    this.args.onTermsChange(true);
  }

  get isTermsAccepted() {
    return this.args.isTermsAccepted;
  }
}
