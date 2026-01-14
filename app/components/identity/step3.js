import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { toastNotificationTimeoutOptions } from '../../constants/toast-notification';
import { APPS } from '../../constants/urls';

const BASE_URL = APPS.API_BACKEND;

export default class Step3Component extends Component {
  @tracked linking = false;
  @service toast;

  @action async handleLink(e) {
    e.preventDefault();
    if (
      this.linking === false &&
      confirm(
        'Make sure to set the chaincode and re-deploy your profile service before linking.',
      )
    ) {
      this.linking = true;
      try {
        const response = await fetch(`${BASE_URL}/users/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          this.toast.info(
            'Your linking request has been queued successfully',
            '',
            toastNotificationTimeoutOptions,
          );
          this.args.setState('reload');
        } else {
          this.toast.error(
            'Something went wrong. Please check console errors.',
            '',
            toastNotificationTimeoutOptions,
          );
        }
      } catch {
        this.toast.error(
          'Something went wrong. Please check console errors.',
          '',
          toastNotificationTimeoutOptions,
        );
      } finally {
        this.linking = false;
      }
    }
  }
}
