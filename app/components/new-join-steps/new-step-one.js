import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { countryList } from '../../constants/country-list';
import {
  NEW_STEP_LIMITS,
  ROLE_OPTIONS,
  STEP_DATA_STORAGE_KEY,
} from '../../constants/new-join-form';
import { PROFILE_IMAGE_UPLOAD_URL } from '../../constants/apis';
import { TOAST_OPTIONS } from '../../constants/toast-options';
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
  async handleImageSelect(event) {
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

    try {
      const formData = new FormData();
      formData.append('profile', file);

      const response = await fetch(PROFILE_IMAGE_UPLOAD_URL, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.picture || data.url;

        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target.result;
          this.imagePreview = base64String;
          this.updateFieldValue?.('imageUrl', imageUrl);
        };
        reader.readAsDataURL(file);

        this.toast.success(
          'Profile image uploaded successfully!',
          'Success!',
          TOAST_OPTIONS,
        );
      } else {
        const errorData = await response.json();
        this.toast.error(
          errorData.message || 'Failed to upload image. Please try again.',
          'Error!',
        );
      }
    } catch (error) {
      console.error('Image upload error:', error);
      this.toast.error('Failed to upload image. Please try again.', 'Error!');
    } finally {
      this.isImageUploading = false;
    }
  }
}
