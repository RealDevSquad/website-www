import Controller from '@ember/controller';
import { service } from '@ember/service';
import { ANKUSH_TWITTER, APPS } from '../constants/urls';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TOAST_OPTIONS } from '../constants/toast-options';

export default class JoinController extends Controller {
  @service router;
  @service login;
  @service featureFlag;
  @service onboarding;
  @tracked chaincode = 'Generate chaincode';
  @tracked isChaincodeClicked = false;
  @tracked isLoading = false;
  @tracked oldOnboarding = null;
  @tracked step = null;

  ANKUSH_TWITTER = ANKUSH_TWITTER;

  queryParams = ['step', 'dev', 'oldOnboarding'];

  get isDevMode() {
    return this.featureFlag.isDevMode;
  }

  get isOldOnboarding() {
    return this.oldOnboarding === 'true';
  }

  get stepFromParam() {
    return Number(this.step ?? 0);
  }

  get applicationData() {
    return this.onboarding.applicationData;
  }

  get loading() {
    return this.login.isLoading || this.onboarding.loadingApplicationData;
  }

  get isLoggedIn() {
    return this.login.isLoggedIn && this.login.userData;
  }

  @action async handleGenerateChaincode(e) {
    e.preventDefault();

    this.isLoading = true;

    try {
      const response = await fetch(`${APPS.API_BACKEND}/users/chaincode`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const { chaincode } = await response.json();

      if (!response.ok)
        return this.toast.error(
          'Something went wrong. Please check console errors.',
          '',
          TOAST_OPTIONS,
        );

      this.chaincode = chaincode;
      this.isChaincodeClicked = true;
      this.toast.info('Generated New Chaincode!!', '', TOAST_OPTIONS);
    } catch {
      this.toast.error(
        'Something went wrong. Please check console errors.',
        '',
        TOAST_OPTIONS,
      );
    } finally {
      this.isLoading = false;
    }
  }

  @action async joinDiscordAction() {
    const inviteLink = await this.onboarding.discordInvite();
    if (inviteLink) {
      window.open(`https://${inviteLink}`, '_blank');
    }
  }
}
