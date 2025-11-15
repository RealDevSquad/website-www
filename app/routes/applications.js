import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TOAST_OPTIONS } from '../constants/toast-options';
import { APPLICATIONS_URL, SELF_USER_PROFILE_URL } from '../constants/apis';
import redirectAuth from '../utils/redirect-auth';
import { ERROR_MESSAGES } from '../constants/error-messages';
import apiRequest from '../utils/api-request';

const APPLICATIONS_SIZE = 6;

export default class ApplicationsRoute extends Route {
  @service toast;
  @service router;

  queryParams = {
    dev: { refreshModel: true },
  };

  beforeModel(transition) {
    if (transition?.to?.queryParams?.dev !== 'true') {
      this.router.replaceWith('/page-not-found');
    }
  }

  async model(params, transition) {
    if (transition?.to?.name === 'applications.detail') {
      return null;
    }

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

      const userData = await userResponse.json();

      if (!userData?.roles?.super_user) {
        this.router.replaceWith('/page-not-found');
        return null;
      }

      const applicationsResponse = await apiRequest(
        APPLICATIONS_URL(APPLICATIONS_SIZE),
      );

      if (!applicationsResponse.ok) {
        throw new Error(`HTTP error! status: ${applicationsResponse.status}`);
      }

      const applicationsData = await applicationsResponse.json();
      return applicationsData.applications || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      this.toast.error(
        'Something went wrong. ' + error.message,
        'Error!',
        TOAST_OPTIONS,
      );
      return null;
    }
  }
}
