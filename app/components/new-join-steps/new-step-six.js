import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getLocalStorageItem } from '../../utils/storage';
import { STEP_DATA_STORAGE_KEY } from '../../constants/new-join-form';

export default class NewStepSixComponent extends Component {
  @tracked stepData = {
    one: {},
    two: {},
    three: {},
    four: {},
    five: {},
  };

  constructor(...args) {
    super(...args);
    this.loadAllStepData();
  }

  loadAllStepData() {
    this.stepData.one = JSON.parse(
      getLocalStorageItem(STEP_DATA_STORAGE_KEY.stepOne),
    );
    this.stepData.two = JSON.parse(
      getLocalStorageItem(STEP_DATA_STORAGE_KEY.stepTwo),
    );
    this.stepData.three = JSON.parse(
      getLocalStorageItem(STEP_DATA_STORAGE_KEY.stepThree),
    );
    this.stepData.four = JSON.parse(
      getLocalStorageItem(STEP_DATA_STORAGE_KEY.stepFour),
    );
    this.stepData.five = JSON.parse(
      getLocalStorageItem(STEP_DATA_STORAGE_KEY.stepFive),
    );
  }

  get fullName() {
    const firstName = this.stepData.one.firstName || '';
    const lastName = this.stepData.one.lastName || '';
    return `${firstName} ${lastName}`.trim();
  }

  get userRole() {
    return this.stepData.one.role || '';
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
    return `${this.stepData.one.city}, ${this.stepData.one.state}, ${this.stepData.one.country}`;
  }

  get profileImage() {
    return this.stepData.one.imageUrl || null;
  }

  get hasProfileImage() {
    return !!this.profileImage;
  }
}
