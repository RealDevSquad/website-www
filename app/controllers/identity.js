import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class IdentityController extends Controller {
  @service login;

  @tracked userData = null;
  @tracked profileURL = null;
  @tracked state = 'getStarted';

  @action
  setState(newState) {
    this.state = newState;
  }
}
