import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { AUTH } from '../../constants/urls';
import { GET_STARTED_MAIN_HEADING } from '../../constants/new-signup';
import { tracked } from '@glimmer/tracking';

export default class SignupStepsStepZeroComponent extends Component {
  @service login;
  @service router;
  @service fastboot;
  @service store;
  @service controller;
  @tracked currentStep = 0;
  GET_STARTED_MAIN_HEADING = GET_STARTED_MAIN_HEADING;

  @action loginWithGithub() {
    if (!this.login.isLoggedIn) {
      const currentURL = this.fastboot.isFastBoot
        ? this.fastboot.request.protocol +
          '//' +
          this.fastboot.request.host +
          this.fastboot.request.path
        : window.location.href;
      window.location.href = `${AUTH.SIGN_IN}?redirectURL=${currentURL}`;
    }
  }
}
