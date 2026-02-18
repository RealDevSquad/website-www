import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  CREATE_APPLICATION_URL,
  UPDATE_APPLICATION_URL,
} from '../constants/apis';
import {
  NEW_FORM_STEPS,
  USER_ROLE_MAP,
  STEP_DATA_STORAGE_KEY,
} from '../constants/new-join-form';
import { TOAST_OPTIONS } from '../constants/toast-options';
import {
  getLocalStorageItem,
  safeParse,
  setLocalStorageItem,
} from '../utils/storage';
import apiRequest from '../utils/api-request';

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

  get isEditMode() {
    return this.args.isEditMode;
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
      const url = this.isEditMode
        ? UPDATE_APPLICATION_URL(this.onboarding.applicationData?.id)
        : CREATE_APPLICATION_URL;
      const method = this.isEditMode ? 'PATCH' : 'POST';

      const response = await apiRequest(url, method, applicationData);

      if (response.status === 409) {
        this.toast.error(
          this.isEditMode
            ? 'You will be able to edit after 24 hrs.'
            : 'You have already submitted an application.',
          'Application Exists!',
          TOAST_OPTIONS,
        );
        this.isSubmitting = false;
        return;
      }

      if (!response.ok) {
        this.toast.error(
          response.message ||
            `Failed to ${this.isEditMode ? 'edit' : 'submit'} application. Please try again.`,
          'Error!',
          TOAST_OPTIONS,
        );
        this.isSubmitting = false;
        return;
      }

      await response.json();

      this.toast.success(
        this.isEditMode
          ? 'You have successfully edited the application'
          : 'Application submitted successfully!',
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
        `Failed to ${this.isEditMode ? 'edit' : 'submit'} application. Please try again.`,
        'Error!',
        TOAST_OPTIONS,
      );
      this.isSubmitting = false;
    }
  }

  collectApplicationData() {
    const stepOneData = safeParse(STEP_DATA_STORAGE_KEY.stepOne);
    const stepTwoData = safeParse(STEP_DATA_STORAGE_KEY.stepTwo);
    const stepThreeData = safeParse(STEP_DATA_STORAGE_KEY.stepThree);
    const stepFourData = safeParse(STEP_DATA_STORAGE_KEY.stepFour);
    const stepFiveData = safeParse(STEP_DATA_STORAGE_KEY.stepFive);

    const formData = {
      ...stepOneData,
      ...stepTwoData,
      ...stepThreeData,
      ...stepFiveData,
      socialLink: { ...stepFourData },
      role: stepOneData.role ? USER_ROLE_MAP[stepOneData.role] : '',
      numberOfHours: Number(stepFiveData.numberOfHours) || 0,
    };

    if (this.isEditMode && this.onboarding.applicationData) {
      return this.getModifiedFields(formData, this.onboarding.applicationData);
    }

    return formData;
  }

  getModifiedFields(formData, originalApplication) {
    const modifiedData = {};

    const originalValues = {
      firstName: originalApplication.biodata?.firstName,
      lastName: originalApplication.biodata?.lastName,
      city: originalApplication.location?.city,
      state: originalApplication.location?.state,
      country: originalApplication.location?.country,
      institution: originalApplication.professional?.institution,
      skills: originalApplication.professional?.skills,
      introduction: originalApplication.professional?.introduction,
      forFun: originalApplication.intro?.forFun,
      funFact: originalApplication.intro?.funFact,
      whyRds: originalApplication.intro?.whyRds,
      numberOfHours: originalApplication.intro?.numberOfHours,
      foundFrom: originalApplication.foundFrom,
      role: originalApplication.role,
      imageUrl: originalApplication.imageUrl,
    };
    Object.entries(originalValues).forEach(([formKey, originalValue]) => {
      if (formData[formKey] !== originalValue) {
        modifiedData[formKey] = formData[formKey];
      }
    });

    const socialFields = [
      'phoneNo',
      'twitter',
      'linkedin',
      'instagram',
      'github',
      'peerlist',
      'behance',
      'dribble',
    ];

    const socialLinkChanges = socialFields.reduce((acc, field) => {
      const formValue = formData[field];
      const originalValue = originalApplication.socialLink?.[field];

      if (formValue && formValue !== originalValue) {
        acc[field] = formValue;
      }
      return acc;
    }, {});

    if (Object.keys(socialLinkChanges).length) {
      modifiedData.socialLink = socialLinkChanges;
    }

    return modifiedData;
  }

  clearAllStepData() {
    Object.values(STEP_DATA_STORAGE_KEY).forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('isValid');
    localStorage.removeItem('currentStep');
  }
}
