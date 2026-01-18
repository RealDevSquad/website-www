import { modifier } from 'ember-modifier';

export default modifier(function fileInputLifecycle(
  element,
  [setElement, clearElement],
) {
  if (typeof setElement === 'function') {
    setElement(element);
  }

  return () => {
    if (typeof clearElement === 'function') {
      clearElement();
    }
  };
});
