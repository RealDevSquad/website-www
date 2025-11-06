import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  fillIn,
  click,
  triggerEvent,
  settled,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import sinon from 'sinon';
import * as RunLoop from '@ember/runloop';

module(
  'Integration | Component | new-join-steps/new-step-one',
  function (hooks) {
    setupRenderingTest(hooks);

    let clock;

    hooks.beforeEach(function () {
      clock = sinon.useFakeTimers();
      localStorage.clear();
      this.debounceStub = sinon
        .stub(RunLoop, 'debounce')
        .callsFake((ctx, fn, ...args) => {
          fn.apply(ctx, args);
        });

      class StubLoginService extends Service {
        userData = { first_name: 'Ada', last_name: 'Lovelace' };
      }
      this.owner.register('service:login', StubLoginService);
    });

    hooks.afterEach(function () {
      clock.restore();
      localStorage.clear();
      this.debounceStub.restore();
    });

    test('it renders fields, pre-fills full name, and disables the name input', async function (assert) {
      assert.expect(5);

      this.setProperties({
        setIsValid: sinon.spy(),
        setIsPreValid: sinon.spy(),
      });

      await render(hbs`
      <NewJoinSteps::NewStepOne
        @setIsValid={{this.setIsValid}}
        @setIsPreValid={{this.setIsPreValid}}
      />
    `);

      const nameInput = document.querySelector('input[name="fullName"]');
      assert.ok(nameInput, 'full name input exists');
      assert.strictEqual(
        nameInput?.value,
        'Ada Lovelace',
        'full name is prefilled',
      );
      assert.ok(nameInput?.disabled, 'full name input is disabled');

      assert.ok(
        document.querySelector('[name="country"]'),
        'country dropdown exists',
      );
      assert.ok(
        document.querySelector('input[name="state"]'),
        'state input exists',
      );
      assert.ok(
        document.querySelector('input[name="city"]'),
        'city input exists',
      );
    });

    test('it updates role selection, debounced inputs, and syncs localStorage/validity', async function (assert) {
      assert.expect(8);

      const setIsValid = sinon.spy();
      const setIsPreValid = sinon.spy();

      this.setProperties({ setIsValid, setIsPreValid });

      await render(hbs`
      <NewJoinSteps::NewStepOne
        @setIsValid={{this.setIsValid}}
        @setIsPreValid={{this.setIsPreValid}}
      />
    `);

      const roleButtons = Array.from(
        document.querySelectorAll('[data-test-role-button]'),
      );
      assert.ok(roleButtons.length > 0, 'role buttons rendered');
      await click(roleButtons[0]);

      assert.ok(
        roleButtons[0].classList.contains('role-button--selected'),
        'clicked role button is selected',
      );

      await fillIn('input[name="state"]', 'Karnataka');
      await fillIn('input[name="city"]', 'Bengaluru');

      const countryEl = document.querySelector('[name="country"]');
      countryEl.value = 'India';
      await triggerEvent(countryEl, 'change');

      assert.ok(
        setIsPreValid.calledWith(false),
        'pre-valid set to false on input',
      );

      await settled();

      const raw = localStorage.getItem('newStepOneData');
      assert.ok(raw, 'newStepOneData saved in localStorage');
      const parsed = JSON.parse(raw);
      assert.strictEqual(parsed.state, 'Karnataka', 'state persisted');
      assert.strictEqual(parsed.city, 'Bengaluru', 'city persisted');
      assert.strictEqual(parsed.country, 'India', 'country persisted');

      assert.ok(setIsValid.called, 'validity evaluated and communicated');
    });
  },
);
