import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class DetailHeader extends Component {
  get application() {
    return this.args.application;
  }

  get userDetails() {
    return this.args.userDetails;
  }

  get fullName() {
    const { firstName, lastName } = this.application?.biodata || {};
    return firstName || lastName ? `${firstName} ${lastName}` : null;
  }

  get imageUrl() {
    return this.application?.imageUrl ?? '';
  }

  get role() {
    return this.application?.role ?? 'N/A';
  }

  get status() {
    return this.application?.status ?? 'pending';
  }

  get skills() {
    return this.application?.professional?.skills ?? 'N/A';
  }

  get location() {
    const { city, state, country } = this.application?.location || {};
    return [city, state, country].filter(Boolean).join(', ') || 'N/A';
  }

  get score() {
    return this.application?.score ?? 'N/A';
  }

  get nudgeCount() {
    return this.application?.nudgeCount ?? 0;
  }

  get isNudgeDisabled() {
    if (this.status !== 'pending') {
      return true;
    }
    if (!this.application?.lastNudgedAt) {
      return false;
    }
    const now = Date.now();
    const lastNudgeTime = new Date(this.application.lastNudgedAt).getTime();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    return now - lastNudgeTime < TWENTY_FOUR_HOURS;
  }

  get socialLinks() {
    const links = [];
    const social = this.application?.socialLink || {};

    if (social.github)
      links.push({ platform: 'GitHub', userName: social.github });
    if (social.linkedin)
      links.push({ platform: 'LinkedIn', userName: social.linkedin });
    if (social.twitter)
      links.push({ platform: 'Twitter', userName: social.twitter });
    if (social.instagram)
      links.push({ platform: 'Instagram', userName: social.instagram });
    if (social.peerlist)
      links.push({ platform: 'Peerlist', userName: social.peerlist });
    if (social.dribbble)
      links.push({ platform: 'Dribbble', userName: social.dribbble });
    if (social.behance)
      links.push({ platform: 'Behance', userName: social.behance });

    return links;
  }

  @action
  nudgeApplication() {
    //ToDo: Implement logic for callling nudge API here
    console.log('nudge application');
  }

  @action
  editApplication() {
    //ToDo: Implement logic for edit application here
    console.log('edit application');
  }

  @action
  navigateToDashboard() {
    //ToDo: Navigate to dashboard site for admin actions
    console.log('navigate to dashboard');
  }
}
