import BaseStepComponent from './base-step';
import { NEW_STEP_LIMITS } from '../../constants/new-join-form';

export default class NewStepTwoComponent extends BaseStepComponent {
  storageKey = 'newStepTwoData';
  validationMap = {
    skills: NEW_STEP_LIMITS.stepTwo.skills,
    company: NEW_STEP_LIMITS.stepTwo.company,
    introduction: NEW_STEP_LIMITS.stepTwo.introduction,
  };
}
