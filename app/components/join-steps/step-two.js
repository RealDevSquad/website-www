import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { validator } from '../../utils/validator';
import { debounceTask } from 'ember-lifeline';
import { JOIN_DEBOUNCE_TIME, STEP_TWO_LIMITS } from '../../constants/join';

export default class StepTwoComponent extends Component {
  @tracked data = JSON.parse(localStorage.getItem('stepTwoData')) ?? {
    introduction: '',
    skills: '',
    college: '',
    forFun: '',
    funFact: '',
  };

  @tracked errorMessage = {
    introduction: '',
    skills: '',
    college: '',
    forFun: '',
    funFact: '',
  };

  isValid;
  setIsValid;
  setIsPreValid;

  constructor(...args) {
    super(...args);
    this.isValid = this.args.isValid;
    this.setIsValid = this.args.setIsValid;
    this.setIsPreValid = this.args.setIsPreValid;
    const validated = this.isDataValid();
    localStorage.setItem('isValid', validated);
    this.setIsPreValid(validated);
  }
  isDataValid() {
    for (let field in this.data) {
      const { isValid } = validator(this.data[field], STEP_TWO_LIMITS[field]);
      if (!isValid) {
        return false;
      }
    }
    return true;
  }

  setValToLocalStorage(e) {
    this.data = { ...this.data, [e.target.name]: e.target.value };
    localStorage.setItem('stepTwoData', JSON.stringify(this.data));

    // Only validate the changed field
    const field = e.target.name;
    const { isValid, remainingWords } = validator(
      this.data[field],
      STEP_TWO_LIMITS[field],
    );
    this.errorMessage = {
      ...this.errorMessage,
      [field]: isValid
        ? ''
        : `At least, ${remainingWords} more word(s) required`,
    };

    const isAllValid = this.isDataValid();
    this.setIsValid(isAllValid);
    localStorage.setItem('isValid', isAllValid);
  }

  @action inputHandler(e) {
    this.setIsPreValid(false);
    debounceTask(this, 'setValToLocalStorage', e, JOIN_DEBOUNCE_TIME);
  }
}
