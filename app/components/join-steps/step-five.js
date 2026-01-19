import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TOAST_OPTIONS } from '../../constants/toast-options';
import { ANKUSH_TWITTER } from '../../constants/urls';
import { USER_JOINED_LINK } from '../../constants/apis';
export default class StepFiveComponent extends Component {
  @service toast;
  @service router;
  ANKUSH_TWITTER = ANKUSH_TWITTER;
  @tracked userId = localStorage.getItem('id');
  @tracked joinLink = USER_JOINED_LINK(this.userId);

  @action onSuccess() {
    this.toast.success(
      'Successfully Copied to clipboard',
      'Link Copied!',
      TOAST_OPTIONS,
    );
  }

  @action onError() {
    this.toast.error('Error in copying to clipboard', 'Error!', TOAST_OPTIONS);
  }

  @action backToHome() {
    this.router.transitionTo('index');
  }
}
