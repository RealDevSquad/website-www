import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { NEW_FORM_STEPS } from '../constants/new-join-form';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';

export default class NewStepperComponent extends Component {
  MIN_STEP = 0;
  MAX_STEP = 6;
  applicationId = '4gchuf690';

  @service login;
  @service router;
  @service onboarding;
  @service joinApplicationTerms;

  @tracked preValid = false;
  @tracked isValid = getLocalStorageItem('isValid') === 'true';

  @tracked currentStep = 0;

  constructor() {
    super(...arguments);

    const storedStep = getLocalStorageItem('currentStep');
    const stepFromArgs = this.args.step;
    this.currentStep = storedStep
      ? Number(storedStep)
      : stepFromArgs != null
        ? Number(stepFromArgs)
        : 0;
  }

  setIsValid = (newVal) => (this.isValid = newVal);
  setIsPreValid = (newVal) => (this.preValid = newVal);

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

  get firstName() {
    return localStorage.getItem('first_name') ?? '';
  }

  get isNextButtonDisabled() {
    return !(this.preValid || this.isValid);
  }

  get isReviewStep() {
    return this.currentStep === this.MAX_STEP;
  }

  @action incrementStep() {
    if (this.currentStep < this.MAX_STEP) {
      const nextStep = this.currentStep + 1;
      setLocalStorageItem('currentStep', String(nextStep));
      this.currentStep = nextStep;
      this.updateQueryParam(nextStep);
    }
  }

  @action decrementStep() {
    if (this.currentStep > this.MIN_STEP) {
      const previousStep = this.currentStep - 1;
      setLocalStorageItem('currentStep', String(previousStep));
      this.currentStep = previousStep;
      this.updateQueryParam(previousStep);
    }
  }

  @action startHandler() {
    sessionStorage.setItem('id', this.login.userData.id);
    sessionStorage.setItem('first_name', this.login.userData.first_name);
    sessionStorage.setItem('last_name', this.login.userData.last_name);
    this.incrementStep();
  }

  @action navigateToStep(stepNumber) {
    if (stepNumber >= this.MIN_STEP + 1 && stepNumber <= this.MAX_STEP) {
      this.isValid = false;
      this.preValid = false;
      this.currentStep = stepNumber;
      setLocalStorageItem('currentStep', String(stepNumber));
      setLocalStorageItem('isValid', 'false');
      this.updateQueryParam(stepNumber);
    }
  }

  @action handleSubmit() {
    // ToDo: handle create application
    console.log('Submit application for review');
    this.currentStep = this.MAX_STEP + 1;
    setLocalStorageItem('currentStep', String(this.currentStep));
    this.updateQueryParam(this.currentStep);
  }
}
