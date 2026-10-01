import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EventInfoComponent extends Component {
  @tracked isHovered = false;
  @tracked isFocused = false;

  get isCardVisible() {
    return this.isHovered || this.isFocused;
  }

  @action showOnHover() {
    this.isHovered = true;
  }

  @action hideOnHover() {
    this.isHovered = false;
  }

  @action showOnFocus() {
    this.isFocused = true;
  }

  @action hideOnFocus() {
    this.isFocused = false;
  }
}
