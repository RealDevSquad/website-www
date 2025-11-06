import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { APPLICATIONS_LIST_URL } from '../../constants/apis';
import { TOAST_OPTIONS } from '../../constants/toast-options';

export default class AdminApplicationsController extends Controller {
  @service login;
  @service router;
  @service toast;
  @tracked isLoading = false;
  @tracked currentPage = 1;
  @tracked pageSize = 10;
  @tracked selectedStatus = 'all';
  @tracked sortBy = 'latest';

  queryParams = ['page', 'size', 'status', 'sort', 'dev'];

  get isCheckingAuth() {
    return (
      this.login.isLoading || (this.login.isLoggedIn && !this.login.userData)
    );
  }

  get isSuperUser() {
    if (this.isCheckingAuth) {
      return null;
    }
    return this.login.userData?.roles?.super_user || false;
  }

  get applications() {
    return this.model?.applications || [];
  }

  get totalApplicationsCount() {
    return this.applications.length;
  }

  get pendingApplicationsCount() {
    return this.applications.filter((app) => app.status === 'PENDING').length;
  }

  get approvedApplicationsCount() {
    return this.applications.filter((app) => app.status === 'APPROVED').length;
  }

  get rejectedApplicationsCount() {
    return this.applications.filter((app) => app.status === 'REJECTED').length;
  }

  get filteredApplications() {
    let apps = this.applications;

    if (this.selectedStatus !== 'all') {
      apps = apps.filter((app) => app.status === this.selectedStatus);
    }

    switch (this.sortBy) {
      case 'latest':
        apps = [...apps].sort(
          (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
        );
        break;
      case 'oldest':
        apps = [...apps].sort(
          (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt),
        );
        break;
      case 'name':
        apps = [...apps].sort((a, b) => {
          const nameA = `${a.biodata.firstName} ${a.biodata.lastName}`;
          const nameB = `${b.biodata.firstName} ${b.biodata.lastName}`;
          return nameA.localeCompare(nameB);
        });
        break;
      case 'status':
        apps = [...apps].sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    return apps;
  }

  get totalPages() {
    return Math.ceil((this.model?.total || 0) / this.pageSize);
  }

  get hasNextPage() {
    return this.currentPage < this.totalPages;
  }

  get hasPrevPage() {
    return this.currentPage > 1;
  }

  get showPagination() {
    return this.totalPages > 1;
  }

  get isPrevDisabled() {
    return !this.hasPrevPage;
  }

  get isNextDisabled() {
    return !this.hasNextPage;
  }

  @action
  async loadApplications(page = 1) {
    this.isLoading = true;
    this.currentPage = page;

    try {
      const response = await fetch(APPLICATIONS_LIST_URL(this.pageSize, page), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      this.model = {
        applications: data.applications || [],
        total: data.total || 0,
        page: data.page || 1,
        size: data.size || 10,
      };
    } catch (error) {
      console.error('Error loading applications:', error);
      this.toast.error('Failed to load applications', 'Error', TOAST_OPTIONS);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  goToNextPage() {
    if (this.hasNextPage) {
      this.loadApplications(this.currentPage + 1);
    }
  }

  @action
  goToPrevPage() {
    if (this.hasPrevPage) {
      this.loadApplications(this.currentPage - 1);
    }
  }

  @action
  viewApplication(applicationId) {
    this.router.transitionTo('admin.applications.show', applicationId);
  }

  @action
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  @action
  filterByStatus(status) {
    this.selectedStatus = status;
  }

  @action
  handleSortChange(event) {
    this.sortBy = event.target.value;
  }

  @action
  truncateSkills(skills) {
    if (!skills) return '';
    const maxLength = 40;
    if (skills.length <= maxLength) {
      return skills;
    }
    return skills.substring(0, maxLength) + '...';
  }

  @action
  formatRole(role) {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }
}
