import Route from '@ember/routing/route';

import { service } from '@ember/service';
import { APPLICATION_ID_LINK, APPLICATION_URL } from '../constants/apis';
import { APPS } from '../constants/urls';

export default class IntroRoute extends Route {
  queryParams = {
    id: { refreshModel: true },
    redirect: { refreshModel: true },
  };

  @service fastboot;
  @service router;

  async model(params) {
    if (this.fastboot.isFastBoot) {
      return;
    }
    const userId = params.id;
    const redirect = params.redirect;

    try {
      let userResponse;
      let userData;

      userResponse = await fetch(`${APPS.API_BACKEND}/users?profile=true`, {
        credentials: 'include',
      });
      userData = await userResponse.json();

      if (!userData.roles.super_user) {
        this.router.transitionTo('/join');
        return;
      }

      const response = await fetch(APPLICATION_URL(userId), {
        credentials: 'include',
      });

      if (response.status === 404) {
        this.router.transitionTo('/page-not-found');
        return;
      }

      const applicationData = await response.json();
      const applicationId = applicationData.data[0].id;

      if (userData?.roles?.super_user && redirect !== 'false') {
        window.location.replace(APPLICATION_ID_LINK(applicationId));
      }

      return applicationData.data;
    } catch (error) {
      console.error('Error fetching application details:', error);
      this.router.transitionTo('/page-not-found');
    }
  }
}
