import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | application/info-card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders title and default sections correctly', async function (assert) {
    this.set('sections', [
      { label: 'Intro', value: 'Value 1' },
      { label: 'Fact', value: 'Value 2' },
    ]);

    await render(
      hbs`<Application::InfoCard @title="About" @sections={{this.sections}} />`,
    );

    assert.dom('[data-test-info-card-title]').hasText('About');
    assert.dom('[data-test-info-section]').exists({ count: 2 });
    assert.dom('.info-label').includesText('Intro');
    assert.dom('.info-value').includesText('Value 1');

    assert
      .dom('[data-test-info-section]:nth-child(1) .info-label')
      .hasText('Intro');
    assert
      .dom('[data-test-info-section]:nth-child(1) .info-value')
      .hasText('Value 1');
    assert
      .dom('[data-test-info-section]:nth-child(2) .info-label')
      .hasText('Fact');
    assert
      .dom('[data-test-info-section]:nth-child(2) .info-value')
      .hasText('Value 2');
  });

  test('it handles empty sections correctly', async function (assert) {
    this.set('sections', []);

    await render(
      hbs`<Application::InfoCard @title="Empty" @sections={{this.sections}} />`,
    );

    assert.dom('[data-test-info-card-title]').hasText('Empty');
    assert.dom('[data-test-info-section]').doesNotExist();
  });
});
