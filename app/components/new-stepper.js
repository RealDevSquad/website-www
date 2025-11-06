import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class NewStepperComponent extends Component {
  MIN_STEP = 0;
  MAX_STEP = 6;

  @service login;
  @service router;
  @service onboarding;
  @service joinApplicationTerms;

  @tracked currentStep =
    Number(localStorage.getItem('currentStep') ?? this.args.step) ?? 0;

  constructor() {
    super(...arguments);
    this.handlePopState = () => {
      const step = new URLSearchParams(window.location.search).get('step');
      if (step !== null) this.currentStep = Number(step);
    };
    window.addEventListener('popstate', this.handlePopState);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    window.removeEventListener('popstate', this.handlePopState);
  }

  @action incrementStep() {
    if (this.currentStep < this.MAX_STEP) {
      this.currentStep += 1;
      localStorage.setItem('currentStep', this.currentStep);
      this.router.transitionTo(`/join?dev=true&step=${this.currentStep}`);
    }
  }

  @action decrementStep() {
    if (this.currentStep > this.MIN_STEP) {
      this.currentStep -= 1;
      localStorage.setItem('currentStep', this.currentStep);
      this.router.transitionTo(`/join?dev=true&step=${this.currentStep}`);
    }
  }

  @action startHandler() {
    localStorage.setItem('first_name', this.login.userData.first_name);
    localStorage.setItem('last_name', this.login.userData.last_name);
    this.incrementStep();
  }
}
