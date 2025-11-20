import Component from '@glimmer/component';
import { action } from '@ember/object';
import { LABEL_TEXT, CHECK_BOX_DATA } from '../../constants/new-signup';

export default class SignupComponent extends Component {
  get checkboxData() {
    return CHECK_BOX_DATA;
  }

  get label() {
    const { currentStep } = this.args;

    return LABEL_TEXT[currentStep];
  }

  @action checkboxFieldChanged(selectedRole,event) {
    const { onChange } = this.args;
    onChange(selectedRole,event.target.checked);
  }
}
