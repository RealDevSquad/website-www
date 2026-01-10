import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { APPS, AUTH } from '../constants/urls';


export default class LoginService extends Service {
  @service store;
  @tracked isLoggedIn = false;
  @tracked userData;
  @tracked isLoading = true;
  @service fastboot;
  @service featureFlag;

  HeadersToCopy = ['Host', 'Cookie', 'User-Agent'];

  constructor() {
    super(...arguments);

    this.checkAuth();
  }

  checkAuth() {
    //TODO: try working this with ember-data
    fetch(`${APPS.API_BACKEND}/users?profile=true`, {
      credentials: 'include',
      headers: this.buildHeaders(),
    })
      .then(function (response) {
        if (response.status === 200) {
          return response.json();
        }
        throw response;
      })
      .then((user) => {
        if (user.incompleteUserDetails && !this.featureFlag.isDevMode)
          window.location.replace(AUTH.SIGN_UP);
        this.isLoggedIn = true;
        this.userData = user;
      })
      .catch((error) => {
        this.isLoggedIn = false;
        console.error(error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  buildHeaders(headers = {}) {
    let isFastBoot = this.fastboot.isFastBoot;

    if (!isFastBoot) {
      return headers;
    }

    let requestHeaders = this.fastboot.request.headers;
    this.HeadersToCopy.forEach((n) => (headers[n] = requestHeaders.get(n)));
    headers['X-forwarded-by'] = 'FastBoot';

    return headers;
  }
}
