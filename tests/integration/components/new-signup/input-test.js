import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, triggerEvent, typeIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NEW_SIGNUP_STEPS } from 'website-www/constants/new-signup';

module('Integration | Component | new-signup/input', function (hooks) {
  setupRenderingTest(hooks);

  test('it has a first name label when current step is firstStep', async function (assert) {
    assert.expect(2);

    this.setProperties({
      onClick: function () {
        this.currentStep = NEW_SIGNUP_STEPS[2];
      },
      currentStep: 'firstName',
    });

    await render(hbs`
      <NewSignup::Input
        @onClick={{this.onClick}} 
        @currentStep={{this.currentStep}}
      />`);

    assert.dom('[data-test-signup-form-input]').exists();
    assert
      .dom('[data-test-signup-form-label]')
      .hasText('What is your first name?');
  });

  test('it has a lastname label when current step is lastName', async function (assert) {
    assert.expect(2);

    this.setProperties({
      onClick: function () {
        this.currentStep = NEW_SIGNUP_STEPS[3];
      },
      currentStep: 'lastName',
    });

    await render(hbs`
      <NewSignup::Input
        @onClick={{this.onClick}} 
        @currentStep={{this.currentStep}}
      />`);

    assert
      .dom('[data-test-signup-form-label]')
      .hasText('And what is your last name?');
    assert.dom('[data-test-signup-form-input]').exists();
  });

  test('it has a username label when current step is username', async function (assert) {
    assert.expect(2);

    this.setProperties({
      onClick: function () {
        this.currentStep = NEW_SIGNUP_STEPS[4];
      },
      currentStep: 'username',
      isDevMode: true,
    });

    await render(hbs`
      <NewSignup::Input
        @onClick={{this.onClick}} 
        @currentStep={{this.currentStep}}
      />`);

    assert
      .dom('[data-test-signup-form-label]')
      .hasText('Now choose your awesome username!');
    assert.dom('[data-test-signup-form-input]').exists();
  });

  test('button should have text Submit if the current step is lastName', async function (assert) {
    assert.expect(2);
    this.setProperties({
      onClick: function () {
        this.currentStep = NEW_SIGNUP_STEPS[5];
      },
      currentStep: 'lastName',
    });

    await render(hbs`
      <NewSignup::Input
        @onClick={{this.onClick}} 
        @currentStep={{this.currentStep}}
      />`);

    assert.dom('[data-test-button="signup"]').exists();
    assert.dom('[data-test-button="signup"]').hasText('Submit');
  });

  test('button should have text Next if the current step is lastName and dev is true', async function (assert) {
    assert.expect(2);
    this.setProperties({
      onClick: function () {
        this.currentStep = NEW_SIGNUP_STEPS[5];
      },
      currentStep: 'lastName',
      isDevMode: true,
    });

    await render(hbs`
      <NewSignup::Input
        @onClick={{this.onClick}} 
        @currentStep={{this.currentStep}}
        @dev={{this.isDevMode}}
      />`);

    assert.dom('[data-test-button="signup"]').exists();
    assert.dom('[data-test-button="signup"]').hasText('Next');
  });

  test('disables button when input is not provided', async function (assert) {
    this.setProperties({
      currentStep: NEW_SIGNUP_STEPS[1],
      isButtonDisabled: true,
      isLoading: false,
      onChange: () => {},
      onClick: () => {},
    });

    await render(hbs`
      <NewSignup::Input 
        @currentStep={{this.currentStep}} 
        @isButtonDisabled={{this.isButtonDisabled}} 
        @isLoading={{this.isLoading}} 
        @onChange={{this.onChange}} 
        @onClick={{this.onClick}} 
        @error={{this.error}} 
      />
    `);

    assert.dom('[data-test-button="signup"]').isDisabled();
  });

  test('input field should remove spaces if user pastes text', async function (assert) {
    assert.expect(1);

    this.setProperties({
      currentStep: 'firstName',
      onChange: (step, value) => {
        this.inputValue = value;
      },
      onClick: () => {},
    });

    await render(hbs`
      <NewSignup::Input
        @currentStep={{this.currentStep}}
        @onChange={{this.onChange}}
        @onClick={{this.onClick}}
      />
    `);

    const input = this.element.querySelector('[data-test-signup-form-input]');
    input.value = 'John Doe';
    await triggerEvent(input, 'input');

    assert.strictEqual(
      this.inputValue,
      'JohnDoe',
      'Spaces should be removed from input',
    );
  });

  test('input field should not accept spaces', async function (assert) {
    assert.expect(1);

    this.setProperties({
      currentStep: 'firstName',
      onChange: (step, value) => {
        this.inputValue = value;
      },
      onClick: () => {},
    });

    await render(hbs`
      <NewSignup::Input
        @currentStep={{this.currentStep}}
        @onChange={{this.onChange}}
        @onClick={{this.onClick}}
      />
    `);

    const input = this.element.querySelector('[data-test-signup-form-input]');

    await typeIn(input, 'John Doe');

    assert
      .dom(input)
      .hasValue('JohnDoe', 'Keydown prevention blocked the space');
  });
});
