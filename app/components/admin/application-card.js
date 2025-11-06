import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class AdminApplicationCardComponent extends Component {
  get truncatedSkills() {
    const skills = this.args.application?.professional?.skills || '';
    const maxLength = 60;
    if (skills.length <= maxLength) {
      return skills;
    }
    return skills.substring(0, maxLength) + '...';
  }

  @action
  handleKeyDown(event, onClick) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  }
}
