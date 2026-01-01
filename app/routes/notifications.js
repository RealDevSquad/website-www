import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class NotificationsRoute extends Route {
  @service router;

  queryParams = {
    dev: {
      refreshModel: false,
    },
  };

  beforeModel(transition) {
    if (transition?.to?.queryParams?.dev !== 'true') {
      this.router.transitionTo('/page-not-found');
    }
  }
}
