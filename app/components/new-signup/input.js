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

    if (rawValue.includes(' ')) {
      const sanitizedInput = rawValue.replace(/\s/g, '');
      onChange(currentStep, sanitizedInput);

      if (rawValue !== sanitizedInput) {
        event.target.value = sanitizedInput;
      }
    } else {
      onChange(currentStep, rawValue);
    }
  }

  @action handleKeydown(event) {
    if (event.key === ' ' || event.code === 'Space') {
      event.preventDefault();
    }
  }
}
