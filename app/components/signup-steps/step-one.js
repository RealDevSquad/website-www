import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounceTask } from 'ember-lifeline';
import { service } from '@ember/service';
import { ROLE } from '../../constants/stepper-signup-data';
import { JOIN_DEBOUNCE_TIME } from '../../constants/join';
export default class SignupStepsStepOneComponent extends Component {
  @service toast;
  @service onboarding;
  @service login;
  @tracked data = { firstname: '', lastname: '', username: '', role: '' };
  @tracked isSignupButtonDisabled = true;
  @tracked isSignupButtonLoading = false;
  @tracked isValid = true;
  @tracked mavenRoleConfirm = false;
  role = ROLE;
  @tracked errorMessage = {
    firstname: '',
    lastname: '',
  };
  @tracked currentStep = 1;

  nameValidator(name) {
    const pattern = /^[a-zA-Z]{1,20}$/;

    if (pattern.test(name)) {
      return { isValid: false };
    } else {
      return { isValid: true };
    }
  }

  isSignupDetailsFilled() {
    if (this.data.role === 'Maven') {
      return (
        !!this.data.firstname &&
        !!this.data.lastname &&
        !!this.data.role &&
        this.mavenRoleConfirm
      );
    } else {
      return !!this.data.firstname && !!this.data.lastname && !!this.data.role;
    }
  }

  passVal(e) {
    this.data = {
      ...this.data,
      [e.target.name]: e.target.value,
    };
    this.mavenRoleConfirm = e.target.checked;
    if (this.isSignupDetailsFilled()) {
      this.isSignupButtonDisabled = false;
    } else {
      this.isSignupButtonDisabled = true;
    }
    const field = e.target.name;
    if (field === 'firstname' || field === 'lastname') {
      const { isValid } = this.nameValidator(e.target.value);
      this.errorMessage = {
        ...this.errorMessage,
        [field]: isValid
          ? `No spaces, numbers, or special characters allowed.`
          : '',
      };
    }
    if (
      this.data.firstname.trim() > '' &&
      this.data.lastname.trim() > '' &&
      this.errorMessage.firstname === '' &&
      this.errorMessage.lastname === ''
    ) {
      this.isValid = false;
    } else {
      this.isValid = true;
    }
  }
  @action inputHandler(e) {
    debounceTask(this, 'passVal', e, JOIN_DEBOUNCE_TIME);
  }

  @action async signup() {
    this.isSignupButtonLoading = true;
    this.isSignupButtonDisabled = true;
    const { username } = await this.onboarding.generateUsername(
      this.data.firstname,
      this.data.lastname,
    );

    let dataToUpdate = {
      username,
      first_name: this.data.firstname,
      last_name: this.data.lastname,
    };

    if (this.data.role !== 'Developer') {
      dataToUpdate.roles = {
        maven: this.data.role === 'Maven',
        designer: this.data.role === 'Designer',
        product_manager: this.data.role === 'Product Manager',
      };
    }

    await this.onboarding.signup(dataToUpdate);
    // Update user records firstname and lastname
    const user = this.login.userData;
    if (!user.first_name || !user.last_name) {
      this.login.userData.first_name = this.data.firstname;
      this.login.userData.last_name = this.data.lastname;
      this.login.userData.username = username;
    }
    // To get user details after signup
    localStorage.setItem('role', this.data.role);
    this.args.incrementStep();
    this.isSignupButtonLoading = false;
  }
}
