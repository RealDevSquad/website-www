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
    assert.dom('[data-test-info-item]').doesNotExist();
    assert.dom('[data-test-info-block]').exists({ count: 2 });
    assert.dom('.info-label').includesText('Intro');
    assert.dom('.info-value').includesText('Value 1');
  });

  test('it renders grid sections correctly', async function (assert) {
    this.set('sections', [
      {
        type: 'grid',
        items: [
          { label: 'Item 1', value: 'Value 1' },
          { label: 'Item 2', value: 'Value 2' },
        ],
      },
    ]);

    await render(
      hbs`<Application::InfoCard @title="Grid Info" @sections={{this.sections}} />`,
    );

    assert.dom('[data-test-info-section]').exists();
    assert.dom('[data-test-info-item]').exists({ count: 2 });
    assert.dom('.info-label').includesText('Item 1');
    assert.dom('.info-value').includesText('Value 1');
  });
});
