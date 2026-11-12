import Component from '@glimmer/component';
import { ROLES } from '../constants/live';
import { getOwner } from '@ember/application';

export default class LiveParticipantsComponent extends Component {
  ROLES = ROLES;

  get liveService() {
    return getOwner(this).lookup('service:live');
  }

  get showCount() {
    return !this.liveService.hideParticipantsCount;
  }

  get participantsCount() {
    const { peers, role } = this.args;
    const counts = this.liveService.participantsByRole;
    if (counts) return counts[role] ?? 0;

    return peers.filter((peer) => peer.roleName === role).length;
  }
}
