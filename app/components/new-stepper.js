import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { CREATE_APPLICATION_URL } from '../constants/apis';
import {
  NEW_FORM_STEPS,
  USER_ROLE_MAP,
  STEP_DATA_STORAGE_KEY,
} from '../constants/new-join-form';
import { TOAST_OPTIONS } from '../constants/toast-options';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';

export default class NewStepperComponent extends Component {
  MIN_STEP = 0;
  MAX_STEP = 6;

  @service login;
  @service router;
  @service onboarding;
  @service joinApplicationTerms;
  @service toast;

  @tracked preValid = false;
  @tracked isValid = getLocalStorageItem('isValid') === 'true';
  @tracked isSubmitting = false;

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

  @action async handleSubmit() {
    this.isSubmitting = true;
    try {
      const applicationData = this.collectApplicationData();

      const response = await fetch(CREATE_APPLICATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(applicationData),
      });

      if (response.status === 409) {
        this.toast.error(
          'You have already submitted an application.',
          'Application Exists!',
          TOAST_OPTIONS,
        );
        this.isSubmitting = false;
        return;
      }

      if (!response.ok) {
        this.toast.error(
          response.message || 'Failed to submit application. Please try again.',
          'Error!',
          TOAST_OPTIONS,
        );
        this.isSubmitting = false;
        return;
      }

      const data = await response.json();
      this.applicationId = data.application?.id;

      this.toast.success(
        'Application submitted successfully!',
        'Success!',
        TOAST_OPTIONS,
      );

      this.clearAllStepData();
      this.isSubmitting = false;
      this.router.replaceWith('join', {
        queryParams: { dev: true },
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      this.toast.error(
        'Failed to submit application. Please try again.',
        'Error!',
        TOAST_OPTIONS,
      );
      this.isSubmitting = false;
    }
  }

  collectApplicationData() {
    const stepOneData = JSON.parse(
      getLocalStorageItem(STEP_DATA_STORAGE_KEY.stepOne) || '{}',
    );
    const stepTwoData = JSON.parse(
      getLocalStorageItem(STEP_DATA_STORAGE_KEY.stepTwo) || '{}',
    );
    const stepThreeData = JSON.parse(
      getLocalStorageItem(STEP_DATA_STORAGE_KEY.stepThree) || '{}',
    );
    const stepFourData = JSON.parse(
      getLocalStorageItem(STEP_DATA_STORAGE_KEY.stepFour) || '{}',
    );
    const stepFiveData = JSON.parse(
      getLocalStorageItem(STEP_DATA_STORAGE_KEY.stepFive) || '{}',
    );

    return {
      ...stepOneData,
      ...stepTwoData,
      ...stepThreeData,
      ...stepFiveData,
      socialLink: { ...stepFourData },
      role: stepOneData.role ? USER_ROLE_MAP[stepOneData.role] : '',
      numberOfHours: Number(stepFiveData.numberOfHours) || 0,
    };
  }

  clearAllStepData() {
    Object.values(STEP_DATA_STORAGE_KEY).forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('isValid');
    localStorage.removeItem('currentStep');
  }
}
