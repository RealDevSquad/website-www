import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { APPLICATIONS_URL, SELF_USER_PROFILE_URL } from '../constants/apis';
import apiRequest from '../utils/api-request';
import redirectAuth from '../utils/redirect-auth';
import { TOAST_OPTIONS } from '../constants/toast-options';

const APPLICATIONS_SIZE = 12;

export default class ApplicationsRoute extends Route {
  @service router;
  @service toast;

  queryParams = {
    dev: { refreshModel: true },
    status: { refreshModel: false },
    role: { refreshModel: false },
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
        const userData = await userResponse.json();
        this.toast.error(userData.message, '', TOAST_OPTIONS);
        setTimeout(redirectAuth, 2000);
        return { isTokenExpired: true };
      }

      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }

      const userData = await userResponse.json();

      const isSuperUser =
        userData?.roles?.super_user ||
        userData?.disabled_roles?.includes('super_user');

      if (!isSuperUser) {
        this.router.replaceWith('/page-not-found');
        return null;
      }

      const applicationsData = await this.fetchApplications(
        params.status,
        params.role,
      );

      return {
        status: params.status || null,
        role: params.role || null,
        applications: applicationsData.applications || [],
        nextLink: applicationsData.next || null,
        totalCount: applicationsData.totalCount || 0,
      };
    } catch (error) {
      this.toast.error(
        `Something went wrong. ${error.message}`,
        'Error!',
        TOAST_OPTIONS,
      );
      return {
        status: params.status || null,
        role: params.role || null,
        applications: [],
        nextLink: null,
        totalCount: 0,
      };
    }
  }

  async fetchApplications(status, role) {
    const applicationsResponse = await apiRequest(
      APPLICATIONS_URL(APPLICATIONS_SIZE, status, role),
    );

    if (!applicationsResponse.ok) {
      throw new Error(`HTTP error! status: ${applicationsResponse.status}`);
    }

    return await applicationsResponse.json();
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    if (model) {
      controller.status = model.status;
      controller.role = model.role;
      controller.allApplications = model.applications ?? [];
      controller.nextLink = model.nextLink ?? null;
      controller.totalCount = model.totalCount ?? 0;
      controller.isLoading = false;
      controller.isInfiniteScrollSetup = false;
    } else {
      controller.isLoading = true;
    }
  }
}
