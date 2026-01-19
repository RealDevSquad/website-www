import Controller from '@ember/controller';
import { TOAST_OPTIONS } from '../constants/toast-options';
import { APPS } from '../constants/urls';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DiscordController extends Controller {
  queryParams = ['token'];
  @service router;
  @service toast;
  @tracked discordId =
    this.model.externalAccountData.attributes.discordId || '';
  @tracked linkStatus = 'not-linked';
  @tracked isLinkingInProgress = false;
  @tracked consent = false;
  @tracked token = '';

  async model() {
    this.token = this.paramsFor('discord').token;
  }
  @action setConsent() {
    this.consent = !this.consent;
  }

  @action async linkDiscordAccount() {
    if (!this.consent) {
      this.toast.error(
        'Please provide consent by checking the checkbox',
        'ERROR',
        TOAST_OPTIONS,
      );
      return;
    }

    try {
      this.isLinkingInProgress = true;

      const response = await fetch(
        `${APPS.API_BACKEND}/external-accounts/link/${this.token}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );

      this.linkStatus = response.status === 204 ? 'linked' : 'failure';
    } catch (error) {
      this.linkStatus = 'failure';
      console.error('Failed to link Discord account:', error.message);
    } finally {
      this.isLinkingInProgress = false;
    }
  }
}
