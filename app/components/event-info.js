import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EventInfoComponent extends Component {
  @tracked isHovered = false;
  @tracked isFocused = false;
  @tracked isDismissed = false;

  get isCardVisible() {
    return (this.isHovered || this.isFocused) && !this.isDismissed;
  }

  @action showOnHover() {
    this.isHovered = true;
    this.isDismissed = false;
  }

  @action hideOnHover() {
    this.isHovered = false;
  }

  @action showOnFocus() {
    this.isFocused = true;
    this.isDismissed = false;
  }

  @action hideOnFocus() {
    this.isFocused = false;
  }

  @action reopen() {
    this.isDismissed = false;
  }

  @action closeOnEscape(event) {
    if (event.key === 'Escape') {
      this.isDismissed = true;
    }
  }
}
