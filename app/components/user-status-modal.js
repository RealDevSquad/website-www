import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  WARNING_MESSAGE_FOR_IDLE,
  WARNING_MESSAGE_FOR_OOO,
  WARNING_MESSAGE_FOR_FROM_FIELD,
  WARNING_MESSAGE_FOR_UNTIL_FIELD,
  USER_STATES,
  WARNING_FROM_DATE_EXCEEDS_UNTIL_DATE,
  THREE_DAYS_TIME_DIFFERENCE_MS,
  FROM_DATE,
  UNTIL_DATE,
  REASON,
} from '../constants/user-status';
import {
  getCurrentDateString,
  getUTCMidnightTimestampFromDate,
} from '../utils/date-conversion';
import { TOAST_OPTIONS } from '../constants/toast-options';

export default class UserStatusModalComponent extends Component {
  @service toast;
  @service featureFlag;
  @tracked currentStatus;
  @tracked fromDate = '';
  @tracked untilDate = '';
  @tracked reason = '';
  @tracked disableSubmitButton = true;
  @tracked disableDatesPrior = getCurrentDateString();

  @action
  updateValue(event) {
    const { name, value } = event.target;
    if (name === FROM_DATE) {
      this.fromDate = value;
    } else if (name === UNTIL_DATE) {
      this.untilDate = value;
    } else if (name === REASON) {
      this.reason = value;
    }
    this.checkSubmitBtnState();
  }

  @action
  async getCurrentStatusObj() {
    const isDevMode = this.featureFlag.isDevMode;
    if (!this.isValidStatusChange()) return;

    const updatedAt = Date.now();
    const newStateObj = {
      updatedAt,
      from: this.getFromTimestamp(),
      until: this.getUntilTimestamp(),
      message: this.reason,
      state: this.args.newStatus,
    };
    await this.updateStatusBasedOnMode(isDevMode, newStateObj);
    this.resetInputFields();
    this.disableSubmitButton = true;
  }

  isValidStatusChange() {
    if (this.args.newStatus === USER_STATES.OOO) {
      return this.validateOOOInputs();
    }
    if (this.args.newStatus === USER_STATES.IDLE) {
      if (!this.reason.length) {
        this.toast.error(WARNING_MESSAGE_FOR_IDLE, '', TOAST_OPTIONS);
        return false;
      }
    }
    return true;
  }

  validateOOOInputs() {
    if (!this.fromDate) return this.showError(WARNING_MESSAGE_FOR_FROM_FIELD);
    if (!this.untilDate) return this.showError(WARNING_MESSAGE_FOR_UNTIL_FIELD);
    if (this.untilDate < this.fromDate)
      return this.showError(WARNING_FROM_DATE_EXCEEDS_UNTIL_DATE);
    if (!this.reason.trim() && !this.checkIfFromToDatesAreClose())
      return this.showError(WARNING_MESSAGE_FOR_OOO);
    return true;
  }

  getFromTimestamp() {
    if (this.args.newStatus === USER_STATES.OOO) {
      return getUTCMidnightTimestampFromDate(this.fromDate);
    }
    if (this.args.newStatus === USER_STATES.IDLE) {
      return getUTCMidnightTimestampFromDate(getCurrentDateString());
    }
    return null;
  }

  getUntilTimestamp() {
    if (this.args.newStatus === USER_STATES.OOO) {
      return getUTCMidnightTimestampFromDate(this.untilDate);
    }
    return null;
  }

  showError(message) {
    this.toast.error(message, '', TOAST_OPTIONS);
    return false;
  }

  async updateStatusBasedOnMode(isDevMode, newStateObj) {
    if (isDevMode) {
      await this.args.statusUpdateForDev(
        this.fromDate,
        this.untilDate,
        this.reason,
      );
    } else {
      await this.args.updateStatus({ currentStatus: newStateObj });
    }
  }

  @action
  handleInput(event) {
    const { value } = event.target;
    this.reason = value;
    this.checkSubmitBtnState();
  }

  @action
  checkSubmitBtnState() {
    this.disableSubmitButton = !(
      this.checkIfFromToDatesAreClose() ||
      (this.fromDate && this.untilDate && this.reason.trim())
    );
  }

  @action
  checkIfFromToDatesAreClose() {
    if (this.fromDate && this.untilDate) {
      let from = new Date(this.fromDate.replaceAll('-', ',')).getTime();
      let until = new Date(this.untilDate.replaceAll('-', ',')).getTime();
      const timeGap = until - from;
      return timeGap <= THREE_DAYS_TIME_DIFFERENCE_MS;
    }
    return false;
  }

  @action
  resetInputFields() {
    this.fromDate = '';
    this.untilDate = '';
    this.reason = '';
  }

  @action
  onCancelModal() {
    this.resetInputFields();
    this.args.toggleUserStateModal();
  }
}
