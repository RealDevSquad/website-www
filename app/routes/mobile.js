import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TOAST_OPTIONS } from '../constants/toast-options';
import redirectAuth from '../utils/redirect-auth';
import { SELF_USER_PROFILE_URL } from '../constants/apis';
import { ERROR_MESSAGES } from '../constants/error-messages';

export default class MobileRoute extends Route {
  @service toast;
  @service router;

  async model() {
    try {
      const response = await fetch(SELF_USER_PROFILE_URL, {
        credentials: 'include',
      });
      const userData = await response.json();
      if (response.status === 200) {
        return {
          userId: userData.id,
        };
      } else if (response.status === 401) {
        this.toast.error(ERROR_MESSAGES.notLoggedIn, 'Error!', TOAST_OPTIONS);

        // added setTimeout here because before new page opens user should be notified of error by toast
        setTimeout(redirectAuth, 2000);
      }
    } catch (error) {
      console.error(error.message);
      this.toast.error(
        ERROR_MESSAGES.somethingWentWrong + error.message,
        'Error!',
        TOAST_OPTIONS,
      );
    }
  }
}
