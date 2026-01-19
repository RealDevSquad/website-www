import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | application/feedback-card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders feedback details correctly', async function (assert) {
    this.set('feedback', {
      status: 'accepted',
      feedback: 'Great job!',
      reviewerName: 'Ankush',
      createdAt: '2026-01-14T15:37:10.991Z',
    });

    await render(hbs`
      <Application::FeedbackCard
        @status={{this.feedback.status}}
        @feedbackText={{this.feedback.feedback}}
        @reviewerName={{this.feedback.reviewerName}}
        @createdAt={{this.feedback.createdAt}}
      />
    `);

    assert.dom('[data-test-status-badge]').hasText('ACCEPTED');
    assert.dom('[data-test-feedback-text]').hasText('Great job!');
    assert.dom('[data-test-feedback-reviewer]').includesText('Ankush');
    assert
      .dom('[data-test-feedback-date]')
      .hasText(new Date('2026-01-14T15:37:10.991Z').toLocaleDateString());
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
