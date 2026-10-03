import { modifier } from 'ember-modifier';

/**
 * Wires picture in picture events on a media element and tears them down again
 * when the element leaves the DOM.
 *
 * Usage: {{picture-in-picture-events this.onSetup this.onTeardown}}
 */
export default modifier(function pictureInPictureEvents(
  element,
  [setup, teardown],
) {
  setup?.(element);

  return () => teardown?.(element);
});
