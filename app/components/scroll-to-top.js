import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import { tracked } from '@glimmer/tracking';

const SCROLL_DEBOUNCE_TIME = 500;
export default class ScrollToTopComponent extends Component {
  @service router;
  @service fastboot;
  @tracked isLive = this.router.currentRoute.name === 'live';
  @tracked isScrollToTopVisible = false;

  constructor() {
    super(...arguments);
    if (!this.fastboot.isFastBoot) {
      const onWindowScroll = myDebounce(
        this,
        function () {
          if (window.scrollY !== 0) {
            this.isScrollToTopVisible = true;
          } else {
            this.isScrollToTopVisible = false;
          }
        },
        SCROLL_DEBOUNCE_TIME,
      );

      window.addEventListener('scroll', onWindowScroll);

      registerDestructor(this, () =>
        window.removeEventListener('scroll', onWindowScroll),
      );
    }
  }

  @action scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function myDebounce(context, callback, duration = 1000) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback.call(context, args);
    }, duration);
  };
}
