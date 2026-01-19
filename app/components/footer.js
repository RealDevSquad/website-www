import Component from '@glimmer/component';
import { ABOUT, APPS } from '../constants/urls';
import { APPS_PROPERTIES, ABOUT_PROPERTIES } from '../constants/footer-data';
import { SOCIAL_LINK_PROPERTIES } from '../constants/social-data';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class FooterComponent extends Component {
  @service router;

  REPOSITORY_URL = ABOUT.REPOSITORY;
  APPS_PROPERTIES = APPS_PROPERTIES;
  ABOUT_PROPERTIES = ABOUT_PROPERTIES;
  SOCIAL_LINK_PROPERTIES = SOCIAL_LINK_PROPERTIES;
  MEMBERS_URL = APPS.MEMBERS;
  FAQ_URL = ABOUT.FAQ;

  @tracked isHome = this.router.currentRoute.name === 'index';
}
