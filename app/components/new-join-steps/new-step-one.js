import BaseStepComponent from './base-step';
import { NEW_STEP_LIMITS, ROLE_OPTIONS } from '../../constants/new-join-form';
import { countryList } from '../../constants/country-list';
import { inject as service } from '@ember/service';

export default class NewStepOneComponent extends BaseStepComponent {
  @service login;

  storageKey = 'newStepOneData';
  validationMap = {
    country: NEW_STEP_LIMITS.stepOne.country,
    state: NEW_STEP_LIMITS.stepOne.state,
    city: NEW_STEP_LIMITS.stepOne.city,
    role: NEW_STEP_LIMITS.stepOne.role,
  };

  roleOptions = ROLE_OPTIONS;
  countries = countryList;

  constructor(...args) {
    super(...args);
    if (this.login.userData && !this.data.fullName) {
      this.data = {
        ...this.data,
        fullName: `${this.login.userData.first_name} ${this.login.userData.last_name}`,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      const validated = this.isDataValid();
      this.setIsValid(validated);
      localStorage.setItem('isValid', validated);
    }
  }

  selectRole(role) {
    this.inputHandler({ target: { name: 'role', value: role } });
  }
}
