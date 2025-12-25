import Component from '@glimmer/component';
import { action } from '@ember/object';
import { LABEL_TEXT } from '../../constants/new-signup';

export default class SignupComponent extends Component {
  get label() {
    const { currentStep } = this.args;

    return LABEL_TEXT[currentStep];
  }

  @action inputFieldChanged(event) {
    const { onChange, currentStep } = this.args;

    const rawValue = event.target.value;

    if (/\s/.test(rawValue)) {
      const cursorPosition = event.target.selectionStart;
      const sanitizedInput = rawValue.replace(/\s/g, '');

      const textBeforeCursor = rawValue.substring(0, cursorPosition);
      const spacesBeforeCursor = (textBeforeCursor.match(/\s/g) || []).length;
      const newCursorPosition = cursorPosition - spacesBeforeCursor;

      event.target.value = sanitizedInput;
      event.target.setSelectionRange(newCursorPosition, newCursorPosition);

      onChange(currentStep, sanitizedInput);
    } else {
      onChange(currentStep, rawValue);
    }
  }

  @action handleKeydown(event) {
    if (/\s/.test(event.key)) {
      event.preventDefault();
    }
  }
}
