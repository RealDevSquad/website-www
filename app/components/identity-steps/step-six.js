import Component from '@glimmer/component';
import { service } from '@ember/service';
import { PROFILE_STATUS } from '../../constants/stepper-signup-data';

export default class IdentityStepsStepSixComponent extends Component {
  @service login;
  @service router;

  PROFILE_STATUS = PROFILE_STATUS;

  get activeProfileStatus() {
    const activeProfileStatus = this.login.userData.profileStatus;
    return activeProfileStatus;
  }

  profileStatuses = [
    {
      status: PROFILE_STATUS.PENDING,
      heading: 'Pending',
      icon: 'hourglass-half',
    },
    {
      status: PROFILE_STATUS.BLOCKED,
      heading: 'Blocked',
      icon: 'ban',
    },
    {
      status: PROFILE_STATUS.VERIFIED,
      heading: 'Successful',
      icon: 'square-check',
    },
  ];
}
