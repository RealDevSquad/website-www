import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import Service from '@ember/service';
import sinon from 'sinon';
import { APPLICATIONS_LIST_URL } from 'website-www/constants/apis';
import { TOAST_OPTIONS } from 'website-www/constants/toast-options';

class MockLoginService extends Service {
  isLoading = false;
  isLoggedIn = false;
  userData = null;
}

class MockRouterService extends Service {
  currentRouteName = null;
  transitionTo = sinon.stub();
}

class MockToastService extends Service {
  success = sinon.stub();
  error = sinon.stub();
}

module('Unit | Controller | admin/applications', function (hooks) {
  setupTest(hooks);

  let controller;
  let fetchStub;

  hooks.beforeEach(function () {
    this.owner.register('service:login', MockLoginService);
    this.owner.register('service:router', MockRouterService);
    this.owner.register('service:toast', MockToastService);

    controller = this.owner.lookup('controller:admin/applications');
    fetchStub = sinon.stub(globalThis, 'fetch');
  });

  hooks.afterEach(function () {
    fetchStub.restore();
    sinon.restore();
  });

  test('it initializes with default values', function (assert) {
    assert.false(controller.isLoading, 'isLoading is false by default');
    assert.strictEqual(
      controller.currentPage,
      1,
      'currentPage is 1 by default',
    );
    assert.strictEqual(controller.pageSize, 10, 'pageSize is 10 by default');
    assert.strictEqual(
      controller.selectedStatus,
      'all',
      'selectedStatus is "all" by default',
    );
    assert.strictEqual(
      controller.sortBy,
      'latest',
      'sortBy is "latest" by default',
    );
  });

  test('isCheckingAuth returns correct value based on login state', function (assert) {
    const loginService = this.owner.lookup('service:login');

    loginService.isLoading = true;
    assert.true(controller.isCheckingAuth, 'true when loading');

    loginService.isLoading = false;
    loginService.isLoggedIn = true;
    loginService.userData = null;
    assert.true(
      controller.isCheckingAuth,
      'true when logged in but no userData',
    );

    loginService.userData = { id: 1 };
    assert.false(
      controller.isCheckingAuth,
      'false when logged in with userData',
    );
  });

  test('isSuperUser returns correct value based on user role', function (assert) {
    const loginService = this.owner.lookup('service:login');

    loginService.isLoading = true;
    assert.strictEqual(controller.isSuperUser, null, 'null when checking auth');

    loginService.isLoading = false;
    loginService.isLoggedIn = true;
    loginService.userData = { roles: { super_user: true } };
    assert.true(controller.isSuperUser, 'true when user has super_user role');

    loginService.userData = { roles: {} };
    assert.false(
      controller.isSuperUser,
      'false when user does not have super_user role',
    );
  });

  test('applications getter returns applications from model', function (assert) {
    const mockApplications = [
      { id: 1, status: 'PENDING' },
      { id: 2, status: 'APPROVED' },
    ];
    controller.model = { applications: mockApplications };

    assert.deepEqual(
      controller.applications,
      mockApplications,
      'returns applications from model',
    );

    controller.model = undefined;
    assert.deepEqual(
      controller.applications,
      [],
      'returns empty array when model is undefined',
    );
  });

  test('pendingApplicationsCount filters and counts correctly', function (assert) {
    controller.model = {
      applications: [
        { id: 1, status: 'PENDING' },
        { id: 2, status: 'PENDING' },
        { id: 3, status: 'APPROVED' },
      ],
    };

    assert.strictEqual(
      controller.pendingApplicationsCount,
      2,
      'counts pending applications',
    );
  });

  test('filteredApplications filters by status and sorts correctly', function (assert) {
    controller.selectedStatus = 'PENDING';
    controller.sortBy = 'latest';
    controller.model = {
      applications: [
        {
          id: 1,
          status: 'PENDING',
          submittedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          status: 'APPROVED',
          submittedAt: '2024-01-03T00:00:00Z',
        },
        {
          id: 3,
          status: 'PENDING',
          submittedAt: '2024-01-03T00:00:00Z',
        },
      ],
    };

    const filtered = controller.filteredApplications;
    assert.strictEqual(filtered.length, 2, 'filters by status correctly');
    assert.strictEqual(filtered[0].id, 3, 'sorts by latest date');
    assert.strictEqual(filtered[1].id, 1, 'sorts by latest date');
  });

  test('pagination properties calculate correctly', function (assert) {
    controller.currentPage = 2;
    controller.pageSize = 10;
    controller.model = { total: 25 };

    assert.strictEqual(
      controller.totalPages,
      3,
      'totalPages calculates correctly',
    );
    assert.true(controller.hasNextPage, 'hasNextPage is true');
    assert.true(controller.hasPrevPage, 'hasPrevPage is true');
    assert.true(controller.showPagination, 'showPagination is true');
  });

  test('loadApplications successfully loads applications', async function (assert) {
    assert.expect(6);

    const mockData = {
      applications: [
        { id: 1, status: 'PENDING' },
        { id: 2, status: 'APPROVED' },
      ],
      total: 2,
      page: 1,
      size: 10,
    };

    fetchStub.resolves(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await controller.loadApplications(1);

    assert.ok(fetchStub.calledOnce, 'fetch was called once');
    const [url, options] = fetchStub.firstCall.args;
    assert.strictEqual(
      url,
      APPLICATIONS_LIST_URL(10, 1),
      'fetch was called with correct URL',
    );
    assert.strictEqual(
      options.credentials,
      'include',
      'fetch includes credentials',
    );
    assert.deepEqual(controller.model, mockData, 'model was set correctly');
    assert.strictEqual(controller.currentPage, 1, 'currentPage was set');
    assert.false(controller.isLoading, 'isLoading was set to false');
  });

  test('loadApplications handles error and shows toast', async function (assert) {
    assert.expect(4);

    const toastService = this.owner.lookup('service:toast');

    fetchStub.resolves(
      new Response(JSON.stringify({}), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await controller.loadApplications(1);

    assert.ok(fetchStub.calledOnce, 'fetch was called once');
    assert.ok(toastService.error.calledOnce, 'error toast was called');
    assert.ok(
      toastService.error.calledWith(
        'Failed to load applications',
        'Error',
        TOAST_OPTIONS,
      ),
      'error toast was called with correct parameters',
    );
    assert.deepEqual(
      controller.model,
      {
        applications: [],
        total: 0,
        page: 1,
        size: 10,
      },
      'model was reset to default on error',
    );
  });

  test('goToNextPage calls loadApplications when hasNextPage is true', async function (assert) {
    controller.currentPage = 1;
    controller.pageSize = 10;
    controller.model = { total: 25 };

    const mockData = {
      applications: [{ id: 1, status: 'PENDING' }],
      total: 25,
      page: 2,
      size: 10,
    };

    fetchStub.resolves(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await controller.goToNextPage();

    assert.ok(fetchStub.calledOnce, 'loadApplications was called');
    const [url] = fetchStub.firstCall.args;
    assert.strictEqual(
      url,
      APPLICATIONS_LIST_URL(10, 2),
      'loadApplications was called with next page',
    );
  });

  test('goToNextPage does not call loadApplications when hasNextPage is false', async function (assert) {
    controller.currentPage = 3;
    controller.pageSize = 10;
    controller.model = { total: 25 };

    await controller.goToNextPage();

    assert.ok(fetchStub.notCalled, 'loadApplications was not called');
  });

  test('goToPrevPage calls loadApplications when hasPrevPage is true', async function (assert) {
    controller.currentPage = 2;
    controller.pageSize = 10;
    controller.model = { total: 25 };

    const mockData = {
      applications: [{ id: 1, status: 'PENDING' }],
      total: 25,
      page: 1,
      size: 10,
    };

    fetchStub.resolves(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await controller.goToPrevPage();

    assert.ok(fetchStub.calledOnce, 'loadApplications was called');
    const [url] = fetchStub.firstCall.args;
    assert.strictEqual(
      url,
      APPLICATIONS_LIST_URL(10, 1),
      'loadApplications was called with previous page',
    );
  });

  test('goToPrevPage does not call loadApplications when hasPrevPage is false', async function (assert) {
    controller.currentPage = 1;
    controller.pageSize = 10;
    controller.model = { total: 25 };

    await controller.goToPrevPage();

    assert.ok(fetchStub.notCalled, 'loadApplications was not called');
  });

  test('viewApplication transitions to show route with applicationId', function (assert) {
    const routerService = this.owner.lookup('service:router');
    const applicationId = '123';

    controller.viewApplication(applicationId);

    assert.ok(
      routerService.transitionTo.calledOnce,
      'transitionTo was called once',
    );
    assert.ok(
      routerService.transitionTo.calledWith(
        'admin.applications.show',
        applicationId,
      ),
      'transitionTo was called with correct route and id',
    );

    routerService.transitionTo.resetHistory();
    controller.viewApplication(null);
    assert.ok(
      routerService.transitionTo.notCalled,
      'does not transition when applicationId is null',
    );
  });

  test('handleButtonClick stops propagation and calls viewApplication', function (assert) {
    const routerService = this.owner.lookup('service:router');
    const mockEvent = {
      stopPropagation: sinon.stub(),
    };
    const applicationId = '123';

    controller.handleButtonClick(applicationId, mockEvent);

    assert.ok(
      mockEvent.stopPropagation.calledOnce,
      'stopPropagation was called',
    );
    assert.ok(
      routerService.transitionTo.calledWith(
        'admin.applications.show',
        applicationId,
      ),
      'viewApplication was called',
    );
  });

  test('handleRowKeydown handles keyboard navigation', function (assert) {
    const routerService = this.owner.lookup('service:router');
    const applicationId = '123';

    const enterEvent = {
      key: 'Enter',
      preventDefault: sinon.stub(),
    };
    controller.handleRowKeydown(applicationId, enterEvent);
    assert.ok(
      enterEvent.preventDefault.calledOnce,
      'preventDefault called on Enter',
    );
    assert.ok(
      routerService.transitionTo.calledOnce,
      'viewApplication called on Enter',
    );

    routerService.transitionTo.resetHistory();
    const spaceEvent = {
      key: ' ',
      preventDefault: sinon.stub(),
    };
    controller.handleRowKeydown(applicationId, spaceEvent);
    assert.ok(
      spaceEvent.preventDefault.calledOnce,
      'preventDefault called on Space',
    );
    assert.ok(
      routerService.transitionTo.calledOnce,
      'viewApplication called on Space',
    );

    routerService.transitionTo.resetHistory();
    const tabEvent = {
      key: 'Tab',
      preventDefault: sinon.stub(),
    };
    controller.handleRowKeydown(applicationId, tabEvent);
    assert.ok(
      tabEvent.preventDefault.notCalled,
      'preventDefault not called on other keys',
    );
    assert.ok(
      routerService.transitionTo.notCalled,
      'viewApplication not called on other keys',
    );
  });

  test('formatDate formats date string correctly', function (assert) {
    const dateString = '2024-01-15T10:30:00Z';
    const formatted = controller.formatDate(dateString);

    assert.ok(formatted.includes('Jan'), 'formatted date includes month');
    assert.ok(formatted.includes('15'), 'formatted date includes day');
    assert.ok(formatted.includes('2024'), 'formatted date includes year');
    assert.strictEqual(
      controller.formatDate(null),
      '',
      'returns empty string for null',
    );
    assert.strictEqual(
      controller.formatDate(undefined),
      '',
      'returns empty string for undefined',
    );
  });

  test('filterByStatus updates selectedStatus', function (assert) {
    controller.filterByStatus('PENDING');
    assert.strictEqual(
      controller.selectedStatus,
      'PENDING',
      'selectedStatus was updated',
    );
  });

  test('handleSortChange updates sortBy from event target value', function (assert) {
    const mockEvent = {
      target: {
        value: 'name',
      },
    };

    controller.handleSortChange(mockEvent);
    assert.strictEqual(controller.sortBy, 'name', 'sortBy was updated');
  });

  test('truncateSkills truncates long strings', function (assert) {
    const shortSkills = 'JavaScript, React';
    assert.strictEqual(
      controller.truncateSkills(shortSkills),
      shortSkills,
      'returns original string when length is less than maxLength',
    );

    const longSkills = 'JavaScript, React, Node.js, TypeScript, Vue, Angular';
    const result = controller.truncateSkills(longSkills);
    assert.strictEqual(
      result.length,
      43,
      'truncated string has correct length',
    );
    assert.ok(result.endsWith('...'), 'truncated string ends with ...');
    assert.strictEqual(
      controller.truncateSkills(null),
      '',
      'returns empty string for null',
    );
    assert.strictEqual(
      controller.truncateSkills(undefined),
      '',
      'returns empty string for undefined',
    );
  });

  test('formatRole capitalizes first letter and lowercases rest', function (assert) {
    assert.strictEqual(
      controller.formatRole('DEVELOPER'),
      'Developer',
      'handles uppercase input',
    );
    assert.strictEqual(
      controller.formatRole('designer'),
      'Designer',
      'handles lowercase input with different role',
    );
    assert.strictEqual(
      controller.formatRole(null),
      '',
      'returns empty string for null',
    );
    assert.strictEqual(
      controller.formatRole(undefined),
      '',
      'returns empty string for undefined',
    );
  });

  test('isDetailRoute returns correct value based on current route', function (assert) {
    const routerService = this.owner.lookup('service:router');

    routerService.currentRouteName = 'admin.applications.show';
    assert.true(controller.isDetailRoute, 'returns true when on detail route');

    routerService.currentRouteName = 'admin.applications';
    assert.false(
      controller.isDetailRoute,
      'returns false when not on detail route',
    );
  });
});
