import BaseStepComponent from './base-step';
import {
  NEW_STEP_LIMITS,
  STEP_DATA_STORAGE_KEY,
} from '../../constants/new-join-form';

export default class NewStepTwoComponent extends BaseStepComponent {
  storageKey = STEP_DATA_STORAGE_KEY.stepTwo;
  stepValidation = {
    skills: NEW_STEP_LIMITS.stepTwo.skills,
    company: NEW_STEP_LIMITS.stepTwo.company,
    introduction: NEW_STEP_LIMITS.stepTwo.introduction,
  };
}
