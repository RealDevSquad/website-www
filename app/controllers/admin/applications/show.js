import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { APPLICATION_ACTION_URL } from '../../../constants/apis';
import { TOAST_OPTIONS } from '../../../constants/toast-options';

export default class AdminApplicationsShowController extends Controller {
  @service login;
  @service router;
  @service toast;
  @tracked isProcessing = false;
  @tracked feedbackText = '';
  @tracked showFeedbackInput = false;
  @tracked selectedAction = null;

  get isSuperUser() {
    return this.login.userData?.roles?.super_user;
  }

  get isLoading() {
    return this.login.isLoading;
  }

  get application() {
    return this.model;
  }

  @action
  showFeedback(actionType) {
    if (actionType === 'approve') {
      this.showFeedbackInput = false;
      this.handleApplicationAction(actionType);
    } else {
      this.selectedAction = actionType;
      this.showFeedbackInput = true;
    }
  }

  @action
  async handleApplicationAction(actionType) {
    if (!this.feedbackText && actionType !== 'approve') {
      this.toast.error('Please provide feedback', 'Error', TOAST_OPTIONS);
      return;
    }

    this.isProcessing = true;

    try {
      const response = await fetch(
        APPLICATION_ACTION_URL(this.model.id, actionType),
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            feedback: this.feedbackText,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to ${actionType} application`);
      }

      this.toast.success(
        `Application ${actionType}d successfully`,
        'Success',
        TOAST_OPTIONS,
      );

      this.router.transitionTo('admin.applications');
    } catch (error) {
      console.error(`Error ${actionType}ing application:`, error);
      this.toast.error(
        `Failed to ${actionType} application`,
        'Error',
        TOAST_OPTIONS,
      );
    } finally {
      this.isProcessing = false;
    }
  }

  @action
  submitWithFeedback() {
    if (this.selectedAction) {
      this.handleApplicationAction(this.selectedAction);
    }
  }

  @action
  goBack() {
    this.router.transitionTo('admin.applications');
  }

  @action
  formatDate(dateString) {
    if (!dateString) return '';

    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  @action
  formatRole(role) {
    if (!role || typeof role !== 'string') return '';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  @action
  updateFeedbackText(event) {
    this.feedbackText = event.target.value;
  }
}
