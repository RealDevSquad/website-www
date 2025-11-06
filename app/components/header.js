import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { APPS, AUTH } from '../constants/urls';
import { inject as service } from '@ember/service';

export default class HeaderComponent extends Component {
  @service router;
  @service fastboot;
  @service login;
  @tracked isNavOpen = false;
  @tracked isMenuOpen = false;
  @tracked authURL = this.generateAuthURL();

  HOME_PAGE = 'index';
  EVENTS_PAGE = '/events';
  WELCOME_URL = APPS.WELCOME;
  EVENTS_URL = APPS.EVENTS;
  MEMBERS_URL = APPS.MEMBERS;
  STATUS_URL = APPS.STATUS;
  PROFILE_URL = APPS.PROFILE;
  AUTH_URL = this.generateAuthURL();
  LIVE_URL = APPS.LIVE;
  TASKS_URL = APPS.TASKS;
  IDENTITY_URL = APPS.IDENTITY;
  MY_STATUS_URL = APPS.MY_STATUS;

  get isSuperUser() {
    return this.login?.userData?.roles?.super_user;
  }

  @action toggleNavbar() {
    this.isNavOpen = !this.isNavOpen;
  }

  @action toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @action outsideClickMenu() {
    this.isMenuOpen = false;
  }

  generateAuthURL() {
    const currentURL = this.fastboot.isFastBoot
      ? this.fastboot.request.protocol +
        '//' +
        this.fastboot.request.host +
        this.fastboot.request.path
      : window.location.href;
    return `${AUTH.GITHUB_SIGN_IN}?redirectURL=${currentURL}`;
  }
}
