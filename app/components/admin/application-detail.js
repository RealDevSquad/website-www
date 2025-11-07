import Component from '@glimmer/component';

export default class AdminApplicationDetailComponent extends Component {
  get locationSection() {
    return {
      City: this.args.application?.location?.city,
      State: this.args.application?.location?.state,
      Country: this.args.application?.location?.country,
    };
  }

  get professionalSection() {
    const skills = this.args.application?.professional?.skills;
    const skillsArray = skills
      ? skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

    return {
      Institution: this.args.application?.professional?.institution,
      Skills: skillsArray.length > 0 ? skillsArray : null,
    };
  }

  get introductionSection() {
    return {
      Introduction: this.args.application?.intro?.introduction,
      'Fun Fact': this.args.application?.intro?.funFact,
      'For Fun': this.args.application?.intro?.forFun,
      'Why RDS': this.args.application?.intro?.whyRds,
    };
  }

  get socialLinksSection() {
    return {
      GitHub: this.args.application?.socialLink?.github,
      LinkedIn: this.args.application?.socialLink?.linkedin,
      Twitter: this.args.application?.socialLink?.twitter,
      Peerlist: this.args.application?.socialLink?.peerlist,
    };
  }
}
