import BaseStepComponent from './base-step';
import { NEW_STEP_LIMITS } from '../../constants/new-join-form';
import { heardFrom } from '../../constants/social-data';

export default class NewStepFiveComponent extends BaseStepComponent {
  storageKey = 'newStepFiveData';
  heardFrom = heardFrom;

  validationMap = {
    whyRds: NEW_STEP_LIMITS.stepFive.whyRds,
    foundFrom: NEW_STEP_LIMITS.stepFive.foundFrom,
  };
  maxWords = {
    whyRds: NEW_STEP_LIMITS.stepFive.whyRds.max,
  };
}
