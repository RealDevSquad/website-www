import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { ROLES } from '../constants/live';

export default class LiveHeaderComponent extends Component {
  @service live;
  @service featureFlag;
  @tracked isTabOpen = false;

  get isWordCloudFeatureOn() {
    return this.featureFlag.isWordCloud;
  }

  get isSurveyTabVisible() {
    const localPeer = this.live?.localPeer;

    return (
      localPeer?.roleName === ROLES.host ||
      localPeer?.roleName === ROLES.moderator
    );
  }

  @action toggleTabs() {
    this.isTabOpen = !this.isTabOpen;
  }
}
