import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class NewStepSixComponent extends Component {
  @tracked stepOneData = {};
  @tracked stepTwoData = {};
  @tracked stepThreeData = {};
  @tracked stepFourData = {};
  @tracked stepFiveData = {};

  constructor(...args) {
    super(...args);
    this.loadAllStepData();
  }

  loadAllStepData() {
    this.stepOneData = JSON.parse(
      localStorage.getItem('newStepOneData') || '{}',
    );
    this.stepTwoData = JSON.parse(
      localStorage.getItem('newStepTwoData') || '{}',
    );
    this.stepThreeData = JSON.parse(
      localStorage.getItem('newStepThreeData') || '{}',
    );
    this.stepFourData = JSON.parse(
      localStorage.getItem('newStepFourData') || '{}',
    );
    this.stepFiveData = JSON.parse(
      localStorage.getItem('newStepFiveData') || '{}',
    );
  }

  get userRole() {
    return this.stepOneData.role || '';
  }

  get showGitHub() {
    return this.userRole === 'Developer';
  }

  get showBehance() {
    return this.userRole === 'Designer';
  }

  get showDribble() {
    return this.userRole === 'Designer';
  }

  get locationDisplay() {
    const parts = [];
    if (this.stepOneData.city) parts.push(this.stepOneData.city);
    if (this.stepOneData.state) parts.push(this.stepOneData.state);
    if (this.stepOneData.country) parts.push(this.stepOneData.country);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  }

  get hasLocation() {
    return !!(
      this.stepOneData.country ||
      this.stepOneData.state ||
      this.stepOneData.city
    );
  }
}
