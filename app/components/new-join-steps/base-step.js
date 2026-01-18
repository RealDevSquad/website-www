import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { debounceTask } from 'ember-lifeline';
import { JOIN_DEBOUNCE_TIME } from '../../constants/join';
import { validateWordCount } from '../../utils/validator';
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
    this.initializeFormState();
  }

  initializeFormState() {
    let saved = {};
    try {
      const stored = getLocalStorageItem(this.storageKey, '{}');
      saved = stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('Failed to parse stored form data:', e);
      saved = {};
    }
    this.data = saved;

    this.errorMessage = Object.fromEntries(
      Object.keys(this.stepValidation).map((k) => [k, '']),
    );

    this.wordCount = Object.fromEntries(
      Object.keys(this.stepValidation).map((k) => {
        let val = String(this.data[k] || '');
        return [k, val.trim().split(/\s+/).filter(Boolean).length || 0];
      }),
    );

    this.postLoadInitialize();

    const valid = this.isDataValid();
    this.args.setIsPreValid(valid);
    setLocalStorageItem('isValid', String(valid));
  }

  @action inputHandler(e) {
    if (!e?.target) return;
    this.args.setIsPreValid(false);
    const field = e.target.name;
    const value = e.target.value;
    debounceTask(this, 'handleFieldUpdate', field, value, JOIN_DEBOUNCE_TIME);
  }

  validateField(field, value) {
    const limits = this.stepValidation[field];
    const fieldType = limits?.type || 'text';

    if (fieldType === 'select' || fieldType === 'dropdown') {
      const hasValue = value && String(value).trim().length > 0;
      return { isValid: hasValue };
    }
    return validateWordCount(value, limits);
  }

  isDataValid() {
    for (const field of Object.keys(this.stepValidation)) {
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

    const fieldType = limits?.type || 'text';
    if (fieldType === 'select' || fieldType === 'dropdown') {
      return 'Please choose an option';
    }
    if (result.remainingToMin) {
      return `At least ${result.remainingToMin} more word(s) required`;
    }
    return `Maximum ${limits?.max ?? 'N/A'} words allowed`;
  }

  syncFormValidity() {
    const allValid = this.isDataValid();
    this.args.setIsValid(allValid);
    setLocalStorageItem('isValid', String(allValid));
  }
}
