import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { APPLICATION_STATUS_TYPES } from '../../constants/join';
import { USER_JOINED_LINK } from '../../constants/apis';
import { TOAST_OPTIONS } from '../../constants/toast-options';
import { ANKUSH_TWITTER } from '../../constants/urls';

export default class StatusCardComponent extends Component {
  @service login;
  @service router;
  @service onboarding;
  @service toast;

  @tracked fetchedStatus;
  @tracked fetchedFeedback;

  APPLICATION_STATUS_TYPES = APPLICATION_STATUS_TYPES;
  ANKUSH_TWITTER = ANKUSH_TWITTER;

  APPLICATION_STATUSES = [
    {
      status: APPLICATION_STATUS_TYPES.pending,
      heading: 'Pending',
      icon: 'hourglass-half',
    },
    {
      status: APPLICATION_STATUS_TYPES.rejected,
      heading: 'Rejected',
      icon: 'ban',
    },
    {
      status: APPLICATION_STATUS_TYPES.accepted,
      heading: 'Accepted',
      icon: 'square-check',
    },
  ];

  constructor() {
    super(...arguments);
    if (!this.login.userData?.id) {
      this.showLoginRequiredToast();
    } else {
      this.fetchStatus();
    }
  }

  get status() {
    return this.args.status || this.fetchedStatus;
  }

  get feedback() {
    return this.args.feedback || this.fetchedFeedback;
  }

  get currentStatusDetails() {
    return this.APPLICATION_STATUSES.find((s) => s.status === this.status);
  }

  get introLink() {
    return USER_JOINED_LINK(this.login.userData.id);
  }

  @action
  async fetchStatus() {
    await this.onboarding.getApplicationDetails();
    this.fetchedStatus = this.onboarding.applicationData?.status;
    this.fetchedFeedback = this.onboarding.applicationData?.feedback;
  }

  @action
  redirectToHome() {
    this.router.transitionTo('/');
  }

  @action
  showLoginRequiredToast() {
    this.toast.error(
      'Please log in to view your application status',
      'Login Required',
      TOAST_OPTIONS,
    );
  }

  @action
  onSuccess() {
    this.toast.success(
      'Successfully copied to clipboard',
      'Link Copied!',
      TOAST_OPTIONS,
    );
  }

  @action
  onError() {
    this.toast.error('Error in copying to clipboard', 'Error!', TOAST_OPTIONS);
  }
}
