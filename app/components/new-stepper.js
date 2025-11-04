import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { NEW_FORM_STEPS } from '../constants/new-join-form';

export default class NewStepperComponent extends Component {
  MIN_STEP = 0;
  MAX_STEP = 6;

  @service login;
  @service router;
  @service onboarding;
  @service joinApplicationTerms;

  @tracked currentStep =
    Number(localStorage.getItem('currentStep') ?? this.args.step) || 0;

  updateQueryParam(step) {
    const existingQueryParams = this.router.currentRoute?.queryParams;

    this.router.transitionTo('join', {
      queryParams: {
        ...existingQueryParams,
        step,
      },
    });
  }

  get showPreviousButton() {
    return this.currentStep > this.MIN_STEP + 1;
  }

  get currentHeading() {
    return NEW_FORM_STEPS.headings[this.currentStep - 1] ?? '';
  }

  get currentSubheading() {
    return NEW_FORM_STEPS.subheadings[this.currentStep - 1] ?? '';
  }

  @action incrementStep() {
    if (this.currentStep < this.MAX_STEP) {
      const nextStep = this.currentStep + 1;
      localStorage.setItem('currentStep', String(nextStep));
      this.updateQueryParam(nextStep);
    }
  }

  @action decrementStep() {
    if (this.currentStep > this.MIN_STEP) {
      const previousStep = this.currentStep - 1;
      localStorage.setItem('currentStep', String(previousStep));
      this.updateQueryParam(previousStep);
    }
  }

  @action startHandler() {
    sessionStorage.setItem('id', this.login.userData.id);
    sessionStorage.setItem('first_name', this.login.userData.first_name);
    sessionStorage.setItem('last_name', this.login.userData.last_name);
    this.incrementStep();
  }
}
