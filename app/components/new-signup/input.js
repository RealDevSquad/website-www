import { action } from '@ember/object';
import Component from '@glimmer/component';
import { LABEL_TEXT } from '../../constants/new-signup';

export default class SignupComponent extends Component {
  get label() {
    const { currentStep } = this.args;

    return LABEL_TEXT[currentStep];
  }

  @action inputFieldChanged(event) {
    const { onChange, currentStep } = this.args;

    const inputValue = event.target.value;

    const sanitizedInput = inputValue.replace(/\s/g, '');

    if (inputValue !== sanitizedInput) {
      event.target.value = sanitizedInput;
    }

    onChange(currentStep, sanitizedInput);
  }
}
