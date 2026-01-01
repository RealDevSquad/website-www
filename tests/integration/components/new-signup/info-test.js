import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NEW_SIGNUP_STEPS } from 'website-www/constants/new-signup';

module('Integration | Component | new-signup/info', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders info component with state get started', async function (assert) {
    assert.expect(4);
    this.setProperties({
      onClick: function () {
        this.currentStep = NEW_SIGNUP_STEPS[1];
      },
      currentStep: NEW_SIGNUP_STEPS[0],
    });
    await render(hbs`
      <NewSignup::Info
        @onClick={{this.onClick}}
        @currentStep={{this.currentStep}}
      />
    `);
    assert.dom('[data-test-landing]').exists();
    assert
      .dom('[data-test-mainHeading]')
      .hasText('Thank you for connecting your GitHub!');
    assert
      .dom('[data-test-subHeading]')
      .hasText('Please complete the signup in order to:');

    assert.dom('[data-test-get-started-btn]').hasText('Get Started');
  });

  test('it renders info component with currentStep thank-you', async function (assert) {
    assert.expect(4);
    this.setProperties({
      onClick: function () {},
      currentStep: NEW_SIGNUP_STEPS[5],
    });

    await render(hbs`
      <NewSignup::Info
        @onClick={{this.onClick}}
        @currentStep={{this.currentStep}}
      />
    `);

    assert.dom('[data-test-landing]').exists();
    assert.dom('[data-test-mainHeading]').hasText('Congratulations!');
    assert
      .dom('[data-test-subHeading]')
      .hasText("Let's get you started on your journey");
    assert.dom('[data-test-get-started-btn]').hasText("Let's Go");
  });

  test('two list items should be there if current state is get-started', async function (assert) {
    assert.expect(2);
    this.setProperties({
      onClick: function () {
        this.currentStep = NEW_SIGNUP_STEPS[1];
      },
      currentStep: NEW_SIGNUP_STEPS[0],
    });
    await render(hbs`
      <NewSignup::Info
        @onClick={{this.onClick}}
        @currentStep={{this.currentStep}}
      />
    `);

    assert.dom('[data-test-li1]').exists();
    assert.dom('[data-test-li2]').exists();
  });
});
