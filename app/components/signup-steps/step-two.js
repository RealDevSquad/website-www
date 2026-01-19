import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class SignupStepsStepTwoComponent extends Component {
  @service onboarding;
  @tracked role = localStorage.getItem('role');

  @action
  async generateDiscordLink() {
    const inviteLink = await this.onboarding.discordInvite();
    if (inviteLink) {
      window.open(`https://${inviteLink}`, '_blank');
    }
  }
}
