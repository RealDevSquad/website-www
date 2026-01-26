import Controller from '@ember/controller';
import { adminMessage } from '../../constants/applications';

export default class ApplicationsDetailController extends Controller {
  get application() {
    return this.model?.application;
  }

  get currentUser() {
    return this.model?.currentUser;
  }

  get isAdmin() {
    return this.currentUser?.roles?.super_user === true;
  }

  get isApplicant() {
    return this.currentUser?.id === this.application?.userId;
  }

  get canAccessApplication() {
    return this.isAdmin || this.isApplicant;
  }

  get aboutYouSections() {
    return [
      {
        label: 'Introduction',
        value: this.application?.intro?.introduction || 'N/A',
      },
      { label: 'Fun Fact', value: this.application?.intro?.funFact || 'N/A' },
      { label: 'For Fun', value: this.application?.intro?.forFun || 'N/A' },
      { label: 'Why Join Us', value: this.application?.intro?.whyRds || 'N/A' },
    ];
  }

  get hasFeedback() {
    return this.application?.feedback?.length > 0;
  }

  get showAdminMessage() {
    return adminMessage(this.application?.status);
  }
}
