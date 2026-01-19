import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { RDS_TWITTER, APPS } from '../constants/urls';
import { TOAST_OPTIONS } from '../constants/toast-options';
import { phoneNumberRegex } from '../constants/regex';

export default class SubscribeController extends Controller {
  @service login;
  @tracked isFormOpen = false;
  @tracked email = '';
  @tracked phone = '';
  @tracked userData = null;
  @tracked isLoading = false;
  @tracked showSubscribedMessage = false;
  @service toast;
  @service featureFlag;
  @tracked isPhoneValid = true;

  RDS_TWITTER = RDS_TWITTER;

  constructor() {
    super(...arguments);
    this.userData = this.login.userData;
  }

  get isDevMode() {
    return this.featureFlag.isDevMode;
  }

  get isLoggedIn() {
    return this.login.isLoggedIn;
  }

  get isSubscribed() {
    return this.login.userData.isSubscribed;
  }

  get isSubmitDisabled() {
    const isPhoneValid = !this.phone || phoneNumberRegex.test(this.phone);
    return !this.email || !isPhoneValid;
  }

  @action
  toggleFormModal() {
    this.isFormOpen = !this.isFormOpen;
  }

  @action
  updateEmail(event) {
    this.email = event.target.value;
  }

  @action
  updatePhone(event) {
    this.phone = event.target.value;
    this.isPhoneValid = !this.phone || phoneNumberRegex.test(this.phone);
  }

  @action
  async handleSubmit(event) {
    event.preventDefault();
    if (!this.isSubmitDisabled) {
      this.isLoading = true;
      try {
        const url = `${APPS.API_BACKEND}/subscription?dev=true`;
        const response = await fetch(url, {
          method: 'POST',
          body: JSON.stringify({
            email: this.email,
            phone: this.phone,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!response.ok) {
          this.toast.error(
            'Something went wrong. Please try again.',
            '',
            TOAST_OPTIONS,
          );
        } else {
          this.login.userData.isSubscribed = true;
          this.isFormOpen = false;
          this.showSubscribedMessage = true;
          this.toast.success('🎉 Thankyou for subscribing!', '', TOAST_OPTIONS);
        }
      } catch (error) {
        console.log(error);
        this.toast.error(
          `Something went wrong. ${error.message}`,
          '',
          TOAST_OPTIONS,
        );
      } finally {
        this.isLoading = false;
      }
      this.email = '';
      this.phone = '';
    }
  }
}
