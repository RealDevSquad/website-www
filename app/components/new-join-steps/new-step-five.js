import BaseStepComponent from './base-step';
import {
  NEW_STEP_LIMITS,
  STEP_DATA_STORAGE_KEY,
} from '../../constants/new-join-form';
import { heardFrom } from '../../constants/social-data';

export default class NewStepFiveComponent extends BaseStepComponent {
  storageKey = STEP_DATA_STORAGE_KEY.stepFive;
  heardFrom = heardFrom;

  stepValidation = {
    whyRds: NEW_STEP_LIMITS.stepFive.whyRds,
    foundFrom: NEW_STEP_LIMITS.stepFive.foundFrom,
  };
}
