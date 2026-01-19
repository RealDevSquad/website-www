import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TOAST_OPTIONS } from '../constants/toast-options';
import { SIGNUP_ERROR_MESSAGES } from '../constants/new-signup';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { APPS } from '../constants/urls';
import { SELF_USER_PROFILE_URL } from '../constants/apis';
import redirectAuth from '../utils/redirect-auth';

export default class NewSignupRoute extends Route {
  @service toast;
  @service router;

  async model() {
    try {
      const response = await fetch(SELF_USER_PROFILE_URL, {
        credentials: 'include',
      });
      const userData = await response.json();
      if (response.status === 401) {
        this.toast.error(
          SIGNUP_ERROR_MESSAGES.loggedIn,
          'Error!',
          TOAST_OPTIONS,
        );
        setTimeout(redirectAuth, 2000);
      }
      if (response.status === 200 && !userData.incompleteUserDetails) {
        this.toast.error(
          SIGNUP_ERROR_MESSAGES.formAlreadyFilled,
          'Error!',
          TOAST_OPTIONS,
        );
        const url = new URL(APPS.GOTO);
        if (this.isDevMode) {
          url.searchParams.set('dev', 'true');
        }
        setTimeout(() => window.open(url.toString(), '_self'), 2000);
      }
    } catch {
      this.toast.error(
        ERROR_MESSAGES.somethingWentWrong,
        'Error!',
        TOAST_OPTIONS,
      );
    }
  }
}
