import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import { APPS } from '../constants/urls';
import redirectAuth from '../utils/redirect-auth';
import { TOAST_OPTIONS } from '../constants/toast-options';
import { ERROR_MESSAGES } from '../constants/error-messages';
export default class IdentityRoute extends Route {
  @service router;
  @service login;
  @service fastboot;

  async model() {
    if (this.fastboot.isFastBoot) {
      return null;
    }

    try {
      const response = await fetch(`${APPS.API_BACKEND}/users?profile=true`, {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.toast.error(ERROR_MESSAGES.notLoggedIn, '', TOAST_OPTIONS);
          setTimeout(redirectAuth, 2000);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data?.roles?.in_discord) {
        this.router.transitionTo('index');
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      this.router.transitionTo('index');
      return null;
    }
  }
  setupController(controller, model) {
    super.setupController(controller, model);

    controller.userData = this.login.userData;
    controller.profileURL = controller.userData?.profileURL;

    const profileStatus = model?.profileStatus;
    switch (profileStatus) {
      case 'PENDING':
        controller.state = 'reload';
        break;
      case 'VERIFIED':
        controller.state = 'verified';
        break;
      case 'BLOCKED':
        controller.state = 'blocked';
        break;
      default:
        controller.state = 'getStarted';
    }
  }
}
