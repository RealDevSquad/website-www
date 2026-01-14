import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { toastNotificationTimeoutOptions } from '../../constants/toast-notification';
import { APPS } from '../../constants/urls';

const BASE_URL = APPS.API_BACKEND;

export default class Step2Component extends Component {
  @tracked profileURL = this.args.profileURL || '';
  @tracked savingURL = false;
  @service toast;

  @action async handleNext() {
    const isValidUrl = (str) => {
      try {
        const newUrl = new URL(str);
        return newUrl.protocol === 'https:';
      } catch {
        return false;
      }
    };
    if (this.profileURL) {
      if (isValidUrl(this.profileURL)) {
        if (this.savingURL === false) {
          if (this.profileURL === this.args.profileURL) {
            this.args.setState('step3');
            return;
          }
          this.savingURL = true;
          try {
            const response = await fetch(`${BASE_URL}/users/profileURL`, {
              method: 'PATCH',
              body: JSON.stringify({ profileURL: this.profileURL }),
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });
            if (response.ok) {
              this.toast.info(
                'Updated profile URL!!',
                '',
                toastNotificationTimeoutOptions,
              );
              this.args.setState('step3');
            } else {
              this.toast.error(
                'Something went wrong. Please check console errors.',
                '',
                toastNotificationTimeoutOptions,
              );
            }
          } catch (error) {
            console.error(error);
            this.toast.error(
              'Something went wrong. Please check console errors.',
              '',
              toastNotificationTimeoutOptions,
            );
          } finally {
            this.savingURL = false;
          }
        }
      } else {
        alert(
          'Invalid URL! Make sure you entered the correct https profile URL.',
        );
      }
    }
  }
}
