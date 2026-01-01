import Component from '@glimmer/component';
import { action } from '@ember/object';
import { USER_STATES } from '../constants/user-status';
import {
  getCurrentDateString,
  getUTCMidnightTimestampFromDate,
} from '../utils/date-conversion';

export default class UserStatusComponent extends Component {
  ALL_FEASIBLE_STATUS = {
    [USER_STATES.ACTIVE]: {
      status: USER_STATES.ACTIVE,
      message: 'Change your status to Active',
      class: 'buttons__active',
    },
    [USER_STATES.IDLE]: {
      status: USER_STATES.IDLE,
      message: 'Change your status to Idle',
      class: 'buttons__idle',
    },
    [USER_STATES.OOO]: {
      status: USER_STATES.OOO,
      message: 'Request OOO',
      class: 'buttons__ooo',
    },
  };
  currentUserStatus = [
    {
      status: USER_STATES.ACTIVE,
      message: 'You are Active',
      otherAvailableStatus: [this.ALL_FEASIBLE_STATUS.OOO],
    },
    {
      status: USER_STATES.IDLE,
      message: 'You are Idle',
      otherAvailableStatus: [this.ALL_FEASIBLE_STATUS.OOO],
    },
    {
      status: USER_STATES.OOO,
      message: 'You are OOO',
      otherAvailableStatus: [],
    },
    {
      status: USER_STATES.ONBOARDING,
    },
    {
      status: USER_STATES.DNE,
      message: `Your Status doesn't exist`,
      otherAvailableStatus: [this.ALL_FEASIBLE_STATUS.OOO],
    },
  ];

  @action async changeStatus(status) {
    if (status === USER_STATES.ACTIVE) {
      const currentDateString = getCurrentDateString();
      const from = getUTCMidnightTimestampFromDate(currentDateString);
      const updatedAt = Date.now();
      const activeStateData = {
        updatedAt,
        from,
        until: undefined,
        message: undefined,
        state: USER_STATES.ACTIVE,
      };
      await this.args.updateStatus({ currentStatus: activeStateData });
    } else {
      this.args.changeStatus(status);
    }
  }

  @action async cancelOOOStatus(status) {
    if (status === USER_STATES.OOO) {
      await this.args.updateStatus({ cancelOoo: true });
    }
  }
}
