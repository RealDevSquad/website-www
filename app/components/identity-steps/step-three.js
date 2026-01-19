import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TOAST_OPTIONS } from '../../constants/toast-options';

export default class IdentityStepsStepThreeComponent extends Component {
  @service toast;
  @tracked hideChaincode = true;
  @tracked isCopyClicked = false;
  @tracked isChaincodePageButtonDisabled = true;
  @tracked isTooltipVisible = true;

  @action toggleEye() {
    this.hideChaincode = !this.hideChaincode;
  }

  @action handleCopy() {
    navigator.clipboard.writeText(this.args.chaincode);
    this.isCopyClicked = true;
    this.isTooltipVisible = false;
    this.isChaincodePageButtonDisabled = false;
    if (this.isCopyClicked === true) {
      this.toast.info('Copied', '', TOAST_OPTIONS);
    }
  }
}
