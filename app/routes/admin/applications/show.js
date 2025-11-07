import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { APPLICATION_DETAIL_URL } from '../../../constants/apis';
import { TOAST_OPTIONS } from '../../../constants/toast-options';

export default class AdminApplicationsShowRoute extends Route {
  @service login;
  @service router;
  @service toast;
  @service fastboot;

  async beforeModel() {
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
      return;
    }
  }

  async model(params) {
    if (this.fastboot.isFastBoot) {
      return null;
    }

    try {
      const response = await fetch(APPLICATION_DETAIL_URL(params.id), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        this.router.transitionTo('/page-not-found');
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch application');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching application:', error);
      this.toast.error('Failed to load application', 'Error', TOAST_OPTIONS);
      this.router.transitionTo('admin.applications');
      return null;
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    if (controller) {
      controller.feedbackText = '';
      controller.isProcessing = false;
    }
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.feedbackText = '';
      controller.isProcessing = false;
    }
  }
}
