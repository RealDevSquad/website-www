import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { validator } from '../../utils/validator';
import { debounce } from '@ember/runloop';
import { JOIN_DEBOUNCE_TIME } from '../../constants/join';
import { NEW_STEP_LIMITS, ROLE_OPTIONS } from '../../constants/new-join-form';
import { countryList } from '../../constants/country-list';
import { inject as service } from '@ember/service';

export default class NewStepOneComponent extends Component {
  @service login;

  @tracked data = JSON.parse(localStorage.getItem('newStepOneData')) ?? {
    fullName: '',
    country: '',
    state: '',
    city: '',
    role: '',
  };

  isValid;
  setIsValid;
  setIsPreValid;
  roleOptions = ROLE_OPTIONS;
  countries = countryList;

  constructor(...args) {
    super(...args);

    this.isValid = this.args.isValid;
    this.setIsValid = this.args.setIsValid;
    this.setIsPreValid = this.args.setIsPreValid;

    if (this.login.userData) {
      this.data.fullName = `${this.login.userData.first_name} ${this.login.userData.last_name}`;
    }

    const validated = this.isDataValid();
    localStorage.setItem('isValid', validated);
    this.setIsPreValid(validated);
  }

  isDataValid() {
    for (let field in this.data) {
      if (field === 'role') {
        if (!this.data[field]) return false;
      } else {
        const { isValid } = validator(
          this.data[field],
          NEW_STEP_LIMITS.stepOne[field],
        );
        if (!isValid) {
          return false;
        }
      }
    }
    return true;
  }

  @action inputHandler(e) {
    this.setIsPreValid(false);
    const setValToLocalStorage = () => {
      this.data = { ...this.data, [e.target.name]: e.target.value };
      localStorage.setItem('newStepOneData', JSON.stringify(this.data));
      localStorage.setItem('selectedRole', this.data.role);
      const validated = this.isDataValid();
      this.setIsValid(validated);
      localStorage.setItem('isValid', validated);
    };
    debounce(this.data, setValToLocalStorage, JOIN_DEBOUNCE_TIME);
  }

  @action selectRole(role) {
    this.setIsPreValid(false);
    this.data = { ...this.data, role };
    localStorage.setItem('newStepOneData', JSON.stringify(this.data));
    localStorage.setItem('selectedRole', role);
    const validated = this.isDataValid();
    this.setIsValid(validated);
    localStorage.setItem('isValid', validated);
  }
}
