import BaseStepComponent from './base-step';
import {
  NEW_STEP_LIMITS,
  STEP_DATA_STORAGE_KEY,
} from '../../constants/new-join-form';

export default class NewStepThreeComponent extends BaseStepComponent {
  storageKey = STEP_DATA_STORAGE_KEY.stepThree;
  stepValidation = {
    hobbies: NEW_STEP_LIMITS.stepThree.hobbies,
    funFact: NEW_STEP_LIMITS.stepThree.funFact,
  };
}
