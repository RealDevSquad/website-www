import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { mockFormData } from 'website-www/tests/constants/new-join-form-data';

module('Integration | Component | thank-you-screen', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders thank you screen', async function (assert) {
    this.set('firstName', mockFormData.firstName);
    this.set('applicationId', mockFormData.applicationId);

    await render(
      hbs`<NewJoinSteps::ThankYouScreen
        @firstName={{this.firstName}}
        @applicationId={{this.applicationId}}
      />`,
    );

    assert
      .dom('[data-test="thank-you-screen"]')
      .exists('Thank you screen is rendered');
  });

  test('it displays firstName in heading', async function (assert) {
    this.set('firstName', mockFormData.firstName);
    this.set('applicationId', mockFormData.applicationId);

    await render(
      hbs`<NewJoinSteps::ThankYouScreen
        @firstName={{this.firstName}}
        @applicationId={{this.applicationId}}
      />`,
    );

    assert
      .dom('[data-test="thank-you-heading"]')
      .hasText(
        `${mockFormData.firstName}, thank you for applying to RDS.`,
        'First name is displayed in heading',
      );
  });

  test('it displays application ID', async function (assert) {
    this.set('firstName', mockFormData.firstName);
    this.set('applicationId', mockFormData.applicationId);

    await render(
      hbs`<NewJoinSteps::ThankYouScreen
        @firstName={{this.firstName}}
        @applicationId={{this.applicationId}}
      />`,
    );

    assert
      .dom('[data-test="application-id"]')
      .exists('Application ID section exists');
  });

  test('it renders track application button', async function (assert) {
    this.set('firstName', mockFormData.firstName);
    this.set('applicationId', mockFormData.applicationId);

    await render(
      hbs`<NewJoinSteps::ThankYouScreen
        @firstName={{this.firstName}}
        @applicationId={{this.applicationId}}
      />`,
    );

    // TODO: Add test for track application navigation
    assert
      .dom('[data-test-button="track-application"]')
      .exists('Track application button exists');
  });
});
