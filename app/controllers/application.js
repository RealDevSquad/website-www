import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { APPS } from 'website-www/constants/urls';

export default class ApplicationController extends Controller {
  @service login;
  @service featureFlag;

  get isDevMode() {
    return this.featureFlag.isDevMode;
  }

  @action async signOut() {
    try {
      fetch(`${APPS.API_BACKEND}/auth/signout`, {
        method: 'GET',
        credentials: 'include',
      }).then(() => {
        location.reload();
      });
    } catch (error) {
      console.error(error);
    }
  }
}
