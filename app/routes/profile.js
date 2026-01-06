import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { APPS } from '../constants/urls';
import fetch from 'fetch';
import { TOAST_OPTIONS } from '../constants/toast-options';
import redirectAuth from '../utils/redirect-auth';

const BASE_URL = APPS.API_BACKEND;

export default class ProfileRoute extends Route {
  @service toast;
  @service fastboot;

  async model() {
    try {
      const res = await fetch(`${BASE_URL}/users/isDeveloper`, {
        credentials: 'include',
      });
      const { developerRoleExistsOnUser } = await res.json();

      const response = await fetch(`${BASE_URL}/users?profile=true`, {
        credentials: 'include',
      });
      const userData = await response.json();

      if (response.status === 401) {
        throw new Error('You are not logged in. Please login to continue.');
      }
      userData.isDeveloper = developerRoleExistsOnUser;
      return userData;
    } catch (error) {
      console.error(error.message);
      this.toast.error(error, '', TOAST_OPTIONS);

      if (!this.fastboot.isFastBoot && !this.isRedirecting) {
        this.isRedirecting = true;
        setTimeout(() => {
          redirectAuth();
          this.isRedirecting = false;
        }, 2000);
      }
    }
  }
}
