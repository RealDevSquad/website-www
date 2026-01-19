import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  APPLICATION_BY_ID_URL,
  SELF_USER_PROFILE_URL,
} from '../../constants/apis';
import { ERROR_MESSAGES } from '../../constants/error-messages';
import { TOAST_OPTIONS } from '../../constants/toast-options';
import apiRequest from '../../utils/api-request';
import redirectAuth from '../../utils/redirect-auth';

export default class ApplicationsDetailRoute extends Route {
  @service toast;
  @service router;

  async model(params) {
    try {
      const userResponse = await apiRequest(SELF_USER_PROFILE_URL);
      if (userResponse.status === 401) {
        this.toast.error(ERROR_MESSAGES.notLoggedIn, '', TOAST_OPTIONS);
        setTimeout(redirectAuth, 2000);
        return { application: null, currentUser: null };
      }

      const applicationResponse = await apiRequest(
        APPLICATION_BY_ID_URL(params.id),
      );

      if (applicationResponse.status === 404) {
        this.toast.error('Application not found', 'Error!', TOAST_OPTIONS);
        return { application: null, currentUser: null };
      }

      if (!applicationResponse.ok) {
        throw new Error(`HTTP error! status: ${applicationResponse.status}`);
      }

      const userData = await userResponse.json();
      const applicationData = await applicationResponse.json();
      return {
        application: applicationData?.application,
        currentUser: userData,
      };
    } catch (error) {
      this.toast.error(
        'Something went wrong. ' + error.message,
        'Error!',
        TOAST_OPTIONS,
      );
      return { application: null, currentUser: null };
    }
  }
}
