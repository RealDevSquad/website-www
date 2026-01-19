import Component from '@glimmer/component';
import { mapSocialIcons, mapSocialUrls } from '../../constants/applications';

export default class SocialLinkPill extends Component {
  get platform() {
    return this.args.platform?.toLowerCase();
  }

  get icon() {
    return mapSocialIcons[this.platform] || 'mdi:link';
  }

  get redirectUrl() {
    return `${mapSocialUrls[this.platform]}/${this.args.userName}`;
  }
}
