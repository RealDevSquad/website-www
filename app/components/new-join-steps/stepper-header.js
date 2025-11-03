import Component from '@glimmer/component';

export default class StepperHeaderComponent extends Component {
  get progressPercentage() {
    return Math.round((this.args.currentStep / this.args.totalSteps) * 100);
  }
}
