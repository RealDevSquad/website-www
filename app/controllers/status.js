import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import apiRequest from '../utils/api-request';
import { getUTCMidnightTimestampFromDate } from '../utils/date-conversion';
import {
  CURRENT_STATUS_UPDATE_SUCCESS,
  FUTURE_STATUS_UPDATE_SUCCESS,
  OOO_STATUS_REQUEST_FAILURE_MESSAGE,
  STATUS_UPDATE_FAILURE_MESSAGE,
  USER_STATES,
} from '../constants/user-status';
import { UPDATE_USER_STATUS, CREATE_OOO_REQUEST_URL } from '../constants/apis';
import { TOAST_OPTIONS } from '../constants/toast-options';

export default class StatusController extends Controller {
  @service featureFlag;
  @service toast;
  @tracked status = this.model;
  @tracked isStatusUpdating = false;
  @tracked showUserStateModal = false;
  @tracked newStatus;

  @action toggleUserStateModal() {
    this.showUserStateModal = !this.showUserStateModal;
  }

  @action async updateStatus(newStatus) {
    this.isStatusUpdating = true;
    if (!('cancelOoo' in newStatus)) {
      if (newStatus.currentStatus.state !== USER_STATES.ACTIVE) {
        this.toggleUserStateModal();
      }
    }
    try {
      const response = await fetch(UPDATE_USER_STATUS, {
        method: 'PATCH',
        body: JSON.stringify(newStatus),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const responseData = await response.json();
      if (responseData.data.currentStatus?.state) {
        this.status = responseData.data.currentStatus.state;
        this.toast.success(
          CURRENT_STATUS_UPDATE_SUCCESS,
          'Success!',
          TOAST_OPTIONS,
        );
      } else if (responseData.data.futureStatus?.state) {
        this.toast.success(
          FUTURE_STATUS_UPDATE_SUCCESS,
          'Success!',
          TOAST_OPTIONS,
        );
      }
    } catch (error) {
      console.error('Error: ', error);
      this.toast.error(STATUS_UPDATE_FAILURE_MESSAGE, 'Error!', TOAST_OPTIONS);
    } finally {
      this.isStatusUpdating = false;
    }
  }

  @action
  async createOOORequest(from, until, reason) {
    this.isStatusUpdating = true;
    const requestBody = {
      type: 'OOO',
      from: getUTCMidnightTimestampFromDate(from),
      until: getUTCMidnightTimestampFromDate(until),
      reason,
    };

    try {
      const response = await apiRequest(
        CREATE_OOO_REQUEST_URL,
        'POST',
        requestBody,
      );
      const data = await response.json();
      if (!response.ok) {
        this.toast.error(
          data?.message || OOO_STATUS_REQUEST_FAILURE_MESSAGE,
          'Error!',
          TOAST_OPTIONS,
        );
        return;
      }
      this.toast.success(data?.message, 'Success!', TOAST_OPTIONS);
    } catch (error) {
      this.toast.error(
        OOO_STATUS_REQUEST_FAILURE_MESSAGE,
        'Error!',
        TOAST_OPTIONS,
      );
    } finally {
      this.isStatusUpdating = false;
    }
  }

  @action changeStatus(status) {
    this.newStatus = status;
    this.toggleUserStateModal();
  }
}
