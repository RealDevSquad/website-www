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

  constructor() {
    super(...arguments);
    this._dateCache = new Map();
  }

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

      const pastTenseMap = {
        approve: 'approved',
        reject: 'rejected',
        'request-changes': 'requested changes',
      };
      const pastTense = pastTenseMap[actionType] || `${actionType}d`;

      this.toast.success(
        `Application ${pastTense} successfully`,
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

  formatDate(dateString) {
    if (!dateString) return '';

    // Normalize input to create a consistent cache key
    let cacheKey;
    let date;

    if (dateString instanceof Date) {
      // For Date objects, use timestamp for cache key
      const timestamp = dateString.getTime();
      if (Number.isNaN(timestamp)) {
        return '';
      }
      cacheKey = `date_${timestamp}`;
      date = dateString;
    } else {
      // For strings, use the string itself as cache key
      cacheKey = String(dateString);
      date = new Date(dateString);

      if (Number.isNaN(date.getTime())) {
        return '';
      }
    }

    // Check cache first
    if (this._dateCache.has(cacheKey)) {
      return this._dateCache.get(cacheKey);
    }

    // Format the date
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    // Cache the result
    this._dateCache.set(cacheKey, formatted);
    return formatted;
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
