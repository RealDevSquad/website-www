import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { countryList } from '../../constants/country-list';
import {
  NEW_STEP_LIMITS,
  ROLE_OPTIONS,
  STEP_DATA_STORAGE_KEY,
} from '../../constants/new-join-form';
import BaseStepComponent from './base-step';

export default class NewStepOneComponent extends BaseStepComponent {
  @service login;

  roleOptions = ROLE_OPTIONS;
  countries = countryList;

  @tracked imagePreview = null;

  get storageKey() {
    return STEP_DATA_STORAGE_KEY.stepOne;
  }

  stepValidation = {
    country: NEW_STEP_LIMITS.stepOne.country,
    state: NEW_STEP_LIMITS.stepOne.state,
    city: NEW_STEP_LIMITS.stepOne.city,
    role: NEW_STEP_LIMITS.stepOne.role,
  };

  postLoadInitialize() {
    if (!this.data.fullName && this.login.userData) {
      this.updateFieldValue(
        'fullName',
        `${this.login.userData.first_name} ${this.login.userData.last_name}`,
      );
    }
    if (this.data.profileImageBase64) {
      this.imagePreview = this.data.profileImageBase64;
    }
  }

  @action selectRole(role) {
    this.inputHandler({ target: { name: 'role', value: role } });
  }

  @action triggerFileInput() {
    const fileInput = document.getElementById('profile-image-input');
    if (fileInput) {
      fileInput.click();
    }
  }

  @action handleImageSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;
      this.imagePreview = base64String;
      this.updateFieldValue('profileImageBase64', base64String);
    };
    reader.readAsDataURL(file);
  }
}
