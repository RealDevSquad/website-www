import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import {
  blur,
  click,
  focus,
  render,
  triggerEvent,
  triggerKeyEvent,
} from '@ember/test-helpers';
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

    assert.dom('[data-test-event-info-card]').isNotVisible();
  });

  test('it shows the event ID on hover and hides it on mouse leave', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    await triggerEvent('[data-test-event-info]', 'mouseenter');

    assert.dom('[data-test-event-info-card]').isVisible();
    assert.dom('[data-test-event-info-id]').hasText('test-event-1');

    await triggerEvent('[data-test-event-info]', 'mouseleave');

    assert.dom('[data-test-event-info-card]').isNotVisible();
  });

  test('it shows the event ID when the button gets keyboard focus and hides it on blur', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    await focus('[data-test-event-info-button]');

    assert.dom('[data-test-event-info-card]').isVisible();
    assert.dom('[data-test-event-info-id]').hasText('test-event-1');

    await blur('[data-test-event-info-button]');

    assert.dom('[data-test-event-info-card]').isNotVisible();
  });

  test('it keeps the card visible on mouse leave while the button is focused', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    await focus('[data-test-event-info-button]');
    await triggerEvent('[data-test-event-info]', 'mouseenter');
    await triggerEvent('[data-test-event-info]', 'mouseleave');

    assert.dom('[data-test-event-info-card]').isVisible();
  });

  test('it exposes the card state and relationship to assistive technology', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    const cardId = this.element
      .querySelector('[data-test-event-info-card]')
      .getAttribute('id');

    assert.ok(cardId, 'card has an id');
    assert
      .dom('[data-test-event-info-button]')
      .hasAttribute('aria-controls', cardId)
      .hasAttribute('aria-describedby', cardId)
      .hasAttribute('aria-expanded', 'false');

    await focus('[data-test-event-info-button]');

    assert
      .dom('[data-test-event-info-button]')
      .hasAttribute('aria-expanded', 'true');

    await blur('[data-test-event-info-button]');

    assert
      .dom('[data-test-event-info-button]')
      .hasAttribute('aria-expanded', 'false');
  });

  test('it closes the card on Escape when opened by focus', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    await focus('[data-test-event-info-button]');
    assert.dom('[data-test-event-info-card]').isVisible();

    await triggerKeyEvent('[data-test-event-info-button]', 'keydown', 'Escape');

    assert.dom('[data-test-event-info-card]').isNotVisible();
    assert
      .dom('[data-test-event-info-button]')
      .hasAttribute('aria-expanded', 'false');
  });

  test('it closes the card on Escape when opened by both hover and focus', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    await triggerEvent('[data-test-event-info]', 'mouseenter');
    await focus('[data-test-event-info-button]');

    await triggerKeyEvent('[data-test-event-info-button]', 'keydown', 'Escape');

    assert.dom('[data-test-event-info-card]').isNotVisible();
  });

  test('it reopens the card on click after Escape', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    await focus('[data-test-event-info-button]');
    await triggerKeyEvent('[data-test-event-info-button]', 'keydown', 'Escape');
    assert.dom('[data-test-event-info-card]').isNotVisible();

    await click('[data-test-event-info-button]');

    assert.dom('[data-test-event-info-card]').isVisible();
  });

  test('it keeps the card visible after Escape and hover while the button is focused', async function (assert) {
    await render(hbs`<EventInfo @eventId="test-event-1" />`);

    await focus('[data-test-event-info-button]');
    await triggerKeyEvent('[data-test-event-info-button]', 'keydown', 'Escape');

    await triggerEvent('[data-test-event-info]', 'mouseenter');
    await triggerEvent('[data-test-event-info]', 'mouseleave');

    assert.dom('[data-test-event-info-card]').isVisible();
  });
});
