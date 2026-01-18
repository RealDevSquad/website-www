import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { ERROR_MESSAGES } from '../constants/error-messages';
import {
  AUTH_STATUS,
  MOBILE_LOGIN_SUCCESS_MESSAGE,
  QR_SCAN_MESSAGE,
  REQUEST_CANCEL_MESSAGE,
} from '../constants/auth-status';
import {
  QR_AUTHORIZATION_STATUS_URL,
  USER_AUTHENTICATED_DEVICES_URL,
} from '../constants/apis';
import { TOAST_OPTIONS } from '../constants/toast-options';
import apiRequest from '../utils/api-request';

export default class MobileController extends Controller {
  @tracked showConfirmModal = false;
  @tracked actionButtonDisabled = false;
  @service toast;
  @service router;

  async updateQRAuthStatus(status, successMessage) {
    try {
      this.actionButtonDisabled = true;
      const response = await apiRequest(
        `${QR_AUTHORIZATION_STATUS_URL}/${status}`,
        'PATCH',
      );

      if (!response || response.status !== 200) {
        throw new Error(ERROR_MESSAGES.somethingWentWrong);
      }
      this.toast.success(successMessage, 'Success');
      if (status === AUTH_STATUS.AUTHORIZED) {
        this.router.transitionTo('/');
      }
    } catch {
      this.toast.error(
        ERROR_MESSAGES.somethingWentWrong,
        'Error!',
        TOAST_OPTIONS,
      );
    } finally {
      this.actionButtonDisabled = false;
    }
  }

  @action openConfirmModal() {
    this.showConfirmModal = true;
  }

  @action closeConfirmModal() {
    this.showConfirmModal = false;
  }

  @action async verifyQRScanned() {
    try {
      const response = await apiRequest(USER_AUTHENTICATED_DEVICES_URL, 'GET');
      if (response.status === 200) {
        this.showConfirmModal = true;
      } else {
        this.toast.error(QR_SCAN_MESSAGE, 'Not verified', TOAST_OPTIONS);
      }
    } catch {
      this.toast.error(
        ERROR_MESSAGES.somethingWentWrong,
        'Error!',
        TOAST_OPTIONS,
      );
    }
  }

  @action authorizeDeviceAccess() {
    this.updateQRAuthStatus(
      AUTH_STATUS.AUTHORIZED,
      MOBILE_LOGIN_SUCCESS_MESSAGE,
    );
    this.closeConfirmModal();
  }

  @action rejectDeviceAccess() {
    this.updateQRAuthStatus(AUTH_STATUS.REJECTED, REQUEST_CANCEL_MESSAGE);
    this.closeConfirmModal();
  }
}
