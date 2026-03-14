import Controller from '@ember/controller';
import { service } from '@ember/service';
import { APPS, AUTH } from '../constants/urls';
import { tracked } from '@glimmer/tracking';

export default class GotoController extends Controller {
  queryParams = ['dev'];
  @service router;
  @service store;
  @service fastboot;
  @tracked user;

  WELCOME_URL = APPS.WELCOME;
  SIGN_UP_URL = AUTH.SIGN_UP;
  HOME_URL = APPS.HOME;

  constructor() {
    super(...arguments);

    if (!this.fastboot.isFastBoot) {
      const queryParams = new URLSearchParams(window.location.search);
      const isDev = Boolean(queryParams.get('dev'));

      (async () => {
        await this.getSelfUser();
        this.redirectionHandler(isDev, this.user);
      })();
    }
  }

  redirectionHandler(isDev, user) {
    if (user.incompleteUserDetails) {
      this.redirectUserToPage(this.SIGN_UP_URL);
    } else {
      this.redirectUserToPage(this.HOME_URL);
    }
  }

  redirectUserToPage(url) {
    window.location.replace(url);
  }

  async getSelfUser() {
    const response = await fetch(`${APPS.API_BACKEND}/users?profile=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const userData = await response.json();
    this.user = userData;
  }
}
