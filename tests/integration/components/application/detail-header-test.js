import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { APPLICATIONS_DATA } from 'website-www/tests/constants/application-data';

module('Integration | Component | application/detail-header', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders application details correctly', async function (assert) {
    this.set('application', APPLICATIONS_DATA);
    this.set('isAdmin', false);

    await render(hbs`
      <Application::DetailHeader
        @application={{this.application}}
        @isAdmin={{this.isAdmin}}
      />
    `);

    assert.dom('[data-test-user-name]').includesText('John Doe');
    assert.dom('[data-test-status-badge]').hasText('ACCEPTED');
    assert.dom('[data-test-score-value]').hasText('250');
    assert.dom('[data-test-social-link]').exists({ count: 7 });

    assert.dom('[data-test-button="nudge-button"]').exists();
    assert.dom('[data-test-button="edit-button"]').exists();
    assert.dom('[data-test-button="navigate-button"]').doesNotExist();
  });

  test('it renders admin actions correctly', async function (assert) {
    this.set('application', APPLICATIONS_DATA);
    this.set('isAdmin', true);

    await render(hbs`
      <Application::DetailHeader
        @application={{this.application}}
        @isAdmin={{this.isAdmin}}
      />
    `);

    assert.dom('[data-test-button="navigate-button"]').exists();
    assert.dom('[data-test-button="nudge-button"]').doesNotExist();
    assert.dom('[data-test-button="edit-button"]').doesNotExist();
  });

  test('it handles partial location data correctly', async function (assert) {
    this.set('application', {
      location: { city: 'Mumbai', country: 'India' },
    });
    await render(
      hbs`<Application::DetailHeader @application={{this.application}} />`,
    );
    assert.dom('[data-test-header-profile]').includesText('Mumbai, India');
  });

  test('it disables nudge button when status is not pending', async function (assert) {
    const app = { ...APPLICATIONS_DATA, status: 'accepted' };
    this.set('application', app);
    this.set('isAdmin', false);

    await render(hbs`
      <Application::DetailHeader
        @application={{this.application}}
        @isAdmin={{this.isAdmin}}
      />
    `);

    assert.dom('[data-test-button="nudge-button"]').hasAttribute('disabled');
  });

  test('it disables nudge button based on 24h timeout', async function (assert) {
    const now = Date.now();
    const recentNudge = new Date(now - 12 * 60 * 60 * 1000).toISOString();

    this.set('application', {
      status: 'pending',
      lastNudgedAt: recentNudge,
    });

    await render(
      hbs`<Application::DetailHeader @application={{this.application}} />`,
    );
    assert.dom('[data-test-button="nudge-button"]').hasAttribute('disabled');
  });
});
