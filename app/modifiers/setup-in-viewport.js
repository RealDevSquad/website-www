import { modifier } from 'ember-modifier';

export default modifier(function setupInViewport(element, [callback]) {
  callback?.(element);
});
