import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

export default class StepperHeaderComponent extends Component {
  get progressPercentage() {
    const totalSteps = +this.args.totalSteps ?? 1;
    const currentStep = +this.args.currentStep ?? 0;
    return Math.round((currentStep / totalSteps) * 100);
  }

  get progressStyle() {
    return htmlSafe(`width: ${this.progressPercentage}%`);
  }
}
