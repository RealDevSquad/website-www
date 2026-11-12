import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitFor, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ANKUSH_TWITTER } from '../../constants/urls';
import Service from '@ember/service';
import sinon from 'sinon';

class LoginStub extends Service {
  userData = { id: 'fZ0itx5x2ltOSMzON9kb' };
}

class OnboardingStub extends Service {
  getApplicationDetails = sinon.stub().resolves({});
  applicationData = null;
}

class RouterStub extends Service {
  transitionTo = sinon.stub();
}

async function renderStatusCard(context, status, feedback = null) {
  context.set('status', status);
  context.set('feedback', feedback);

  await render(hbs`
    <JoinSteps::StatusCard
      @status={{this.status}}
      @feedback={{this.feedback}}
      @joinDiscord={{this.joinDiscordAction}}
    />
  `);
}

module('Integration | Component | status-card', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('joinDiscordAction', () => {
      window.open = this.spy();
    });
    this.set('ANKUSH_TWITTER', ANKUSH_TWITTER);

    this.owner.register('service:login', LoginStub);
    this.owner.register('service:onboarding', OnboardingStub);
    this.owner.register('service:router', RouterStub);

    this.onboarding = this.owner.lookup('service:onboarding');
    this.router = this.owner.lookup('service:router');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('it renders pending status', async function (assert) {
    await renderStatusCard(this, 'pending', 'Feedback for pending status');
    await waitFor('[data-test-status-card-heading]');

    assert.dom('[data-test-status-card-heading]').hasText('Pending');
    assert.dom('[data-test-icon="pending"]').exists();
    assert
      .dom('[data-test-status-card-description-1]')
      .hasText(
        `Your application is currently under review. Please check this page regularly for updates. If you don't receive an update within 10 days, please reach out to Ankush on X by providing below link 👇.`,
      );
    assert
      .dom('[data-test-link-text]')
      .hasText('Here is your personalized link');
    assert.dom('[data-test-copy-btn]').exists();
  });

  test('it renders rejected status', async function (assert) {
    await renderStatusCard(this, 'rejected', 'Feedback for rejected status');

    assert.dom('[data-test-status-card-heading]').hasText('Rejected');
    assert.dom('[data-test-icon="rejected"]').exists();
    assert
      .dom('[data-test-status-card-description-1]')
      .hasText(
        `We're sorry to inform you that your application has been rejected.`,
      );
    assert.dom('[data-test-status-card-feedback-title]').hasText('Feedback:');
    assert
      .dom('[data-test-status-card-feedback-content]')
      .hasText('Feedback for rejected status');
  });

  test('it renders accepted status with feedback', async function (assert) {
    await renderStatusCard(this, 'accepted', 'Feedback for accepted status');

    assert.dom('[data-test-status-card-heading]').hasText('Accepted');
    assert.dom('[data-test-icon="accepted"]').exists();
    assert
      .dom('[data-test-status-card-description-1]')
      .hasText('Congratulations! Your application has been accepted.');
    assert.dom('[data-test-status-card-description-2]').hasText('Feedback:');
    assert
      .dom('[data-test-status-card-description-3]')
      .hasText('Feedback for accepted status');
  });

  test('it renders accepted status without feedback', async function (assert) {
    await renderStatusCard(this, 'accepted', null);

    assert.dom('[data-test-status-card-heading]').hasText('Accepted');
    assert.dom('[data-test-icon="accepted"]').exists();
    assert
      .dom('[data-test-status-card-description-1]')
      .hasText('Congratulations! Your application has been accepted.');
    assert.dom('[data-test-status-card-description-2]').doesNotExist();
  });

  test('it handles unknown status', async function (assert) {
    await renderStatusCard(this, 'unknown', 'This is unexpected');

    assert.dom('[data-test-status-card-heading]').doesNotExist();
    assert.dom('[data-test-icon]').doesNotExist();
  });

  module('track application button', function (hooks) {
    hooks.beforeEach(function () {
      this.onboarding.applicationData = { id: 'app-123' };
    });

    test('track application button exists when status is pending', async function (assert) {
      await renderStatusCard(
        this,
        'pending',
        'Your application is under review',
      );
      await waitFor('[data-test-button="track-application-btn"]');

      assert
        .dom('[data-test-button="track-application-btn"]')
        .exists('Track Application button exists');
      assert
        .dom('[data-test-button="track-application-btn"]')
        .hasText('Track Application');
    });

    test('trackApplication navigates to application detail page', async function (assert) {
      await renderStatusCard(
        this,
        'pending',
        'Your application is under review',
      );
      await click('[data-test-button="track-application-btn"]');

      assert.ok(
        this.router.transitionTo.calledOnce,
        'transitionTo is called once',
      );
      assert.strictEqual(
        this.router.transitionTo.firstCall.args[0],
        'applications.detail',
        'transitions to applications.detail route',
      );
      assert.strictEqual(
        this.router.transitionTo.firstCall.args[1],
        'app-123',
        'passes application ID as route parameter',
      );
    });

    test('trackApplication does nothing when applicationId is missing', async function (assert) {
      this.onboarding.applicationData = null;

      await renderStatusCard(
        this,
        'pending',
        'Your application is under review',
      );
      await click('[data-test-button="track-application-btn"]');

      assert.notOk(
        this.router.transitionTo.called,
        'transitionTo is not called when applicationId is missing',
      );
    });
  });
});
