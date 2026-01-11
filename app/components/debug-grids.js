import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isoToLocalDate } from '../utils/common-utils';
import { action } from '@ember/object';
import { APPS } from '../constants/urls';
import { TOAST_OPTIONS } from '../constants/toast-options';

export default class DebugGridsComponent extends Component {
  @service store;
  @service fastboot;
  @service login;
  @service toast;

  DEFAULT_IMAGE = 'assets/images/profile.png';

  @tracked debugProfileData = {
    fullName: `${this.login.userData.first_name} ${this.login.userData.last_name}`,
    imageURL: this.login.userData.picture?.url ?? this.DEFAULT_IMAGE,
  };

  @tracked debugSocialData = {
    'Twitter Id': this.login.userData.twitter_id ?? 'N/A',
    'Github Id': this.login.userData.github_id ?? 'N/A',
    'Linkedin Id': this.login.userData.linkedin_id ?? 'N/A',
    'Discord Id': this.login.userData.discordId ?? 'N/A',
    'Instagram Id': this.login.userData.instagram_id ?? 'N/A',
  };

  @tracked debugUserData = {
    Username: this.login.userData.username ?? 'N/A',
    'Real-Dev-Squad Id': this.login.userData.id,
    'Incomplete User Details':
      this.login.userData.incompleteUserDetails ?? true,
    'Discord Joined At': this.login.userData.discordJoinedAt
      ? isoToLocalDate(this.login.userData.discordJoinedAt)
      : 'N/A',
    'Github Name': this.login.userData.github_display_name,
    Website: this.login.userData.website ?? 'N/A',
  };

  @tracked debugUserRolesData = {
    archived: this.login.userData.roles?.archived ?? true,
    super_user: this.login.userData.roles?.super_user ?? false,
    member: this.login.userData.roles?.member ?? false,
    in_discord: this.login.userData.roles?.in_discord ?? false,
  };

  @tracked debugFeaturesData = {
    featureFlags: ['dev'],
    isSuperUser:
      this.login.userData?.roles?.super_user ||
      this.login.userData?.disabled_roles?.includes('super_user'),
  };

  @action
  async toggleSuperUser({ target }) {
    // Save the current state of the toggle button
    const previousState = target.checked;

    try {
      const response = await fetch(`${APPS.API_BACKEND}/users?profile=true`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disabledRoles: ['super_user'] }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle privilege');
      }

      // On success
      this.debugUserRolesData = {
        ...this.debugUserRolesData,
        super_user: target.checked,
      };
      this.toast.success(
        'Successfully toggled Super User privilege',
        'Success!',
        TOAST_OPTIONS,
      );
    } catch (error) {
      // On failure, revert the toggle button state
      this.debugUserRolesData = {
        ...this.debugUserRolesData,
        super_user: !previousState,
      };
      target.checked = this.debugUserRolesData.super_user;

      this.toast.error(
        "Sorry! couldn't toggle privilege",
        'Error!',
        TOAST_OPTIONS,
      );
    }
  }
}
