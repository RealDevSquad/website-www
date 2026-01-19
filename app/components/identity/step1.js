import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { toastNotificationTimeoutOptions } from '../../constants/toast-notification';
import { APPS } from '../../constants/urls';
const BASE_URL = APPS.API_BACKEND;

export default class Step1Component extends Component {
  @tracked isChaincodeGenerated = false;
  @tracked isGeneratingChaincode = false;
  @tracked chaincode = 'asxjdDZVNTfuDMQJiunJ';
  @tracked isChaincodeVisible = false;
  @service toast;

  @action handleNext() {
    if (
      confirm(
        'Make sure you copied the chaincode as you are not able to see it again. If not, click `Cancel` and copy it.',
      )
    ) {
      this.args.setState('step2');
    }
  }

  @action handleEyeClick() {
    this.isChaincodeVisible = !this.isChaincodeVisible;
  }

  @action handleCopy() {
    navigator.clipboard.writeText(this.chaincode);
    this.toast.info('Chaincode Copied!!', '', toastNotificationTimeoutOptions);
  }

  @action async handleGenerateChaincode(e) {
    e.preventDefault();
    if (this.isGeneratingChaincode === false) {
      this.isGeneratingChaincode = true;
      try {
        const response = await fetch(`${BASE_URL}/users/chaincode`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const { chaincode } = await response.json();

        if (response.ok) {
          this.chaincode = chaincode;
          this.isChaincodeGenerated = true;
          this.toast.info(
            'Generated New Chaincode!!',
            '',
            toastNotificationTimeoutOptions,
          );
        } else {
          console.log(response);
          this.toast.error(
            'Something went wrong. Please check console errors.',
            '',
            toastNotificationTimeoutOptions,
          );
        }
      } catch (error) {
        console.log('error', error);
        this.toast.error(
          'Something went wrong. Please check console errors.',
          '',
          toastNotificationTimeoutOptions,
        );
      } finally {
        this.isGeneratingChaincode = false;
      }
    }
  }
}
