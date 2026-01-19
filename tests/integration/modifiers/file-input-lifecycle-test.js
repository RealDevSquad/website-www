import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, clearRender } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Modifier | file-input-lifecycle', function (hooks) {
  setupRenderingTest(hooks);

  test('it calls setup and teardown functions', async function (assert) {
    this.setSpy = sinon.spy();
    this.clearSpy = sinon.spy();

    await render(
      hbs`<div data-test-div {{file-input-lifecycle this.setSpy this.clearSpy}}></div>`,
    );

    const testElement = this.element.querySelector('[data-test-div]');

    assert.ok(
      this.setSpy.calledOnceWith(testElement),
      'The setup function is called once with the element',
    );
    assert.ok(
      this.clearSpy.notCalled,
      'The teardown function is not called on initial render',
    );

    await clearRender();

    assert.ok(
      this.clearSpy.calledOnce,
      'The teardown function is called once after the element is removed',
    );
  });
});
