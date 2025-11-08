import Component from '@glimmer/component';
import { cached } from '@ember/object';

export default class AdminApplicationDetailSectionComponent extends Component {
  static MAX_VISIBLE_SKILLS = 5;

  @cached
  get truncatedSkills() {
    const skills = this.args.data?.skills;

    if (skills && Array.isArray(skills)) {
      const maxSkills = this.constructor.MAX_VISIBLE_SKILLS;

      if (skills.length <= maxSkills) {
        return {
          visible: skills,
          remaining: 0,
        };
      }

      return {
        visible: skills.slice(0, maxSkills),
        remaining: skills.length - maxSkills,
      };
    }

    return {
      visible: [],
      remaining: 0,
    };
  }
}
