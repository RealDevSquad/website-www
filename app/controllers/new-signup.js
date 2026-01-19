import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { APPS } from '../constants/urls';
import { TOAST_OPTIONS } from '../constants/toast-options';
import {
  CHECK_USERNAME_AVAILABILITY,
  GENERATE_USERNAME_URL,
  SELF_USER_PROFILE_URL,
  SELF_USERS_URL,
} from '../constants/apis';
import {
  SIGNUP_ERROR_MESSAGES,
  NEW_SIGNUP_STEPS,
} from '../constants/new-signup';
import apiRequest from '../utils/api-request';

export default class NewSignupController extends Controller {
  @service toast;

  queryParams = ['currentStep', 'dev'];

  @tracked dev;
  @tracked isLoading = false;
  @tracked isButtonDisabled = true;
  @tracked error = '';
  @tracked currentStep = NEW_SIGNUP_STEPS[0];
  FIRST_STEP = NEW_SIGNUP_STEPS[0];
  SECOND_STEP = NEW_SIGNUP_STEPS[1];
  THIRD_STEP = NEW_SIGNUP_STEPS[2];
  FOURTH_STEP = NEW_SIGNUP_STEPS[3];
  LAST_STEP = NEW_SIGNUP_STEPS[4];

  @tracked signupDetails = {
    firstName: '',
    lastName: '',
    role: '',
  };

  get isDevMode() {
    return this.dev === 'true';
  }

  async generateUsername(firstname, lastname) {
    if (typeof firstname !== 'string' || typeof lastname !== 'string') {
      throw new Error(SIGNUP_ERROR_MESSAGES.invalidInput);
    }
    try {
      const sanitizedFirstname = firstname.toLowerCase();
      const sanitizedLastname = lastname.toLowerCase();

      const response = await apiRequest(
        GENERATE_USERNAME_URL(sanitizedFirstname, sanitizedLastname),
      );

      const user = await response.json();
      return user.username;
    } catch {
      this.toast.error(
        SIGNUP_ERROR_MESSAGES.usernameGeneration,
        'error!',
        TOAST_OPTIONS,
      );
      throw new Error(SIGNUP_ERROR_MESSAGES.usernameGeneration);
    }
  }

  async checkUserName(userName) {
    try {
      const response = await apiRequest(CHECK_USERNAME_AVAILABILITY(userName));
      const data = await response.json();
      const { isUsernameAvailable } = data;
      return isUsernameAvailable;
    } catch {
      this.toast.error(SIGNUP_ERROR_MESSAGES.others, 'error!', TOAST_OPTIONS);
      return false;
    }
  }

  async registerUser(signupDetails, devFlag) {
    const getResponse = await apiRequest(SELF_USER_PROFILE_URL);
    const userData = await getResponse.json();
    const url = SELF_USERS_URL(userData?.id, devFlag);
    const res = await apiRequest(url, 'PATCH', signupDetails);
    if (!res) {
      throw new Error(SIGNUP_ERROR_MESSAGES.others);
    }
    return res;
  }

  @action changeStep(step) {
    this.currentStep = step;

    if (step !== this.SECOND_STEP) {
      this.isButtonDisabled = true;
    } else {
      this.isButtonDisabled = false;
    }
  }

  @action register() {
    this.isButtonDisabled = true;
    this.signup();
  }

  @action completeSignUp() {
    const url = new URL(APPS.GOTO);
    if (this.dev === 'true') {
      url.searchParams.set('dev', 'true');
    }
    window.open(url.toString(), '_self');
  }

  @action handleInputChange(key, value) {
    this.error = '';
    set(this.signupDetails, key, value);
    if (this.signupDetails[key].trim() !== '') this.isButtonDisabled = false;
    else this.isButtonDisabled = true;
  }

  @action handleCheckboxInputChange(selectedRole) {
    this.signupDetails.role = selectedRole;
    this.isButtonDisabled = !selectedRole;
  }

  @action async signup() {
    try {
      let username;
      const { firstName, lastName, role } = this.signupDetails;
      this.isLoading = true;

      if (!this.isDevMode) {
        username = await this.generateUsername(firstName, lastName);

        const isUsernameAvailable = await this.checkUserName(username);

        if (!isUsernameAvailable) {
          this.isLoading = false;
          this.isButtonDisabled = false;
          return (this.error = SIGNUP_ERROR_MESSAGES.userName);
        }
      }

      const basePayload = {
        first_name: firstName,
        last_name: lastName,
      };

      const signupDetails = this.isDevMode
        ? { ...basePayload, role }
        : { ...basePayload, username };

      const res = await this.registerUser(signupDetails, this.isDevMode);

      if (res?.status === 204) {
        this.currentStep = this.LAST_STEP;
      } else {
        this.error = SIGNUP_ERROR_MESSAGES.others;
        this.isButtonDisabled = false;
      }
    } catch (error) {
      this.error = error?.message || SIGNUP_ERROR_MESSAGES.others;
      this.isButtonDisabled = false;
    } finally {
      this.isLoading = false;
    }
  }
}
