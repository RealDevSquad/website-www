import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class JoinRoute extends Route {
  @service login;
}
