import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { validator } from '../../utils/validator';
import { debounce } from '@ember/runloop';
import { JOIN_DEBOUNCE_TIME } from '../../constants/join';
import { NEW_FORM_STEPS, NEW_STEP_LIMITS } from '../../constants/new-join-form';

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

  heading = NEW_FORM_STEPS.headings[this.currentStep - 1];
  subHeading = NEW_FORM_STEPS.subheadings[this.currentStep - 1];

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
        const wordCount = this.data[field].trim().split(/\s+/).length;
        if (
          wordCount < NEW_STEP_LIMITS.stepTwo.introduction.min ||
          wordCount > NEW_STEP_LIMITS.stepTwo.introduction.max
        ) {
          return false;
        }
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
        const wordCount = this.data[field].trim().split(/\s+/).length;
        if (wordCount < NEW_STEP_LIMITS.stepTwo.introduction.min) {
          this.errorMessage = {
            ...this.errorMessage,
            [field]: `At least ${NEW_STEP_LIMITS.stepTwo.introduction.min - wordCount} more word(s) required`,
          };
        } else if (wordCount > NEW_STEP_LIMITS.stepTwo.introduction.max) {
          this.errorMessage = {
            ...this.errorMessage,
            [field]: `Maximum ${NEW_STEP_LIMITS.stepTwo.introduction.max} words allowed`,
          };
        } else {
          this.errorMessage = {
            ...this.errorMessage,
            [field]: '',
          };
        }
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
