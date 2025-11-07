import BaseStepComponent from './base-step';
import { NEW_STEP_LIMITS } from '../../constants/new-join-form';

export default class NewStepThreeComponent extends BaseStepComponent {
  storageKey = 'newStepThreeData';
  validationMap = {
    hobbies: NEW_STEP_LIMITS.stepThree.hobbies,
    funFact: NEW_STEP_LIMITS.stepThree.funFact,
  };
}
