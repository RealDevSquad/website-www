import Component from '@glimmer/component';
import { SOCIAL_LINK_PROPERTIES } from '../constants/social-data';
import { service } from '@ember/service';

export default class HeaderComponent extends Component {
  @service featureFlag;
  SOCIAL_LINK_PROPERTIES = SOCIAL_LINK_PROPERTIES;

  get isDevMode() {
    return this.featureFlag.isDevMode;
  }
}
