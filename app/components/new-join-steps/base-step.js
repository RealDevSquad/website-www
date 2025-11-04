import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { JOIN_DEBOUNCE_TIME } from '../../constants/join';
import { validateWordCount } from '../../utils/validator';

export default class BaseStepComponent extends Component {
  storageKey = '';
  validationMap = {};

  @tracked data = {};
  @tracked errorMessage = {};
  @tracked wordCount = {};

  isValid;
  setIsValid;
  setIsPreValid;

  constructor(...args) {
    super(...args);
    this.isValid = this.args.isValid;
    this.setIsValid = this.args.setIsValid;
    this.setIsPreValid = this.args.setIsPreValid;

    const saved = JSON.parse(localStorage.getItem(this.storageKey) || 'null');
    this.data = saved ?? {};

    this.errorMessage = Object.fromEntries(
      Object.keys(this.validationMap).map((key) => [key, '']),
    );

    this.wordCount = Object.fromEntries(
      Object.keys(this.validationMap).map((key) => {
        const value = this?.data?.[key] ?? '';
        return [key, value?.trim()?.split(/\s+/).filter(Boolean).length ?? 0];
      }),
    );

    const validated = this.isDataValid();
    localStorage.setItem('isValid', validated);
    this.setIsPreValid(validated);
  }

  @action inputHandler(e) {
    this.setIsPreValid(false);
    const field = e.target.name;
    const value = e.target.value;
    debounce(this, this.handleFieldUpdate, field, value, JOIN_DEBOUNCE_TIME);
  }

  validateField(field, value) {
    const limits = this.validationMap[field];
    return validateWordCount(value, limits);
  }

  isDataValid() {
    for (let field of Object.keys(this.validationMap)) {
      const result = this.validateField(field, this.data[field]);
      if (!result.isValid) return false;
    }
    return true;
  }

  handleFieldUpdate(field, value) {
    this.updateFieldValue(field, value);
    const result = this.validateField(field, value);
    this.updateWordCount(field, value, result);
    this.updateErrorMessage(field, result);
    this.syncFormValidity();
  }

  updateFieldValue(field, value) {
    this.data = { ...this.data, [field]: value };
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  updateWordCount(field, value, result) {
    const wordCount =
      result.wordCount ??
      value?.trim()?.split(/\s+/).filter(Boolean).length ??
      0;
    this.wordCount = { ...this.wordCount, [field]: wordCount };
  }

  updateErrorMessage(field, result) {
    this.errorMessage = {
      ...this.errorMessage,
      [field]: this.formatError(field, result),
    };
  }

  formatError(field, result) {
    const limits = this.validationMap[field];
    if (result.isValid) return '';
    if (result.remainingToMin) {
      return `At least ${result.remainingToMin} more word(s) required`;
    }
    const max = limits.max;
    return `Maximum ${max} words allowed`;
  }
}
