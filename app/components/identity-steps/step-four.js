import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { APPS } from '../../constants/urls';
import checkURL from '../../utils/check-url';
import { TOAST_OPTIONS } from '../../constants/toast-options';

export default class IdentityStepsStepFourComponent extends Component {
  @service toast;
  @tracked isMouseOnTooltip = false;
  @tracked profileURL = '';
  @tracked nextButtonDisabled = true;
  @tracked isLoading = false;

  @action openTooltipInfo() {
    this.isMouseOnTooltip = true;
  }

  @action closeTooltipInfo() {
    this.isMouseOnTooltip = false;
  }

  @action changeProfileURL(e) {
    this.profileURL = e.target.value;
    if (this.profileURL === '' || !checkURL(this.profileURL)) {
      this.nextButtonDisabled = true;
    } else {
      this.nextButtonDisabled = false;
    }
  }

  @action async handleEdit(e) {
    e.preventDefault();
    this.isLoading = true;
    try {
      const response = await fetch(`${APPS.API_BACKEND}/users/profileURL`, {
        method: 'PATCH',
        body: JSON.stringify({ profileURL: this.profileURL }),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (response.ok) {
        this.toast.info('Profile Service Updated!!', 'Info', TOAST_OPTIONS);
        this.args.startHandler();
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      console.error(error);
      this.toast.error(
        'Something went wrong. Please check console errors.',
        'Error',
        TOAST_OPTIONS,
      );
    } finally {
      this.isLoading = false;
    }
  }
}
