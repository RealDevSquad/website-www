import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { GET_STARTED_MAIN_HEADING } from 'website-www/constants/new-signup';

class LoginStub extends Service {
  @tracked isLoggedIn = false;

  loginWithGithub() {
    this.isLoggedIn = true;
  }
}

module('Integration | Component | signup-steps/step-zero', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:login', LoginStub);
  });

  test('it renders correctly when the user is logged in', async function (assert) {
    assert.expect(4);
    this.loginService = this.owner.lookup('service:login');
    this.loginService.loginWithGithub();

    this.set('startHandler', () => {});

    await render(
      hbs`<SignupSteps::StepZero @startHandler={{this.startHandler}} />`,
    );
    assert.dom('[data-test-signup-heading]').hasText(GET_STARTED_MAIN_HEADING);
    assert
      .dom('[data-test-signup-paragraph]')
      .hasText(
        'Please continue with Sign Up with in order to use features display yourself on members page etc',
      );
    assert.dom('[data-test-rds-logo-img]').exists();
    assert.dom('[data-test-button=lets-go]').hasText("Let's Go");
  });

  test('it renders correctly when the user is not logged in', async function (assert) {
    assert.expect(4);
    this.set('startHandler', () => {});

    await render(
      hbs`<SignupSteps::StepZero @startHandler={{this.startHandler}} />`,
    );

    assert.dom('[data-test-rds-logo]').exists();
    assert.dom('[data-test-signup-heading]').hasText('Welcome to RDS');
    assert
      .dom('[ data-test-signup-paragraph]')
      .hasText(
        'To start your journey, please sign in with your GitHub account.',
      );
    assert.dom('[data-test-button=signIn]').hasText('SignIn');
  });
});
