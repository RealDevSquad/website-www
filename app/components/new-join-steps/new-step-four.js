import { action } from '@ember/object';
import BaseStepComponent from './base-step';
import {
  NEW_STEP_LIMITS,
  STEP_DATA_STORAGE_KEY,
} from '../../constants/new-join-form';
import { phoneNumberRegex } from '../../constants/regex';
import { mapSocialUrls, socialFields } from '../../constants/applications';

export default class NewStepFourComponent extends BaseStepComponent {
  get storageKey() {
    return STEP_DATA_STORAGE_KEY.stepFour;
  }

  stepValidation = {
    phoneNumber: NEW_STEP_LIMITS.stepFour.phoneNumber,
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
      this.stepValidation.dribbble = NEW_STEP_LIMITS.stepFour.dribbble;
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

  get showdribbble() {
    return this.userRole === 'Designer';
  }

  getSocialPrefix(platform) {
    const url = mapSocialUrls[platform];
    if (!url) return null;
    return url.replace('https://', '');
  }

  extractUsername(field, value) {
    if (!value || !socialFields.includes(field)) return value;

    const trimmedValue = value.trim().replace(/^@/, '');
    try {
      const normalized = trimmedValue.startsWith('http')
        ? trimmedValue
        : `https://${trimmedValue}`;

      const url = new URL(normalized);
      const segments = url.pathname.split('/').filter(Boolean);
      return segments[0] ?? trimmedValue;
    } catch {
      return trimmedValue;
    }
  }

  @action inputHandler(e) {
    if (e?.target) {
      const { name, value } = e.target;
      e.target.value = this.extractUsername(name, value);
    }
    super.inputHandler(e);
  }

  validateField(field, value) {
    if (field === 'phoneNumber') {
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
    if (field === 'phoneNumber') {
      if (result.isValid) return '';
      return 'Please enter a valid phone number (e.g., +91 80000 00000)';
    }
    return super.formatError(field, result);
  }
}
