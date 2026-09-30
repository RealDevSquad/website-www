import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | event-info', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the info icon with an aria-label', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    assert.dom('[data-test-event-info-button]').exists();
    assert
      .dom('[data-test-event-info-button]')
      .hasAttribute('aria-label', 'Show event ID');
  });

  test('it hides the card by default', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    assert.dom('[data-test-event-info-card]').doesNotExist();
  });

  test('it shows the event ID on hover and hides it on mouse leave', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    await triggerEvent('[data-test-event-info]', 'mouseenter');

    assert.dom('[data-test-event-info-card]').exists();
    assert.dom('[data-test-event-info-id]').hasText('test-event-1');

    await triggerEvent('[data-test-event-info]', 'mouseleave');

    assert.dom('[data-test-event-info-card]').doesNotExist();
  });
});
