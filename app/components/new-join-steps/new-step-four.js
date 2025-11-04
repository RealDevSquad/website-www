import BaseStepComponent from './base-step';
import { NEW_STEP_LIMITS } from '../../constants/new-join-form';

export default class NewStepFourComponent extends BaseStepComponent {
  storageKey = 'newStepFourData';

  get userRole() {
    const stepOneData = JSON.parse(
      localStorage.getItem('newStepOneData') || '{}',
    );
    return stepOneData.role || '';
  }

  get validationMap() {
    const baseMap = {
      phoneNumber: NEW_STEP_LIMITS.stepFour.phoneNumber,
      twitter: NEW_STEP_LIMITS.stepFour.twitter,
      linkedin: NEW_STEP_LIMITS.stepFour.linkedin,
      instagram: NEW_STEP_LIMITS.stepFour.instagram,
      peerlist: NEW_STEP_LIMITS.stepFour.peerlist,
    };

    if (this.userRole === 'Developer') {
      baseMap.github = NEW_STEP_LIMITS.stepFour.github;
    }

    if (this.userRole === 'Designer') {
      baseMap.behance = NEW_STEP_LIMITS.stepFour.behance;
      baseMap.dribble = NEW_STEP_LIMITS.stepFour.dribble;
    }

    return baseMap;
  }

  get showGitHub() {
    return this.userRole === 'Developer';
  }

  get showBehance() {
    return this.userRole === 'Designer';
  }

  get showDribble() {
    return this.userRole === 'Designer';
  }
}
