import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LiveRoute extends Route {
  @service router;

  beforeModel(transition) {
    if (transition?.to?.queryParams?.dev !== 'true') {
      this.router.transitionTo('/page-not-found');
    }
  }
}
