import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { APPS } from '../../constants/urls';

module('Integration | Component | header', function (hooks) {
  setupRenderingTest(hooks);

  test('header elements renders', async function (assert) {
    assert.expect(15);

    this.setProperties({
      isLoggedIn: false,
      isLoading: false,
      dev: false,
    });

    this.set('signOut', () => {
      this.isLoggedIn = false;
    });

    await render(hbs`
      <Header
        @isLoggedIn={{this.isLoggedIn}}
        @isLoading={{this.isLoading}}
        @signOut={{this.signOut}}
        @dev={{this.dev}}
      />
    `);

    assert.dom('[data-test-home-link]').exists();
    assert.dom('[data-test-home-img]').exists();

    assert.dom('[data-test-home]').hasText('Home');
    assert.dom('[data-test-home]').hasAttribute('href', '/');
    assert.dom('[data-test-welcome]').hasText('Welcome');
    assert.dom('[data-test-welcome]').hasAttribute('href', APPS.WELCOME);
    /*
      TODO: Events section is to be migrated, will use it once its done,
      track it here https://github.com/Real-Dev-Squad/website-www/issues/787
    */
    // assert.dom('[data-test-events]').hasText('Events');
    // assert.dom('[data-test-events]').hasAttribute('href', APPS.EVENTS);
    assert.dom('[data-test-members]').hasText('Members');
    assert.dom('[data-test-members]').hasAttribute('href', APPS.MEMBERS);
    assert.dom('[data-test-status]').hasText('Status');
    assert.dom('[data-test-status]').hasAttribute('href', APPS.STATUS);

    assert.dom('[data-test-loading]').doesNotExist();
    assert.dom('[data-test-login]').hasText('Sign In with GitHub');
    /**
     * @todo - fix this test failing issue
     */
    // assert.dom('[data-test-login]').hasAttribute('href', AUTH.SIGN_IN);
    assert.dom('[data-test-login-img]').exists();

    this.set('dev', true);
    assert.dom('[data-test-login]').hasAttribute('href', '/login?dev=true');
    assert.dom('[data-test-login]').hasText('Sign In');
  });

  test('toggle nav menu in mobile view', async function (assert) {
    assert.expect(5);

    this.set('signOut', () => {
      this.isLoggedIn = false;
    });

    await render(hbs`
      <Header
        @isLoggedIn={{this.isLoggedIn}}
        @signOut={{this.signOut}}
      />
    `);

    assert.dom('[data-test-toggle-button]').exists();
    assert.dom('[data-test-nav-menu]').exists();

    assert.dom('[data-test-nav-menu]').doesNotHaveClass('active');

    await click('[data-test-toggle-button]');
    assert.dom('[data-test-nav-menu]').hasClass('active');

    await click('[data-test-toggle-button]');
    assert.dom('[data-test-nav-menu]').doesNotHaveClass('active');
  });

  test('header renders when user logged in', async function (assert) {
    assert.expect(5);

    this.setProperties({
      firstName: 'John',
      profilePicture: 'https://avatars.githubusercontent.com/u/12345678?v=4',
      isLoggedIn: true,
      isLoading: false,
    });

    this.set('signOut', () => {
      this.isLoggedIn = false;
    });

    await render(hbs`
      <Header
        @firstName={{this.firstName}}
        @profilePicture={{this.profilePicture}}
        @isLoggedIn={{this.isLoggedIn}}
        @isLoading={{this.isLoading}}
        @signOut={{this.signOut}}
      />
    `);

    assert.dom('[data-test-loading]').doesNotExist();
    assert.dom('[data-test-login]').doesNotExist();
    assert.dom('[data-test-user-name]').hasText('Hello, John');
    assert
      .dom('[data-test-user-image]')
      .hasAttribute(
        'src',
        'https://avatars.githubusercontent.com/u/12345678?v=4',
      );
    assert.dom('[data-test-icon]').exists();
  });

  test('toggle dropdown menu', async function (assert) {
    assert.expect(4);

    this.setProperties({
      firstName: 'John',
      profilePicture: 'https://avatars.githubusercontent.com/u/12345678?v=4',
      isLoggedIn: true,
    });

    this.set('signOut', () => {
      this.isLoggedIn = false;
    });

    await render(hbs`
      <Header
        @firstName={{this.firstName}}
        @profilePicture={{this.profilePicture}}
        @isLoggedIn={{this.isLoggedIn}}
        @signOut={{this.signOut}}
      />
    `);

    assert.dom('[data-test-dropdown]').doesNotHaveClass('active-menu');

    await click('[data-test-dropdown-toggle]');
    assert.dom('[data-test-dropdown]').hasClass('menu');
    assert.dom('[data-test-signout]').hasText('Sign Out');

    await click('[data-test-dropdown-toggle]');
    assert.dom('[data-test-dropdown]').doesNotHaveClass('active-menu');
  });

  test('toggle dropdown menu under feature flag', async function (assert) {
    assert.expect(14);

    this.setProperties({
      firstName: 'John',
      profilePicture: 'https://avatars.githubusercontent.com/u/12345678?v=4',
      isLoggedIn: true,
    });

    this.set('signOut', () => {
      this.isLoggedIn = false;
    });

    await render(hbs`
      <Header
        @firstName={{this.firstName}}
        @profilePicture={{this.profilePicture}}
        @isLoggedIn={{this.isLoggedIn}}
        @signOut={{this.signOut}}
        @dev={{true}}
      />
    `);

    assert.dom('[data-test-dropdown]').doesNotHaveClass('active-menu');

    await click('[data-test-dropdown-toggle]');
    assert.dom('[data-test-dropdown]').hasClass('menu');
    assert.dom('[data-test-dropdown-home]').hasText('Home');
    assert.dom('[data-test-dropdown-home]').hasAttribute('href', '/');
    assert.dom('[data-test-dropdown-status]').hasText('Status');
    assert
      .dom('[data-test-dropdown-status]')
      .hasAttribute('href', '/status?dev=true');
    assert.dom('[data-test-dropdown-profile]').hasText('Profile');
    assert
      .dom('[data-test-dropdown-profile]')
      .hasAttribute('href', '/profile?dev=true');
    assert.dom('[data-test-dropdown-tasks]').hasText('Tasks');
    assert.dom('[data-test-dropdown-tasks]').hasAttribute('href', APPS.TASKS);
    assert.dom('[data-test-dropdown-identity]').hasText('Identity');
    assert
      .dom('[data-test-dropdown-identity]')
      .hasAttribute('href', APPS.IDENTITY);
    assert.dom('[data-test-signout]').hasText('Sign Out');

    await click('[data-test-dropdown-toggle]');
    assert.dom('[data-test-dropdown]').doesNotHaveClass('active-menu');
  });

  test('loading state renders', async function (assert) {
    assert.expect(3);

    this.setProperties({ isLoading: true });

    this.set('signOut', () => {
      this.isLoggedIn = false;
    });

    await render(hbs`
      <Header
        @isLoading={{this.isLoading}}
        @signOut={{this.signOut}}
      />
    `);

    assert.dom('[data-test-loading]').exists();
    assert.dom('[data-test-dropdown-toggle]').doesNotExist();
    assert.dom('[data-test-login]').doesNotExist();
  });

  test('applications link is visible for super user under dev flag', async function (assert) {
    this.owner.register(
      'service:login',
      {
        userData: { roles: { super_user: true } },
      },
      { instantiate: false },
    );

    this.setProperties({
      firstName: 'John',
      isLoggedIn: true,
      isLoading: false,
      dev: true,
    });

    this.set('signOut', () => {
      this.isLoggedIn = false;
    });

    await render(hbs`
      <Header
        @firstName={{this.firstName}}
        @isLoggedIn={{this.isLoggedIn}}
        @isLoading={{this.isLoading}}
        @signOut={{this.signOut}}
        @dev={{this.dev}}
      />
    `);

    assert.dom('[data-test-applications]').exists();
    assert
      .dom('[data-test-applications]')
      .hasAttribute('href', '/applications?dev=true');
  });

  test('applications link is not visible for normal user under dev flag', async function (assert) {
    this.setProperties({
      firstName: 'John',
      isLoggedIn: true,
      isLoading: false,
      dev: true,
    });

    this.set('signOut', () => {
      this.isLoggedIn = false;
    });

    await render(hbs`
      <Header
        @firstName={{this.firstName}}
        @isLoggedIn={{this.isLoggedIn}}
        @isLoading={{this.isLoading}}
        @signOut={{this.signOut}}
        @dev={{this.dev}}
      />
    `);

    assert.dom('[data-test-applications]').doesNotExist();
  });
});
