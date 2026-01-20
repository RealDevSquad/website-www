import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { APPLICATIONS_DATA } from 'website-www/tests/constants/application-data';

module('Integration | Component | application/feedback-card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders feedback details correctly', async function (assert) {
    const feedback = APPLICATIONS_DATA.feedback[0];
    this.set('feedback', feedback);

    await render(hbs`
      <Application::FeedbackCard
        @status={{this.feedback.status}}
        @feedbackText={{this.feedback.feedback}}
        @reviewerName={{this.feedback.reviewerName}}
        @createdAt={{this.feedback.createdAt}}
      />
    `);

    assert
      .dom('[data-test-status-badge]')
      .hasText(feedback.status.toUpperCase());
    assert.dom('[data-test-feedback-text]').hasText(feedback.feedback);
    assert
      .dom('[data-test-feedback-reviewer]')
      .includesText(feedback.reviewerName);
    assert
      .dom('[data-test-feedback-date]')
      .hasText(new Date(feedback.createdAt).toLocaleDateString());
  });

  test('it renders N/A for missing date', async function (assert) {
    await render(hbs`
      <Application::FeedbackCard
        @status="rejected"
        @feedbackText="No"
        @reviewerName="Reviewer"
      />
    `);

    assert.dom('[data-test-feedback-date]').hasText('N/A');
  });

  test('it handles invalid date string correctly', async function (assert) {
    await render(hbs`
      <Application::FeedbackCard
        @status="pending"
        @feedbackText="Wait"
        @reviewerName="Reviewer"
        @createdAt="invalid-date"
      />
    `);

    assert.dom('[data-test-feedback-date]').hasText('N/A');
  });
});
