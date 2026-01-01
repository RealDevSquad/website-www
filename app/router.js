import EmberRouter from '@ember/routing/router';
import config from 'website-www/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('index', { path: '/' });
  this.route('join');
  this.route('live');
  this.route('page-not-found', { path: '/*' });
  this.route('intro');
  this.route('goto');
  this.route('events');
  this.route('debug');
  this.route('subscribe');
  this.route('login');
  this.route('identity');
  this.route('status');
  this.route('discord');
  this.route('profile');
  this.route('notifications');
  this.route('mobile');
  this.route('new-signup');
  this.route('applications', function () {
    this.route('detail', { path: '/:id' });
  });
});
