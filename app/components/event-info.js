import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EventInfoComponent extends Component {
  @tracked isHovered = false;

  get isCardVisible() {
    return this.isHovered;
  }

  @action showOnHover() {
    this.isHovered = true;
  }

  @action hideOnHover() {
    this.isHovered = false;
  }
}
