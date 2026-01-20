import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | application/social-link-pill',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders the platform and links correctly', async function (assert) {
      this.set('platform', 'GitHub');
      this.set('userName', 'testuser');

      await render(
        hbs`<Application::SocialLinkPill @platform={{this.platform}} @userName={{this.userName}} />`,
      );

      assert
        .dom('[data-test-social-link]')
        .hasAttribute('href', 'https://github.com/testuser');
      assert.dom('[data-test-social-link]').includesText('GitHub');
      assert.dom('[data-test-platform="GitHub"]').exists();
    });

    test('it renders LinkedIn and other platforms correctly', async function (assert) {
      this.set('platform', 'LinkedIn');
      this.set('userName', 'testuser');

      await render(
        hbs`<Application::SocialLinkPill @platform={{this.platform}} @userName={{this.userName}} />`,
      );

      assert
        .dom('[data-test-social-link]')
        .hasAttribute('href', 'https://linkedin.com/in/testuser');
      assert.dom('[data-test-social-link]').includesText('LinkedIn');
    });

    test('it handles unknown platforms with fallback icon', async function (assert) {
      this.set('platform', 'unknown');
      this.set('userName', 'user');

      await render(
        hbs`<Application::SocialLinkPill @platform={{this.platform}} @userName={{this.userName}} />`,
      );
      assert.dom('[data-test-social-link]').exists();
      assert.dom('[data-test-social-link]').includesText('unknown');
    });
  },
);
