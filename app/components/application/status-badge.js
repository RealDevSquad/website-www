import Component from '@glimmer/component';
import { mapApplicationStatus } from '../../constants/applications';

export default class StatusBadge extends Component {
  get applicationStatus() {
    const status = this.args.status?.toUpperCase();
    return (
      mapApplicationStatus[status] || mapApplicationStatus.PENDING
    )?.toUpperCase();
  }
}
