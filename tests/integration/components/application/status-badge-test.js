import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | application/status-badge', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the status in uppercase', async function (assert) {
    await render(hbs`<Application::StatusBadge @status="accepted" />`);
    assert.dom('[data-test-status-badge]').hasText('ACCEPTED');

    await render(hbs`<Application::StatusBadge @status="pending" />`);
    assert.dom('[data-test-status-badge]').hasText('PENDING');

    await render(hbs`<Application::StatusBadge @status="changes_requested" />`);
    assert.dom('[data-test-status-badge]').hasText('CHANGES REQUESTED');
  });

  test('it applies the correct status class', async function (assert) {
    await render(hbs`<Application::StatusBadge @status="accepted" />`);
    assert.dom('[data-test-status-badge]').hasClass('status-badge--accepted');

    await render(hbs`<Application::StatusBadge @status="rejected" />`);
    assert.dom('[data-test-status-badge]').hasClass('status-badge--rejected');
  });

  test('it fallbacks to PENDING for unknown status', async function (assert) {
    await render(hbs`<Application::StatusBadge @status="unknown" />`);
    assert.dom('[data-test-status-badge]').hasText('PENDING');
  });
});
