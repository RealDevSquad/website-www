import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import Service from '@ember/service';
import sinon from 'sinon';
import { APPLICATION_ACTION_URL } from 'website-www/constants/apis';
import { TOAST_OPTIONS } from 'website-www/constants/toast-options';

class MockLoginService extends Service {
  isLoading = false;
  isLoggedIn = false;
  userData = null;
}

class MockRouterService extends Service {
  transitionTo = sinon.stub();
}

class MockToastService extends Service {
  success = sinon.stub();
  error = sinon.stub();
}

module('Unit | Controller | admin/applications/show', function (hooks) {
  setupTest(hooks);

  let controller;
  let fetchStub;

  hooks.beforeEach(function () {
    this.owner.register('service:login', MockLoginService);
    this.owner.register('service:router', MockRouterService);
    this.owner.register('service:toast', MockToastService);

    controller = this.owner.lookup('controller:admin/applications/show');
    fetchStub = sinon.stub(globalThis, 'fetch');
  });

  hooks.afterEach(function () {
    fetchStub.restore();
    sinon.restore();
  });

  test('it initializes with default values', function (assert) {
    assert.false(controller.isProcessing, 'isProcessing is false by default');
    assert.strictEqual(
      controller.feedbackText,
      '',
      'feedbackText is empty string by default',
    );
    assert.false(
      controller.showFeedbackInput,
      'showFeedbackInput is false by default',
    );
    assert.strictEqual(
      controller.selectedAction,
      null,
      'selectedAction is null by default',
    );
    assert.ok(
      controller._dateCache instanceof Map,
      'dateCache is initialized as Map',
    );
  });

  test('isSuperUser returns correct value based on user role', function (assert) {
    const loginService = this.owner.lookup('service:login');

    loginService.userData = { roles: { super_user: true } };
    assert.true(controller.isSuperUser, 'true when user has super_user role');

    loginService.userData = { roles: {} };
    assert.strictEqual(
      controller.isSuperUser,
      undefined,
      'undefined when user does not have super_user role',
    );

    loginService.userData = null;
    assert.strictEqual(
      controller.isSuperUser,
      undefined,
      'undefined when userData is null',
    );
  });

  test('isLoading returns login service isLoading state', function (assert) {
    const loginService = this.owner.lookup('service:login');

    loginService.isLoading = true;
    assert.true(controller.isLoading, 'true when login is loading');

    loginService.isLoading = false;
    assert.false(controller.isLoading, 'false when login is not loading');
  });

  test('application getter returns model', function (assert) {
    const mockApplication = { id: 1, status: 'PENDING' };
    controller.model = mockApplication;

    assert.deepEqual(
      controller.application,
      mockApplication,
      'returns model as application',
    );

    controller.model = null;
    assert.strictEqual(
      controller.application,
      null,
      'returns null when model is null',
    );
  });

  test('showFeedback handles approve action without feedback input', function (assert) {
    controller.showFeedbackInput = true;
    controller.selectedAction = 'reject';

    controller.showFeedback('approve');

    assert.false(
      controller.showFeedbackInput,
      'showFeedbackInput is false for approve',
    );
    assert.strictEqual(
      controller.selectedAction,
      'reject',
      'selectedAction remains unchanged for approve',
    );
  });

  test('showFeedback shows feedback input for non-approve actions', function (assert) {
    controller.showFeedbackInput = false;
    controller.selectedAction = null;

    controller.showFeedback('reject');

    assert.true(
      controller.showFeedbackInput,
      'showFeedbackInput is true for reject',
    );
    assert.strictEqual(
      controller.selectedAction,
      'reject',
      'selectedAction is set to reject',
    );
    assert.ok(fetchStub.notCalled, 'handleApplicationAction not called yet');

    controller.showFeedback('request-changes');
    assert.strictEqual(
      controller.selectedAction,
      'request-changes',
      'selectedAction is set to request-changes',
    );
  });

  test('handleApplicationAction requires feedback for non-approve actions', async function (assert) {
    assert.expect(2);

    const toastService = this.owner.lookup('service:toast');
    controller.feedbackText = '';
    controller.model = { id: 123 };

    await controller.handleApplicationAction('reject');

    assert.ok(toastService.error.calledOnce, 'error toast was called');
    assert.ok(
      toastService.error.calledWith(
        'Please provide feedback',
        'Error',
        TOAST_OPTIONS,
      ),
      'error toast called with correct message',
    );
  });

  test('handleApplicationAction successfully approves application', async function (assert) {
    assert.expect(6);

    const routerService = this.owner.lookup('service:router');
    const toastService = this.owner.lookup('service:toast');
    controller.model = { id: 123 };

    fetchStub.resolves(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await controller.handleApplicationAction('approve');

    assert.ok(fetchStub.calledOnce, 'fetch was called once');
    const [url, options] = fetchStub.firstCall.args;
    assert.strictEqual(
      url,
      APPLICATION_ACTION_URL(123, 'approve'),
      'fetch was called with correct URL',
    );
    assert.strictEqual(options.method, 'POST', 'fetch uses POST method');
    assert.ok(toastService.success.calledOnce, 'success toast was called');
    assert.ok(
      toastService.success.calledWith(
        'Application approved successfully',
        'Success',
        TOAST_OPTIONS,
      ),
      'success toast called with correct message',
    );
    assert.ok(
      routerService.transitionTo.calledWith('admin.applications'),
      'router transitions to applications list',
    );
  });

  test('handleApplicationAction successfully rejects application with feedback', async function (assert) {
    assert.expect(6);

    const routerService = this.owner.lookup('service:router');
    const toastService = this.owner.lookup('service:toast');
    controller.model = { id: 123 };
    controller.feedbackText = 'Needs improvement';

    const mockResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    fetchStub.resolves(mockResponse);

    await controller.handleApplicationAction('reject');

    assert.ok(fetchStub.calledOnce, 'fetch was called once');
    const [, options] = fetchStub.firstCall.args;
    const body = JSON.parse(options.body);
    assert.strictEqual(
      body.feedback,
      'Needs improvement',
      'feedback is included in request body',
    );
    assert.ok(toastService.success.calledOnce, 'success toast was called');
    const successCallArgs = toastService.success.firstCall.args;
    assert.strictEqual(
      successCallArgs[0],
      'Application rejected successfully',
      'success toast called with correct message',
    );
    assert.strictEqual(
      successCallArgs[1],
      'Success',
      'success toast called with correct title',
    );
    assert.ok(
      routerService.transitionTo.calledWith('admin.applications'),
      'router transitions to applications list',
    );
  });

  test('handleApplicationAction handles error and shows toast', async function (assert) {
    assert.expect(4);

    const toastService = this.owner.lookup('service:toast');
    controller.model = { id: 123 };
    controller.feedbackText = 'Feedback text';

    fetchStub.resolves(
      new Response(JSON.stringify({}), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await controller.handleApplicationAction('reject');

    assert.ok(fetchStub.calledOnce, 'fetch was called once');
    assert.ok(toastService.error.calledOnce, 'error toast was called');
    assert.ok(
      toastService.error.calledWith(
        'Failed to reject application',
        'Error',
        TOAST_OPTIONS,
      ),
      'error toast called with correct message',
    );
    assert.false(controller.isProcessing, 'isProcessing is reset to false');
  });

  test('handleApplicationAction sets isProcessing flag correctly', async function (assert) {
    controller.model = { id: 123 };
    controller.feedbackText = 'Feedback';

    const promise = controller.handleApplicationAction('reject');
    assert.true(controller.isProcessing, 'isProcessing is true during request');

    fetchStub.resolves(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await promise;
    assert.false(
      controller.isProcessing,
      'isProcessing is false after request',
    );
  });

  test('submitWithFeedback calls handleApplicationAction with selectedAction', async function (assert) {
    controller.model = { id: 123 };
    controller.selectedAction = 'reject';
    controller.feedbackText = 'Feedback text';

    fetchStub.resolves(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await controller.submitWithFeedback();

    assert.ok(fetchStub.calledOnce, 'handleApplicationAction was called');
    const [url] = fetchStub.firstCall.args;
    assert.strictEqual(
      url,
      APPLICATION_ACTION_URL(123, 'reject'),
      'handleApplicationAction called with selectedAction',
    );
  });

  test('submitWithFeedback does nothing when selectedAction is null', async function (assert) {
    controller.selectedAction = null;

    await controller.submitWithFeedback();

    assert.ok(fetchStub.notCalled, 'handleApplicationAction was not called');
  });

  test('goBack transitions to applications list', function (assert) {
    const routerService = this.owner.lookup('service:router');

    controller.goBack();

    assert.ok(
      routerService.transitionTo.calledOnce,
      'transitionTo was called once',
    );
    assert.ok(
      routerService.transitionTo.calledWith('admin.applications'),
      'transitionTo was called with correct route',
    );
  });

  test('formatDate formats date string correctly', function (assert) {
    const dateString = '2024-01-15T10:30:00Z';
    const formatted = controller.formatDate(dateString);

    assert.ok(formatted.includes('Jan'), 'formatted date includes month');
    assert.ok(formatted.includes('15'), 'formatted date includes day');
    assert.ok(formatted.includes('2024'), 'formatted date includes year');
  });

  test('formatDate returns empty string for invalid inputs', function (assert) {
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
    assert.strictEqual(
      controller.formatDate(''),
      '',
      'returns empty string for empty string',
    );
    assert.strictEqual(
      controller.formatDate('invalid-date'),
      '',
      'returns empty string for invalid date string',
    );
  });

  test('formatDate caches formatted dates', function (assert) {
    const dateString = '2024-01-15T10:30:00Z';
    const firstCall = controller.formatDate(dateString);
    const secondCall = controller.formatDate(dateString);

    assert.strictEqual(firstCall, secondCall, 'returns cached result');
    assert.strictEqual(
      controller._dateCache.size,
      1,
      'cache contains one entry',
    );
  });

  test('formatDate handles Date objects', function (assert) {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = controller.formatDate(date);

    assert.ok(formatted.includes('Jan'), 'formatted date includes month');
    assert.ok(formatted.includes('15'), 'formatted date includes day');
    assert.ok(formatted.includes('2024'), 'formatted date includes year');
  });

  test('formatDate handles invalid Date objects', function (assert) {
    const invalidDate = new Date('invalid');
    const formatted = controller.formatDate(invalidDate);

    assert.strictEqual(formatted, '', 'returns empty string for invalid Date');
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
      controller.formatRole('DeVeLoPeR'),
      'Developer',
      'handles mixed case input',
    );
  });

  test('formatRole returns empty string for invalid inputs', function (assert) {
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
    assert.strictEqual(
      controller.formatRole(''),
      '',
      'returns empty string for empty string',
    );
    assert.strictEqual(
      controller.formatRole(123),
      '',
      'returns empty string for non-string input',
    );
  });

  test('updateFeedbackText updates feedbackText from event', function (assert) {
    const mockEvent = {
      target: {
        value: 'This is feedback text',
      },
    };

    controller.updateFeedbackText(mockEvent);

    assert.strictEqual(
      controller.feedbackText,
      'This is feedback text',
      'feedbackText was updated from event target value',
    );
  });
});
