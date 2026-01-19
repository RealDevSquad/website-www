import Service, { service } from '@ember/service';

export default class FeatureFlagService extends Service {
  @service router;

  get isDevMode() {
    const queryParams = this.router?.currentRoute?.queryParams;
    return queryParams?.dev === 'true';
  }

  get isWordCloud() {
    const queryParams = this.router?.currentRoute?.queryParams;
    return queryParams?.wordCloud === 'true';
  }
}
