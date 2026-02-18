import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TOAST_OPTIONS } from '../../constants/toast-options';
import { NUDGE_APPLICATION_URL } from '../../constants/apis';
import apiRequest from '../../utils/api-request';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

function isWithinCooldown(timestamp, cooldownMs = TWENTY_FOUR_HOURS) {
  if (!timestamp) {
    return false;
  }

  const now = Date.now();
  const time = new Date(timestamp).getTime();

  return now - time < cooldownMs;
}

export default class DetailHeader extends Component {
  @service router;
  @service toast;

  @tracked isLoading = false;
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
    return this.args.nudgeCount ?? this.application?.nudgeCount ?? 0;
  }

  get lastNudgeAt() {
    return this.args.lastNudgeAt ?? this.application?.lastNudgeAt ?? null;
  }

  get lastEditAt() {
    return this.application?.lastEditAt ?? null;
  }

  get isNudgeDisabled() {
    if (this.isLoading || this.status !== 'pending') {
      return true;
    }
    return isWithinCooldown(this.lastNudgeAt);
  }

  get isEditDisabled() {
    if (this.isLoading) {
      return true;
    }
    return isWithinCooldown(this.lastEditAt);
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
  async nudgeApplication() {
    this.isLoading = true;

    try {
      const response = await apiRequest(
        NUDGE_APPLICATION_URL(this.application.id),
        'PATCH',
      );

      if (!response.ok) {
        throw new Error(`Nudge failed: ${response.status}`);
      }

      const data = await response.json();

      const updatedNudgeData = {
        nudgeCount: data?.nudgeCount ?? this.nudgeCount + 1,
        lastNudgeAt: data?.lastNudgeAt ?? new Date().toISOString(),
      };

      this.toast.success(
        'Nudge successful, you will be able to nudge again after 24hrs',
        'Success!',
        TOAST_OPTIONS,
      );

      this.args.onNudge?.(updatedNudgeData);
    } catch (error) {
      console.error('Nudge failed:', error);
      this.toast.error('Failed to nudge application', 'Error!', TOAST_OPTIONS);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  editApplication() {
    this.router.transitionTo('join', {
      queryParams: {
        edit: true,
        dev: true,
        step: 1,
      },
    });
  }

  @action
  navigateToDashboard() {
    this.router.transitionTo(`/intro?id=${this.userDetails?.id}`);
  }
}
