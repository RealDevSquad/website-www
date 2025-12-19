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

  module('whitespace handling', function (hooks) {
    hooks.beforeEach(function () {
      this.setProperties({
        currentStep: 'firstName',
        onChange: (step, value) => {
          this.inputValue = value;
        },
        onClick: () => {},
      });
    });

    test('should prevent single space when typing', async function (assert) {
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
        .hasValue('JohnDoe', 'Single space should be prevented when typing');
    });

    test('should remove multiple consecutive spaces when typing', async function (assert) {
      await render(hbs`
        <NewSignup::Input
          @currentStep={{this.currentStep}}
          @onChange={{this.onChange}}
          @onClick={{this.onClick}}
        />
      `);

      const input = this.element.querySelector('[data-test-signup-form-input]');

      await typeIn(input, 'John   Doe');

      assert
        .dom(input)
        .hasValue('JohnDoe', 'Multiple consecutive spaces should be removed');
    });

    test('should remove single space when pasting', async function (assert) {
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
        'Single space should be removed when pasting',
      );
      assert.dom(input).hasValue('JohnDoe');
    });

    test('should remove leading and trailing spaces when pasting', async function (assert) {
      await render(hbs`
        <NewSignup::Input
          @currentStep={{this.currentStep}}
          @onChange={{this.onChange}}
          @onClick={{this.onClick}}
        />
      `);

      const input = this.element.querySelector('[data-test-signup-form-input]');
      input.value = ' John Doe ';
      await triggerEvent(input, 'input');

      assert.strictEqual(
        this.inputValue,
        'JohnDoe',
        'Leading and trailing spaces should be removed',
      );
      assert.dom(input).hasValue('JohnDoe');
    });

    test('should handle input with only spaces', async function (assert) {
      await render(hbs`
        <NewSignup::Input
          @currentStep={{this.currentStep}}
          @onChange={{this.onChange}}
          @onClick={{this.onClick}}
        />
      `);

      const input = this.element.querySelector('[data-test-signup-form-input]');
      input.value = '   ';
      await triggerEvent(input, 'input');

      assert.strictEqual(
        this.inputValue,
        '',
        'Input with only spaces should result in empty string',
      );
      assert.dom(input).hasValue('');
    });

    test('should remove mixed whitespace characters when pasting', async function (assert) {
      await render(hbs`
        <NewSignup::Input
          @currentStep={{this.currentStep}}
          @onChange={{this.onChange}}
          @onClick={{this.onClick}}
        />
      `);

      const input = this.element.querySelector('[data-test-signup-form-input]');
      input.value = 'John\t\nDoe';
      await triggerEvent(input, 'input');

      assert.strictEqual(
        this.inputValue,
        'JohnDoe',
        'Tabs and newlines should be removed',
      );
      assert.dom(input).hasValue('JohnDoe');
    });

    test('should accept text without whitespace', async function (assert) {
      await render(hbs`
        <NewSignup::Input
          @currentStep={{this.currentStep}}
          @onChange={{this.onChange}}
          @onClick={{this.onClick}}
        />
      `);

      const input = this.element.querySelector('[data-test-signup-form-input]');

      await typeIn(input, 'JohnDoe');

      assert.strictEqual(
        this.inputValue,
        'JohnDoe',
        'Text without whitespace should be accepted as-is',
      );
      assert.dom(input).hasValue('JohnDoe');
    });

    test('should handle combination of typing and pasting with whitespace', async function (assert) {
      await render(hbs`
        <NewSignup::Input
          @currentStep={{this.currentStep}}
          @onChange={{this.onChange}}
          @onClick={{this.onClick}}
        />
      `);

      const input = this.element.querySelector('[data-test-signup-form-input]');

      // First type some text
      await typeIn(input, 'John ');

      // Then paste text with spaces
      input.value = input.value + ' Doe Smith';
      await triggerEvent(input, 'input');

      assert.strictEqual(
        this.inputValue,
        'JohnDoeSmith',
        'Combination of typing and pasting should remove all spaces',
      );
      assert.dom(input).hasValue('JohnDoeSmith');
    });
  });
});
