import BaseStepComponent from './base-step';
import {
  NEW_STEP_LIMITS,
  STEP_DATA_STORAGE_KEY,
} from '../../constants/new-join-form';
import { phoneNumberRegex } from '../../constants/regex';

export default class NewStepFourComponent extends BaseStepComponent {
  storageKey = STEP_DATA_STORAGE_KEY.stepFour;

  stepValidation = {
    phoneNo: NEW_STEP_LIMITS.stepFour.phoneNo,
    twitter: NEW_STEP_LIMITS.stepFour.twitter,
    linkedin: NEW_STEP_LIMITS.stepFour.linkedin,
    instagram: NEW_STEP_LIMITS.stepFour.instagram,
    peerlist: NEW_STEP_LIMITS.stepFour.peerlist,
  };

  get userRole() {
    const stepOneData = JSON.parse(
      localStorage.getItem('newStepOneData') || '{}',
    );
    return stepOneData.role || '';
  }

  postLoadInitialize() {
    if (this.userRole === 'Developer') {
      this.stepValidation.github = NEW_STEP_LIMITS.stepFour.github;
    }

    if (this.userRole === 'Designer') {
      this.stepValidation.behance = NEW_STEP_LIMITS.stepFour.behance;
      this.stepValidation.dribble = NEW_STEP_LIMITS.stepFour.dribble;
    }

    // re-calculate the errorMessage and wordCount for new input fields
    this.errorMessage = Object.fromEntries(
      Object.keys(this.stepValidation).map((k) => [k, '']),
    );

    this.wordCount = Object.fromEntries(
      Object.keys(this.stepValidation).map((k) => {
        let val = this.data[k] || '';
        return [k, val.trim().split(/\s+/).filter(Boolean).length || 0];
      }),
    );
  }

  get showGitHub() {
    return this.userRole === 'Developer';
  }

  get showBehance() {
    return this.userRole === 'Designer';
  }

  get showDribble() {
    return this.userRole === 'Designer';
  }

  validateField(field, value) {
    if (field === 'phoneNo') {
      const trimmedValue = value?.trim() || '';
      const isValid = trimmedValue && phoneNumberRegex.test(trimmedValue);
      return {
        isValid,
        wordCount: 0,
      };
    }
    return super.validateField(field, value);
  }

  formatError(field, result) {
    if (field === 'phoneNo') {
      if (result.isValid) return '';
      return 'Please enter a valid phone number (e.g., +91 80000 00000)';
    }
    return super.formatError(field, result);
  }
}
