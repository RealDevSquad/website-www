import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { APPLICATIONS_LIST_URL } from '../../constants/apis';
import { TOAST_OPTIONS } from '../../constants/toast-options';

export default class AdminApplicationsRoute extends Route {
  @service login;
  @service router;
  @service toast;
  @service fastboot;

  beforeModel() {
    if (this.fastboot.isFastBoot) {
      return;
    }

    if (this.login.isLoading) {
      return;
    }

    if (!this.login.isLoggedIn) {
      this.router.transitionTo('/login');
      return;
    }

    if (this.login.userData && !this.login.userData?.roles?.super_user) {
      this.router.transitionTo('/page-not-found');
    }
  }

  async model(params) {
    if (this.fastboot.isFastBoot) {
      return { applications: [], total: 0, page: 1, size: 10 };
    }

    try {
      const size = params.size || 10;
      const page = params.page || 1;
      const response = await fetch(APPLICATIONS_LIST_URL(size, page), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      return {
        applications: data.applications || [],
        total: data.total || 0,
        page: data.page || 1,
        size: data.size || 10,
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      this.toast.error('Failed to load applications', 'Error', TOAST_OPTIONS);
      return {
        applications: [],
        total: 0,
        page: 1,
        size: 10,
      };
    }
  }
}
