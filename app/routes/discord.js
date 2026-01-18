import Route from '@ember/routing/route';
import { APPS } from '../constants/urls';
import { service } from '@ember/service';
import redirectAuth from '../utils/redirect-auth';
import { TOAST_OPTIONS } from '../constants/toast-options';

export default class DiscordRoute extends Route {
  @service router;
  @service toast;
  queryParams = {
    token: { refreshModel: true },
  };

  async model() {
    try {
      const token = this.paramsFor('discord').token;
      const externalAccountResponse = await fetch(
        `${APPS.API_BACKEND}/external-accounts/${token}`,
        {
          credentials: 'include',
        },
      );
      const userResponse = await fetch(
        `${APPS.API_BACKEND}/users?profile=true`,
        {
          credentials: 'include',
        },
      );

      if (userResponse.status === 401) {
        const userData = await userResponse.json();
        this.toast.error(userData.message, '', TOAST_OPTIONS);
        setTimeout(redirectAuth, 2000);
        return { isTokenExpired: true };
      }

      if (externalAccountResponse.status === 401) {
        const externalAccountData = await externalAccountResponse.json();
        this.toast.error(externalAccountData.message, '', TOAST_OPTIONS);
        return { isTokenExpired: true };
      }

      if (
        userResponse.status === 200 &&
        externalAccountResponse.status === 200
      ) {
        const externalAccountData = await externalAccountResponse.json();
        const userData = await userResponse.json();
        return { externalAccountData, userData, isTokenExpired: false };
      }

      throw new Error('Unexpected response status');
    } catch (error) {
      this.toast.error(error.message, '', TOAST_OPTIONS);
      console.error(error.message);
      return { isTokenExpired: true, error: error.message };
    }
  }
}
