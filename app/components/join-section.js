import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class JoinSection extends Component {
  @service featureFlag;

  get isDevMode() {
    return this.featureFlag.isDevMode;
  }
}
