import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TOAST_OPTIONS } from '../../constants/toast-options';
import redirectAuth from '../../utils/redirect-auth';
import { ERROR_MESSAGES } from '../../constants/error-messages';
import {
  SELF_USER_PROFILE_URL,
  APPLICATION_BY_ID_URL,
} from '../../constants/apis';
import apiRequest from '../../utils/api-request';
export default class ApplicationsDetailRoute extends Route {
  @service toast;
  @service router;

  beforeModel(transition) {
    if (transition?.to?.queryParams?.dev !== 'true') {
      this.router.replaceWith('/page-not-found');
    }
  }

  async model(params) {
    try {
      const userResponse = await apiRequest(SELF_USER_PROFILE_URL);

      if (userResponse.status === 401) {
        this.toast.error(ERROR_MESSAGES.notLoggedIn, '', TOAST_OPTIONS);
        setTimeout(redirectAuth, 2000);
        this.router.replaceWith('/page-not-found');
        return null;
      }

      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }

      const applicationResponse = await apiRequest(
        APPLICATION_BY_ID_URL(params.id),
      );

      if (applicationResponse.status === 404) {
        this.toast.error('Application not found', 'Error!', TOAST_OPTIONS);
        return null;
      }

      if (!applicationResponse.ok) {
        throw new Error(`HTTP error! status: ${applicationResponse.status}`);
      }

      const applicationData = await applicationResponse.json();
      return applicationData;
    } catch (error) {
      this.toast.error(
        'Something went wrong. ' + error.message,
        'Error!',
        TOAST_OPTIONS,
      );
      return null;
    }
  }
}
