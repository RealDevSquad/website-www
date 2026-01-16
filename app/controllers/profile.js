import Controller from '@ember/controller';
import { APPS } from '../constants/urls';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { TOAST_OPTIONS } from '../constants/toast-options';
import { profile_fields } from '../constants/profile-field';
const BASE_URL = APPS.API_BACKEND;

export default class ProfileController extends Controller {
  @service toast;

  get imageUploadUrl() {
    return `${BASE_URL}/users/picture`;
  }
  @tracked formDataKeyName = 'profile';
  @tracked showEditProfilePictureModal = false;
  @tracked title = 'Profile Details';
  @tracked isSubmitDisabled = true;
  @tracked userId = this.model.id || '';
  @tracked formData = {
    first_name: this.model.first_name,
    last_name: this.model.last_name,
    company: this.model.company,
    designation: this.model.designation,
    linkedin_id: this.model.linkedin_id,
    twitter_id: this.model.twitter_id,
    website: this.model.website,
  };

  @tracked fields = profile_fields;

  @action handleFieldChange(name, value) {
    set(this.formData, name, value);

    const anyErrors = this.fields.map((field) => {
      let hasError = false;

      if (field.required && this.formData[field.id] === '') {
        hasError = true;
      }
      return hasError;
    });
    this.isSubmitDisabled = anyErrors.filter(Boolean).length;
  }

  @action handleFieldValidation(id, isValid) {
    const index = this.fields.findIndex((field) => field.id === id);
    if (isValid) {
      set(this.fields[index], 'showError', false);
    } else {
      set(this.fields[index], 'showError', true);
    }
  }

  removeEmptyFields(reqObject) {
    const objectRequested = reqObject;
    for (const field in objectRequested) {
      if (!objectRequested[field]) {
        delete objectRequested[field];
      } else if (field === 'yoe') {
        objectRequested[field] = parseInt(objectRequested[field]);
      }
    }
    return objectRequested;
  }

  @action async handleSubmit(e) {
    e.preventDefault();
    const cleanReqObject = this.removeEmptyFields(this.formData);
    try {
      const response = await fetch(
        `${BASE_URL}/users/${this.userId}?profile=true&dev=true`,
        {
          method: 'PATCH',
          body: JSON.stringify(cleanReqObject),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );

      const { status } = response;
      if (status === 204) {
        this.toast.success('Updated details successfully', '', {
          ...TOAST_OPTIONS,
          timeOut: '1000',
        });
      } else if (status !== 204) {
        this.toast.error(
          'Something went wrong. Please check console errors.',
          '',
          TOAST_OPTIONS,
        );
      }
    } catch (error) {
      console.error('Error : ', error);
    }
  }

  @action handleShowEditProfilePictureModal() {
    this.showEditProfilePictureModal = true;
  }
  @action closeModal() {
    this.showEditProfilePictureModal = false;
  }

  @action refreshRoute() {
    this.send('refreshModel');
  }
}
