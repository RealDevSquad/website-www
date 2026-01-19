import Component from '@glimmer/component';

export default class ApplicantIntroComponent extends Component {
  get applicantData() {
    return this.args.data[0];
  }

  get APPLICANT_DATA() {
    return [
      {
        id: 'one',
        key: 'first_name',
        label: 'First Name',
        data: this.applicantData.biodata.firstName,
      },
      {
        id: 'two',
        key: 'last_name',
        label: 'Last Name',
        data: this.applicantData.biodata.lastName,
      },
      {
        id: 'three',
        key: 'city',
        label: 'Your City',
        data: this.applicantData.location.city,
      },
      {
        id: 'four',
        key: 'state',
        label: 'Your State',
        data: this.applicantData.location.state,
      },
      {
        id: 'five',
        key: 'country',
        label: 'Your Country',
        data: this.applicantData.location.country,
      },
      {
        id: 'six',
        key: 'introduction',
        label: 'Your Introduction',
        data: this.applicantData.intro.introduction,
      },
      {
        id: 'seven',
        key: 'skills',
        label: 'Your Skills',
        data: this.applicantData.professional.skills,
      },
      {
        id: 'eight',
        key: 'college',
        label: 'Your Institution',
        data: this.applicantData.professional.institution,
      },
      {
        id: 'nine',
        key: 'forFun',
        label: 'What do you do for fun?',
        data: this.applicantData.intro.forFun,
      },
      {
        id: 'ten',
        key: 'funFact',
        label: 'Fun facts about you',
        data: this.applicantData.intro.funFact,
      },
      {
        id: 'eleven',
        key: 'whyRds',
        label: 'Why do you want to join Real Dev Squad?',
        data: this.applicantData.intro.whyRds,
      },
      {
        id: 'twelve',
        key: 'numberOfHours',
        label: 'How many hours per week, are you willing to contribute?',
        data: this.applicantData.intro.numberOfHours,
      },
      {
        id: 'thirteen',
        key: 'foundFrom',
        label: 'How did you hear about us?',
        data: this.applicantData.foundFrom,
      },
    ];
  }
}
