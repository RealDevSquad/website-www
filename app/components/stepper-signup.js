import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TOAST_OPTIONS } from '../constants/toast-options';

const MAX_STEP = 15;
const MIN_STEP = 0;
export default class StepperSignupComponent extends Component {
  @service login;
  @service router;
  @service fastboot;
  @service featureFlag;
  @service toast;
  @service onboarding;
  @tracked preValid = false;
  @tracked isValid = JSON.parse(localStorage.getItem('isValid')) ?? false;
  @tracked currentStep = Number(localStorage.getItem('currentStep')) ?? 0;
  @tracked stepOneData = JSON.parse(localStorage.getItem('stepOneData'));
  @tracked stepTwoData = JSON.parse(localStorage.getItem('stepTwoData'));
  @tracked stepThreeData = JSON.parse(localStorage.getItem('stepThreeData'));
  setIsValid = (newVal) => (this.isValid = newVal);
  setIsPreValid = (newVal) => (this.preValid = newVal);

  constructor() {
    super(...arguments);

    if (!this.fastboot.isFastBoot && this.featureFlag.isDevMode) {
      if (
        localStorage.getItem('currentStep') !==
        new URLSearchParams(window.location.search).get('step')
      ) {
        const queryParams = { dev: true, step: this.currentStep };
        this.router.transitionTo('join', { queryParams });
      }
    }
  }

  get applicationStatus() {
    return this.onboarding.applicationData?.status;
  }

  get applicationFeedback() {
    return this.onboarding.applicationData?.feedback;
  }

  @action decrementStep() {
    if (this.currentStep > MIN_STEP) {
      this.currentStep -= 1;
      localStorage.setItem('currentStep', this.currentStep);
      const queryParams = { dev: true, step: this.currentStep };
      this.router.transitionTo('join', { queryParams });
    }
  }

  @action incrementStep() {
    if (this.currentStep < MAX_STEP) {
      this.currentStep += 1;
      localStorage.setItem('currentStep', this.currentStep);
      const queryParams = { dev: true, step: this.currentStep };
      this.router.transitionTo('join', { queryParams });
    }
  }

  @action startHandler() {
    if (this.login.isLoggedIn && !this.login.isLoading) {
      this.incrementStep();
    }
  }

  @action nextStep(e) {
    e.preventDefault();
    this.incrementStep();
    localStorage.setItem('isValid', false);
    this.isValid = false;
  }

  @action handleRefresh() {
    window.location.reload();
  }

  @action goToGenerateChaincodePage() {
    this.currentStep -= 3;
    const queryParams = { dev: true, step: this.currentStep };
    this.router.transitionTo('join', { queryParams });
  }

  @action async applicationHandler() {
    const firstName = this.login.userData.first_name;
    const lastName = this.login.userData.last_name;
    const data = JSON.stringify({
      firstName,
      lastName,
      ...this.stepOneData,
      ...this.stepTwoData,
      ...this.stepThreeData,
    });

    const response = await this.onboarding.addApplication(data);

    if (response.status === 201) {
      this.toast.success(
        'Successfully submitted the form',
        'Success!',
        TOAST_OPTIONS,
      );
      this.incrementStep();
    } else if (response.status === 409) {
      this.toast.error(
        'You have already filled the form',
        'User Exist!',
        TOAST_OPTIONS,
      );
    }
  }

  @action async joinDiscordAction() {
    const inviteLink = await this.onboarding.discordInvite();
    if (inviteLink) {
      window.open(`https://${inviteLink}`, '_blank');
    }
  }
}
