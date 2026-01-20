import { module, test } from 'qunit';
import { setupTest } from 'website-www/tests/helpers';
import { APPLICATIONS_DATA } from 'website-www/tests/constants/application-data';

module('Unit | Controller | applications/detail', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.controller = this.owner.lookup('controller:applications/detail');
  });

  test('application details controller exists', function (assert) {
    assert.ok(this.controller, 'Controller for application detail exists!');
  });

  test('isAdmin correctly identifies super_user role', function (assert) {
    this.controller.model = { currentUser: { roles: { super_user: true } } };
    assert.true(this.controller.isAdmin, 'True when super_user');

    this.controller.model = { currentUser: { roles: { super_user: false } } };
    assert.false(this.controller.isAdmin, 'False when not super_user');
  });

  test('isApplicant correctly identifies application owner', function (assert) {
    const userId = APPLICATIONS_DATA.userId;
    this.controller.model = {
      currentUser: { id: userId },
      application: { userId },
    };
    assert.true(this.controller.isApplicant, 'True when IDs match');

    this.controller.model = {
      currentUser: { id: userId },
      application: { userId: 'other' },
    };
    assert.false(this.controller.isApplicant, 'False when IDs mismatch');
  });

  test('canAccessApplication correctly returns application access', function (assert) {
    this.controller.model = {
      currentUser: { roles: { super_user: true } },
      application: { userId: 'other' },
    };
    assert.true(this.controller.canAccessApplication, 'Admin access');

    this.controller.model = {
      currentUser: { id: 'user1' },
      application: { userId: 'user1' },
    };
    assert.true(this.controller.canAccessApplication, 'Applicant access');

    this.controller.model = {
      currentUser: { id: 'user1', roles: { super_user: false } },
      application: { userId: 'user2' },
    };
    assert.false(this.controller.canAccessApplication, 'No access');
  });

  test('aboutYouSections getter formats the data correctly', function (assert) {
    this.controller.model = { application: APPLICATIONS_DATA };

    const expected = [
      { label: 'Introduction', value: APPLICATIONS_DATA.intro.introduction },
      { label: 'Fun Fact', value: APPLICATIONS_DATA.intro.funFact },
      { label: 'For Fun', value: APPLICATIONS_DATA.intro.forFun },
      { label: 'Why Join Us', value: APPLICATIONS_DATA.intro.whyRds },
    ];

    assert.deepEqual(
      this.controller.aboutYouSections,
      expected,
      'Formatted correctly',
    );
  });

  test('hasFeedback correctly identifies feedback presence', function (assert) {
    this.controller.model = { application: APPLICATIONS_DATA };
    assert.true(this.controller.hasFeedback, 'True when feedback present');

    this.controller.model = { application: { feedback: [] } };
    assert.false(this.controller.hasFeedback, 'False when empty');
  });

  test('showAdminMessage correctly maps application status', function (assert) {
    this.controller.model = { application: { status: 'pending' } };
    assert.ok(this.controller.showAdminMessage.includes('reviewing'));

    this.controller.model = { application: { status: 'accepted' } };
    assert.ok(this.controller.showAdminMessage.includes('approved'));
  });
});
