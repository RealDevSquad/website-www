import Component from '@glimmer/component';
import {
  NEW_SIGNUP_STEPS,
  GET_STARTED_MAIN_HEADING,
  GET_STARTED_SUB_HEADING,
  THANK_YOU_MAIN_HEADING,
  THANK_YOU_SUB_HEADING,
} from '../../constants/new-signup';

export default class GetStartedComponent extends Component {
  GET_STARTED = NEW_SIGNUP_STEPS[0];
  get mainHeading() {
    const { currentStep } = this.args;

    return currentStep === this.GET_STARTED
      ? GET_STARTED_MAIN_HEADING
      : THANK_YOU_MAIN_HEADING;
  }

  get subHeading() {
    const { currentStep } = this.args;

    return currentStep === this.GET_STARTED
      ? GET_STARTED_SUB_HEADING
      : THANK_YOU_SUB_HEADING;
  }
}
