import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { blur, focus, render, triggerEvent } from '@ember/test-helpers';
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

  test('it shows the event ID when the button gets keyboard focus and hides it on blur', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    await focus('[data-test-event-info-button]');

    assert.dom('[data-test-event-info-card]').exists();
    assert.dom('[data-test-event-info-id]').hasText('test-event-1');

    await blur('[data-test-event-info-button]');

    assert.dom('[data-test-event-info-card]').doesNotExist();
  });

  test('it keeps the card visible on mouse leave while the button is focused', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    await focus('[data-test-event-info-button]');
    await triggerEvent('[data-test-event-info]', 'mouseenter');
    await triggerEvent('[data-test-event-info]', 'mouseleave');

    assert.dom('[data-test-event-info-card]').exists();
  });
});
