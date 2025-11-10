import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { JOIN_DEBOUNCE_TIME } from '../../constants/join';
import { validateWordCount } from '../../utils/validator';
import { scheduleOnce } from '@ember/runloop';
import { getLocalStorageItem, setLocalStorageItem } from '../../utils/storage';

export default class BaseStepComponent extends Component {
  stepValidation = {};

  @tracked data = {};
  @tracked errorMessage = {};
  @tracked wordCount = {};

  get storageKey() {
    return '';
  }

  postLoadInitialize() {}

  constructor(...args) {
    super(...args);
    scheduleOnce('afterRender', this, this.initializeFormState);
  }

  initializeFormState() {
    const saved = JSON.parse(getLocalStorageItem(this.storageKey, '{}'));
    this.data = saved ?? {};

    this.errorMessage = Object.fromEntries(
      Object.keys(this.stepValidation).map((k) => [k, '']),
    );

    this.wordCount = Object.fromEntries(
      Object.keys(this.stepValidation).map((k) => {
        let val = this.data[k] || '';
        return [k, val.trim().split(/\s+/).filter(Boolean).length || 0];
      }),
    );

    this.postLoadInitialize();

    const valid = this.isDataValid();
    this.args.onValidityChange(valid);
  }

  @action inputHandler(e) {
    const field = e.target.name;
    const value = e.target.value;
    debounce(this, this.handleFieldUpdate, field, value, JOIN_DEBOUNCE_TIME);
  }

  validateField(field, value) {
    const limits = this.stepValidation[field];
    return validateWordCount(value, limits);
  }

  isDataValid() {
    for (let field of Object.keys(this.stepValidation)) {
      const result = this.validateField(field, this.data[field]);
      if (!result.isValid) return false;
    }
    return true;
  }

  handleFieldUpdate(field, value) {
    this.updateFieldValue(field, value);
    const result = this.validateField(field, value);
    this.updateWordCount(field, result);
    this.updateErrorMessage(field, result);
    this.syncFormValidity();
  }

  updateFieldValue(field, value) {
    this.data = { ...this.data, [field]: value };
    setLocalStorageItem(this.storageKey, JSON.stringify(this.data));
  }

  updateWordCount(field, result) {
    const wordCount = result.wordCount ?? 0;
    this.wordCount = { ...this.wordCount, [field]: wordCount };
  }

  updateErrorMessage(field, result) {
    this.errorMessage = {
      ...this.errorMessage,
      [field]: this.formatError(field, result),
    };
  }

  formatError(field, result) {
    const limits = this.stepValidation[field];
    if (result.isValid) return '';
    if (result.remainingToMin) {
      return `At least ${result.remainingToMin} more word(s) required`;
    }
    return `Maximum ${limits.max} words allowed`;
  }

  syncFormValidity() {
    const allValid = this.isDataValid();
    this.args.onValidityChange(allValid);
  }
}
