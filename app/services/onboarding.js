import { tracked } from '@glimmer/tracking';
import Service, { service } from '@ember/service';
import { TOAST_OPTIONS } from '../constants/toast-options';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { GET_API_CONFIGS, POST_API_CONFIGS } from '../constants/live';
import { APPS } from '../constants/urls';
export default class OnboardingService extends Service {
  @service login;
  @service store;
  @service toast;
  @tracked applicationData;
  @tracked loadingApplicationData = true;

  constructor() {
    super(...arguments);

    (async () => {
      await this.getApplicationDetails();
    })();
  }

  async signup(dataToUpdate) {
    try {
      let user = this.store.peekRecord('user', dataToUpdate.username);

      if (!user) {
        user = this.store.createRecord('user', {});
      }

      if (dataToUpdate.roles) {
        user.set('roles', {
          ...user.get('roles'),
          ...dataToUpdate.roles,
        });
      }

      user.setProperties({
        first_name: dataToUpdate.first_name,
        last_name: dataToUpdate.last_name,
      });

      await user.save();
      this.toast.success('Signup successfully', 'Success!', TOAST_OPTIONS);
    } catch {
      this.toast.error(
        ERROR_MESSAGES.somethingWentWrong,
        'error!',
        TOAST_OPTIONS,
      );
    }
  }

  async generateUsername(firstname, lastname) {
    try {
      const sanitizedFirstname = firstname.toLowerCase();
      const sanitizedLastname = lastname.toLowerCase();
      const user = await this.store.queryRecord('user', {
        firstname: sanitizedFirstname,
        lastname: sanitizedLastname,
        dev: true,
      });
      if (user && user.username) {
        return user;
      }
    } catch {
      this.toast.error(
        ERROR_MESSAGES.usernameGeneration,
        'error!',
        TOAST_OPTIONS,
      );
    }
  }

  async addApplication(data) {
    try {
      const response = await fetch(`${APPS.API_BACKEND}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: data,
      });
      return response;
    } catch (err) {
      console.log('Error: ', err);
      this.toast.error('Some error occured', 'Error ocurred!', TOAST_OPTIONS);
    }
  }

  async discordInvite() {
    const discordInviteUrl = `${APPS.API_BACKEND}/discord-actions/invite`;
    try {
      let response = await fetch(discordInviteUrl, POST_API_CONFIGS);

      if (response.status === 409) {
        response = await fetch(discordInviteUrl, {
          ...GET_API_CONFIGS,
          credentials: 'include',
        });
      }

      const { inviteLink, message } = await response.json();

      if (response.status >= 400) {
        this.toast.error(message, 'error!', TOAST_OPTIONS);
      }

      return inviteLink;
    } catch (error) {
      console.error(error);
      this.toast.error(
        'Something went wrong! Please try again later.',
        'Error!',
        TOAST_OPTIONS,
      );
    }
  }

  async getApplicationDetails() {
    try {
      const userId = this.login.userData?.id;
      if (userId) {
        const applicationResponse = await fetch(
          `${APPS.API_BACKEND}/applications?userId=${userId}`,
          {
            credentials: 'include',
          },
        );
        const applicationData = await applicationResponse.json();

        this.applicationData = applicationData?.applications?.[0];
      }
    } catch (err) {
      console.error('Error: ', err);
      this.toast.error('Some error occured', 'Error ocurred!', TOAST_OPTIONS);
    } finally {
      this.loadingApplicationData = false;
    }
  }
}
