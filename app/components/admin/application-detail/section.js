import Component from '@glimmer/component';

export default class AdminApplicationDetailSectionComponent extends Component {
  get truncatedSkills() {
    const skills = this.args.data?.Skills;

    if (skills && Array.isArray(skills)) {
      const maxSkills = 5;

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
