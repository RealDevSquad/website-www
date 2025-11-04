import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { JOIN_DEBOUNCE_TIME } from '../../constants/join';
import { NEW_FORM_STEPS, NEW_STEP_LIMITS } from '../../constants/new-join-form';
import { validateWordCount } from '../../utils/validator';

export default class NewStepThreeComponent extends Component {
  @tracked data = JSON.parse(localStorage.getItem('newStepThreeData')) ?? {
    hobbies: '',
    funFact: '',
  };

  @tracked errorMessage = {
    hobbies: '',
    funFact: '',
  };

  @tracked wordCount = {
    hobbies:
      this?.data?.hobbies?.trim()?.split(/\s+/).filter(Boolean).length || 0,
    funFact:
      this?.data?.funFact?.trim()?.split(/\s+/).filter(Boolean).length || 0,
  };

  maxWords = {
    hobbies: NEW_STEP_LIMITS.stepThree.hobbies.max,
    funFact: NEW_STEP_LIMITS.stepThree.funFact.max,
  };

  isValid;
  setIsValid;
  setIsPreValid;

  heading = NEW_FORM_STEPS.headings[2];
  subHeading = NEW_FORM_STEPS.subheadings[2];

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
      const { isValid } = validateWordCount(
        this.data[field],
        NEW_STEP_LIMITS.stepThree[field],
      );
      if (!isValid) return false;
    }
    return true;
  }

  @action inputHandler(e) {
    this.setIsPreValid(false);

    const setValToLocalStorage = () => {
      this.data = { ...this.data, [e.target.name]: e.target.value };
      localStorage.setItem('newStepThreeData', JSON.stringify(this.data));

      // Only validate the changed field
      const field = e.target.name;
      const { isValid, wordCount, remainingToMin } = validateWordCount(
        this.data[field],
        NEW_STEP_LIMITS.stepThree[field],
      );
      this.wordCount = { ...this.wordCount, [field]: wordCount };
      this.errorMessage = {
        ...this.errorMessage,
        [field]: isValid
          ? ''
          : remainingToMin
            ? `At least, ${remainingToMin} more word(s) required`
            : `Maximum ${NEW_STEP_LIMITS.stepThree[field].max} words allowed`,
      };

      const isAllValid = this.isDataValid();
      this.setIsValid(isAllValid);
      localStorage.setItem('isValid', isAllValid);
    };

    debounce(this.data, setValToLocalStorage, JOIN_DEBOUNCE_TIME);
  }
}
