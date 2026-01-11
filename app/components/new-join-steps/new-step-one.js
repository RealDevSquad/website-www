import { action } from '@ember/object';
import { service } from '@ember/service';
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
  @service toast;

  roleOptions = ROLE_OPTIONS;
  countries = countryList;

  @tracked imagePreview = null;
  @tracked isImageUploading = false;
  @tracked fileInputElement = null;

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
    if (
      !this.data.fullName &&
      this.login.userData?.first_name &&
      this.login.userData?.last_name
    ) {
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

  @action
  setFileInputElement(element) {
    this.fileInputElement = element;
  }

  @action
  clearFileInputElement() {
    this.fileInputElement = null;
  }

  @action
  triggerFileInput() {
    this.fileInputElement?.click();
  }

  @action
  handleImageSelect(event) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      this.toast.error(
        'Invalid file type. Please upload an image file.',
        'Error!',
      );
      return;
    }
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toast.error('Image size must be less than 2MB', 'Error!');
      return;
    }

    this.isImageUploading = true;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;
      this.imagePreview = base64String;
      this.updateFieldValue?.('profileImageBase64', base64String);
      this.isImageUploading = false;
    };
    reader.onerror = () => {
      this.toast.error(
        'Failed to read the selected file. Please try again.',
        'Error!',
      );
      this.isImageUploading = false;
    };

    reader.readAsDataURL(file);
  }
}
