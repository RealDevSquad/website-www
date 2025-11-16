import Component from '@glimmer/component';
import { formatRoleForDisplay } from '../utils/role-formatter';

export default class ApplicationCardComponent extends Component {
  get initials() {
    const firstName = this.args.application?.biodata?.firstName || '';
    const lastName = this.args.application?.biodata?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  get statusClass() {
    const status = this.args.application?.status || '';
    return status.toLowerCase().replace(/_/g, '-');
  }

  get formattedDate() {
    const dateStr = this.args.application?.lastEditAt;
    if (!dateStr) return '';

    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  }

  get formattedRole() {
    const role = this.args.application?.role || '';
    return formatRoleForDisplay(role);
  }
}
