import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { JOIN_DEBOUNCE_TIME } from '../../constants/join';
import { NEW_FORM_STEPS, NEW_STEP_LIMITS } from '../../constants/new-join-form';
import { validateWordCount, validator } from '../../utils/validator';

export default class NewStepTwoComponent extends Component {
  @tracked data = JSON.parse(localStorage.getItem('newStepTwoData')) ?? {
    skills: '',
    company: '',
    introduction: '',
  };

  @tracked errorMessage = {
    skills: '',
    company: '',
    introduction: '',
  };

  @tracked wordCount = {
    introduction:
      this?.data?.introduction?.trim()?.split(/\s+/).filter(Boolean).length ||
      0,
  };

  maxWords = {
    introduction: NEW_STEP_LIMITS.stepTwo.introduction.max,
  };

  heading = NEW_FORM_STEPS.headings[1];
  subHeading = NEW_FORM_STEPS.subheadings[1];

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
      if (field === 'introduction') {
        const { isValid } = validateWordCount(
          this.data[field],
          NEW_STEP_LIMITS.stepTwo.introduction,
        );
        if (!isValid) return false;
      } else {
        const { isValid } = validator(
          this.data[field],
          NEW_STEP_LIMITS.stepTwo[field],
        );
        if (!isValid) {
          return false;
        }
      }
    }
    return true;
  }

  @action inputHandler(e) {
    this.setIsPreValid(false);

    const setValToLocalStorage = () => {
      this.data = { ...this.data, [e.target.name]: e.target.value };
      localStorage.setItem('newStepTwoData', JSON.stringify(this.data));

      const field = e.target.name;
      if (field === 'introduction') {
        const { isValid, wordCount, remainingToMin } = validateWordCount(
          this.data[field],
          NEW_STEP_LIMITS.stepTwo.introduction,
        );
        this.wordCount = { ...this.wordCount, introduction: wordCount };
        this.errorMessage = {
          ...this.errorMessage,
          [field]: isValid
            ? ''
            : remainingToMin
              ? `At least ${remainingToMin} more word(s) required`
              : `Maximum ${NEW_STEP_LIMITS.stepTwo.introduction.max} words allowed`,
        };
      } else {
        const { isValid, remainingWords } = validator(
          this.data[field],
          NEW_STEP_LIMITS.stepTwo[field],
        );
        this.errorMessage = {
          ...this.errorMessage,
          [field]: isValid
            ? ''
            : `At least, ${remainingWords} more word(s) required`,
        };
      }

      const isAllValid = this.isDataValid();
      this.setIsValid(isAllValid);
      localStorage.setItem('isValid', isAllValid);
    };

    debounce(this.data, setValToLocalStorage, JOIN_DEBOUNCE_TIME);
  }
}
