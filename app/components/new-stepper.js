import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  NEW_FORM_STEPS,
  NEW_STEP_LIMITS,
  STEP_DATA_STORAGE_KEY,
} from '../constants/new-join-form';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';
import { scheduleOnce } from '@ember/runloop';
import { validateWordCount } from '../utils/validator';
import { phoneNumberRegex } from '../constants/regex';

const NEW_STEP_CONFIG = {
  1: {
    storageKey: STEP_DATA_STORAGE_KEY.stepOne,
    limits: NEW_STEP_LIMITS.stepOne,
  },
  2: {
    storageKey: STEP_DATA_STORAGE_KEY.stepTwo,
    limits: NEW_STEP_LIMITS.stepTwo,
  },
  3: {
    storageKey: STEP_DATA_STORAGE_KEY.stepThree,
    limits: NEW_STEP_LIMITS.stepThree,
  },
  4: {
    storageKey: STEP_DATA_STORAGE_KEY.stepFour,
    limits: NEW_STEP_LIMITS.stepFour,
  },
  5: {
    storageKey: STEP_DATA_STORAGE_KEY.stepFive,
    limits: NEW_STEP_LIMITS.stepFive,
  },
};

export default class NewStepperComponent extends Component {
  MIN_STEP = 0;
  MAX_STEP = 6;
  applicationId = '4gchuf690';

  @service login;
  @service router;
  @service onboarding;
  @service joinApplicationTerms;

  @tracked currentStep =
    Number(this.args.step || getLocalStorageItem('currentStep')) ||
    this.MIN_STEP;
  @tracked canAccessStep = false;
  @tracked canProceedFromStep = false;

  constructor(...args) {
    super(...args);
    scheduleOnce('afterRender', this, this.initializeFromQuery);
  }

  clampStep(step) {
    return Math.max(this.MIN_STEP, Math.min(this.MAX_STEP + 1, step));
  }

  persistStep(step) {
    setLocalStorageItem('currentStep', String(step));
  }

  initializeFromQuery() {
    const targetStep = this.currentStep;
    const accessibleStep = this.resolveAccessibleStep(targetStep);
    this.currentStep = accessibleStep;
    this.canProceedFromStep = this.isStepComplete(accessibleStep);
    this.persistStep(accessibleStep);
    this.updateQueryParam(accessibleStep);
  }

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

  @action onCurrentStepValidityChange(isValid) {
    this.canProceedFromStep = Boolean(isValid);
    if (isValid) {
      this.persistStep(this.currentStep);
    }
  }

  resolveAccessibleStep(stepNumber) {
    const desiredStep = this.clampStep(stepNumber);
    for (let step = 1; step < desiredStep; step++) {
      if (!this.isStepComplete(step)) {
        this.canAccessStep = false;
        return step;
      }
    }

    this.canAccessStep = true;
    return desiredStep;
  }

  isStepComplete(stepNumber) {
    const config = NEW_STEP_CONFIG[stepNumber];
    if (!config) {
      return true;
    }

    const stored = JSON.parse(getLocalStorageItem(config.storageKey, '{}'));

    for (const [field, limits] of Object.entries(config.limits || {})) {
      const value = stored?.[field] ?? '';
      if (field === 'phoneNumber') {
        return phoneNumberRegex.test(value);
      }
      const result = validateWordCount(value, limits);
      if (!result.isValid) {
        return false;
      }
    }
    return true;
  }

  @action incrementStep() {
    const current = this.currentStep;
    if (current < this.MAX_STEP && this.isStepComplete(current)) {
      const nextStep = current + 1;
      this.canAccessStep = true;
      this.canProceedFromStep = this.isStepComplete(nextStep);
      this.currentStep = nextStep;
      this.persistStep(nextStep);
      this.updateQueryParam(nextStep);
    } else {
      this.canProceedFromStep = false;
    }
  }

  @action decrementStep() {
    const current = this.currentStep;
    if (current > this.MIN_STEP) {
      const previousStep = current - 1;
      this.canAccessStep = true;
      this.canProceedFromStep = this.isStepComplete(previousStep);
      this.currentStep = previousStep;
      this.persistStep(previousStep);
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
    const desired = this.resolveAccessibleStep(stepNumber);
    this.canProceedFromStep = this.isStepComplete(desired);
    this.currentStep = desired;
    this.persistStep(desired);
    this.updateQueryParam(desired);
  }

  @action handleSubmit() {
    // ToDo: handle create application and move thank you screen away from new stepper
    console.log('Submit application for review');
    const completionStep = this.MAX_STEP + 1;
    this.currentStep = completionStep;
    this.persistStep(completionStep);
    this.canAccessStep = true;
    this.canProceedFromStep = false;
    this.updateQueryParam(completionStep);
  }
}
