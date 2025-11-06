import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ApplicationTermsService extends Service {
  @tracked hasUserAcceptedTerms = false;

  @action
  setTermsAccepted(isAccepted) {
    this.hasUserAcceptedTerms = isAccepted;
  }
}
