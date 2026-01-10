import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import redirectAuth from '../utils/redirect-auth';
import {
  STATUS_NOT_EXIST_FAILURE_MESSAGE,
  USER_STATES,
} from '../constants/user-status';
import { TOAST_OPTIONS } from '../constants/toast-options';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { SELF_USER_STATUS_URL } from '../constants/apis';

export default class StatusRoute extends Route {
  @service toast;
  @service router;

  async model() {
    try {
      const response = await fetch(SELF_USER_STATUS_URL, {
        credentials: 'include',
      });
      const userData = await response.json();
      if (response.status === 200) {
        return userData?.data?.currentStatus?.state ?? USER_STATES.DNE;
      } else if (response.status === 401) {
        this.toast.error(ERROR_MESSAGES.notLoggedIn, 'Error!', TOAST_OPTIONS);
        // added setTimeout here because before new page opens user should be notified of error by toast
        setTimeout(redirectAuth, 2000);
      } else if (response.status === 404) {
        this.toast.error(
          STATUS_NOT_EXIST_FAILURE_MESSAGE,
          'Error!',
          TOAST_OPTIONS,
        );
        return USER_STATES.DNE;
      }
    } catch (error) {
      console.error(error.message);
      this.toast.error(
        'Something went wrong. ' + error.message,
        'Error!',
        TOAST_OPTIONS,
      );
    }
  }
}
