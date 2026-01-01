import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { cached } from '@glimmer/tracking';

export default class StepperHeaderComponent extends Component {
  @cached
  get progressPercentage() {
    const totalSteps = Number(this.args.totalSteps) || 1;
    const currentStep = Number(this.args.currentStep) || 0;
    return Math.min(100, Math.round((currentStep / totalSteps) * 100));
  }

  @cached
  get progressStyle() {
    return htmlSafe(`width: ${this.progressPercentage}%`);
  }
}
