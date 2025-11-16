import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { APPLICATION_STATUS_OPTIONS } from '../constants/application-status';
import { ROLES } from '../constants/roles';
import { APPS } from '../constants/urls';
import apiRequest from '../utils/api-request';
import { TOAST_OPTIONS } from '../constants/toast-options';
import { formatRoleForDisplay } from '../utils/role-formatter';
import { APPLICATIONS_URL } from '../constants/apis';

const SKELETON_COUNT = 9;
const VIEWPORT_TOLERANCE = { bottom: 100 };
const APPLICATIONS_SIZE = 12;

export default class ApplicationsController extends Controller {
  @service router;
  @service inViewport;
  @service toast;
  @service fastboot;

  queryParams = ['status', 'role'];

  @tracked status = null;
  @tracked role = null;
  @tracked activeTab = 'Applications';
  @tracked tabs = [
    { id: 'applications', label: 'Applications', active: true },
    { id: 'stats', label: 'Stats', active: false, disabled: true },
  ];

  @tracked allApplications = [];
  @tracked nextLink = null;
  @tracked totalCount = 0;

  @tracked isLoading = false;
  @tracked isLoadingMore = false;
  @tracked isInfiniteScrollSetup = false;

  get hasMore() {
    return this.nextLink !== null && !this.isLoadingMore;
  }

  get filteredApplications() {
    return this.allApplications.filter((app) => app?.id);
  }

  get skeletonCount() {
    return Array(SKELETON_COUNT).fill(null);
  }

  get statusOptions() {
    return APPLICATION_STATUS_OPTIONS.map((status) => ({
      value: status,
      label: formatRoleForDisplay(status),
    }));
  }

  get roleOptions() {
    return Object.values(ROLES).map((role) => ({
      value: role,
      label: formatRoleForDisplay(role),
    }));
  }

  @action
  tabHandler(tabId) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab && !tab.disabled) {
      this.activeTab = tab.label;
      this.tabs = this.tabs.map((t) =>
        t.id === tabId ? { ...t, active: true } : { ...t, active: false },
      );
    }
  }

  @action
  onRoleChange(event) {
    const value = event.target.value;
    const newRole = value === '' ? undefined : value;

    this.role = newRole || null;
    this.updateQueryParams({ role: newRole, status: this.status });
    this.loadFilteredApplications(newRole, this.status);
  }

  @action
  onStatusChange(event) {
    const value = event.target.value;
    const newStatus = value === '' ? undefined : value;

    this.status = newStatus || null;
    this.updateQueryParams({ status: newStatus, role: this.role });
    this.loadFilteredApplications(this.role, newStatus);
  }

  updateQueryParams({ status, role }) {
    this.router.replaceWith('applications', {
      queryParams: {
        status: status || undefined,
        role: role || undefined,
      },
    });
  }

  async loadFilteredApplications(role, status) {
    this.isLoading = true;
    this.isInfiniteScrollSetup = false;

    try {
      const applicationsResponse = await apiRequest(
        APPLICATIONS_URL(APPLICATIONS_SIZE, status, role),
      );

      if (!applicationsResponse.ok) {
        throw new Error(`HTTP error! status: ${applicationsResponse.status}`);
      }

      const applicationsData = await applicationsResponse.json();
      this.allApplications = applicationsData.applications || [];
      this.nextLink = applicationsData.next || null;
      this.totalCount = applicationsData.totalCount || 0;
    } catch (error) {
      console.error('Error fetching applications:', error);
      this.toast.error(
        `Something went wrong. ${error.message}`,
        'Error!',
        TOAST_OPTIONS,
      );
      this.allApplications = [];
      this.nextLink = null;
      this.totalCount = 0;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  async loadMoreApplications() {
    if (!this.nextLink || this.isLoadingMore) {
      return;
    }

    this.isLoadingMore = true;

    try {
      const fullUrl = `${APPS.API_BACKEND}${this.nextLink}`;
      const response = await apiRequest(fullUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newApplications = data.applications || [];

      this.allApplications = [...this.allApplications, ...newApplications];
      this.nextLink = data.next || null;
      this.totalCount = data.totalCount || this.totalCount;
    } catch (error) {
      this.handleError(error, 'Error loading more applications:');
    } finally {
      this.isLoadingMore = false;
    }
  }

  @action
  setupInfiniteScroll() {
    if (this.fastboot.isFastBoot || this.isInfiniteScrollSetup) {
      return;
    }

    const triggerElement = document.getElementById('infinite-scroll-trigger');
    if (!triggerElement) {
      return;
    }

    this.inViewport.stopWatching(triggerElement);

    const { onEnter } = this.inViewport.watchElement(triggerElement, {
      viewportTolerance: VIEWPORT_TOLERANCE,
    });

    let isHandlingScroll = false;

    onEnter(() => {
      if (isHandlingScroll || this.isLoadingMore || !this.hasMore) {
        return;
      }

      isHandlingScroll = true;
      this.loadMoreApplications().finally(() => {
        isHandlingScroll = false;
      });
    });

    this.isInfiniteScrollSetup = true;
  }

  handleError(error, context) {
    console.error(context, error);
    this.toast.error(
      `Something went wrong. ${error.message}`,
      'Error!',
      TOAST_OPTIONS,
    );
    this.allApplications = [];
    this.nextLink = null;
    this.totalCount = 0;
  }

  willDestroy() {
    super.willDestroy();

    if (!this.fastboot.isFastBoot) {
      const triggerElement = document.getElementById('infinite-scroll-trigger');
      if (triggerElement) {
        this.inViewport.stopWatching(triggerElement);
      }
    }

    this.isInfiniteScrollSetup = false;
  }
}
