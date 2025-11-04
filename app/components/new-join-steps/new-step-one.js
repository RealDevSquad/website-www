import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { countryList } from '../../constants/country-list';
import { NEW_STEP_LIMITS, ROLE_OPTIONS } from '../../constants/new-join-form';
import BaseStepComponent from './base-step';

export default class NewStepOneComponent extends BaseStepComponent {
  @service login;

  roleOptions = ROLE_OPTIONS;
  countries = countryList;

  get storageKey() {
    return 'newStepOneData';
  }

  validationMap = {
    country: NEW_STEP_LIMITS.stepOne.country,
    state: NEW_STEP_LIMITS.stepOne.state,
    city: NEW_STEP_LIMITS.stepOne.city,
    role: NEW_STEP_LIMITS.stepOne.role,
  };

  postLoadInitialize() {
    if (this.login.userData && !this.data.fullName) {
      this.updateFieldValue(
        'fullName',
        `${this.login.userData.first_name} ${this.login.userData.last_name}`,
      );
    }
  }

  @action selectRole(role) {
    this.inputHandler({ target: { name: 'role', value: role } });
  }
}
