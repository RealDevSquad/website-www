import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, click, triggerEvent, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { runTask } from 'ember-lifeline';

const SCROLL_DEBOUNCE_TIME = 500;

module('Integration | Component | scroll-to-top', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    class RouterStub extends Service {
      currentRoute = { name: 'index' };
    }

    this.owner.register('service:router', RouterStub);
  });

  async function waitForScrollDebounce(context) {
    await new Promise((resolve) => runTask(context, resolve, SCROLL_DEBOUNCE_TIME + 10));
    await settled();
  }

  test('it does not render on live route', async function (assert) {
    this.owner.lookup('service:router').currentRoute = { name: 'live' };

    await render(hbs`<ScrollToTop />`);

    assert.dom('.btn__scroll').doesNotExist('Scroll to top button is not rendered on live route');
  });

  test('it does not render when not scrolled', async function (assert) {
    await render(hbs`<ScrollToTop />`);

    assert.dom('.btn__scroll').doesNotExist('Scroll to top button is not rendered when at top of page');
  });

  test('it renders when scrolled down', async function (assert) {
    await render(hbs`<ScrollToTop />`);

    window.scrollY = 1000;
    await triggerEvent(window, 'scroll');
    await waitForScrollDebounce(this);

    assert.dom('.btn__scroll').exists('Scroll to top button appears when scrolled down');
  });

  test('it scrolls to top on click', async function (assert) {
    let scrollToCalled = false;
    let scrollToArgs = null;

    const originalScrollTo = window.scrollTo;
    window.scrollTo = function (options) {
      scrollToCalled = true;
      scrollToArgs = options;
    };

    await render(hbs`<ScrollToTop />`);

    window.scrollY = 1000;
    await triggerEvent(window, 'scroll');
    await waitForScrollDebounce(this);
    await click('.btn__scroll');

    assert.true(scrollToCalled, 'scrollTo was called');
    assert.deepEqual(scrollToArgs, { top: 0, behavior: 'smooth' }, 'scrollTo was called with correct arguments');

    window.scrollTo = originalScrollTo;
  });

  test('it hides when scrolled back to top', async function (assert) {
    await render(hbs`<ScrollToTop />`);

    window.scrollY = 1000;
    await triggerEvent(window, 'scroll');
    await waitForScrollDebounce(this);
    assert.dom('.btn__scroll').exists();

    window.scrollY = 0;
    await triggerEvent(window, 'scroll');
    await waitForScrollDebounce(this);

    assert.dom('.btn__scroll').doesNotExist('Scroll to top button hides when scrolled to top');
  });

  test('it has correct button attributes', async function (assert) {
    await render(hbs`<ScrollToTop />`);

    window.scrollY = 1000;
    await triggerEvent(window, 'scroll');
    await waitForScrollDebounce(this);

    assert.dom('.btn__scroll').hasAttribute('type', 'button', 'Button has correct type');
    assert.dom('.btn__scroll img').exists('Image is rendered');
    assert.dom('.btn__scroll img').hasAttribute('src', '/assets/icons/arrowup-icon.svg');
    assert.dom('.btn__scroll img').hasAttribute('alt', 'arrow up');
  });
});
