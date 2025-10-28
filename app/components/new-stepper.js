import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DevStepperComponent extends Component {
  @service login;
  @service toast;
  @service router;
  @service onboarding;
  @service featureFlag;
  @tracked preValid = false;
  @tracked isValid = JSON.parse(localStorage.getItem('isValid')) ?? false;
  @tracked termsAccepted = false;
  @tracked currentStep =
    +localStorage.getItem('currentStep') ?? +this.args.step ?? 0;

  setIsValid = (newVal) => (this.isValid = newVal);
  setIsPreValid = (newVal) => (this.preValid = newVal);
  setTermsAccepted = (accepted) => (this.termsAccepted = accepted);

  constructor() {
    super(...arguments);
    window.onpopstate = () => {
      this.currentStep = Number(
        +new URLSearchParams(window.location.search).get('step'),
      );
    };
  }

  get applicationStatus() {
    return this.onboarding.applicationData?.status;
  }

  get applicationFeedback() {
    return this.onboarding.applicationData?.feedback;
  }

  @action incrementStep() {
    if (this.currentStep < 5) {
      this.currentStep += 1;
      localStorage.setItem('currentStep', this.currentStep);
      this.router.transitionTo(`/join?dev=true&step=${this.currentStep}`);
    }
  }

  @action decrementStep() {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
      localStorage.setItem('currentStep', this.currentStep);
      this.router.transitionTo(`/join?dev=true&step=${this.currentStep}`);
    }
  }

  @action startHandler() {
    if (!this.termsAccepted) {
      alert('Please accept the terms and conditions to continue');
      return;
    }

    if (this.login.isLoggedIn && !this.login.isLoading) {
      localStorage.setItem('id', this.login.userData.id);
      localStorage.setItem('first_name', this.login.userData.first_name);
      localStorage.setItem('last_name', this.login.userData.last_name);
      this.incrementStep();
    } else {
      alert('You must be logged in to continue');
    }
  }

  @action nextStep(e) {
    e.preventDefault();
    this.incrementStep();
    localStorage.setItem('isValid', false);
    this.isValid = false;
  }
}
