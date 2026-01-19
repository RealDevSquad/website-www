import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LoginRoute extends Route {
  @service router;
  @service login;

  beforeModel(transition) {
    if (transition?.to?.queryParams?.dev !== 'true') {
      this.router.transitionTo('/page-not-found');
    }
  }
}
