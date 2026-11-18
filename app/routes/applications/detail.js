import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  APPLICATIONS_BY_USER_URL,
  SELF_USER_PROFILE_URL,
} from '../../constants/apis';
import { ERROR_MESSAGES } from '../../constants/error-messages';
import { TOAST_OPTIONS } from '../../constants/toast-options';
import apiRequest from '../../utils/api-request';
import redirectAuth from '../../utils/redirect-auth';

export default class ApplicationsDetailRoute extends Route {
  @service toast;

  async model() {
    try {
      const userResponse = await apiRequest(SELF_USER_PROFILE_URL);
      if (userResponse.status === 401) {
        this.toast.error(ERROR_MESSAGES.notLoggedIn, '', TOAST_OPTIONS);
        setTimeout(redirectAuth, 2000);
        return { application: null, currentUser: null };
      }

      const userData = await userResponse.json();
      const userId = userData.id || userData.user?.id;

      if (!userId) {
        this.toast.error('User ID not found', 'Error!', TOAST_OPTIONS);
        return { application: null, currentUser: userData };
      }

      const applicationResponse = await apiRequest(
        APPLICATIONS_BY_USER_URL(userId),
      );

      if (applicationResponse.status === 404) {
        this.toast.error('Application not found', 'Error!', TOAST_OPTIONS);
        return { application: null, currentUser: userData };
      }

      if (!applicationResponse.ok) {
        throw new Error(`HTTP error! status: ${applicationResponse.status}`);
      }

      const applicationData = await applicationResponse.json();
      const applications = applicationData?.applications || [];
      const application = applications[0] || null;

      return { application, currentUser: userData };
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
