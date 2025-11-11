import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import {
  NEW_FORM_STEPS,
  STEP_DATA_STORAGE_KEY,
} from 'website-www/constants/new-join-form';
import {
  designerStepData,
  developerStepData,
} from 'website-www/tests/constants/new-join-form-data';
import { setupRenderingTest } from 'website-www/tests/helpers';

module('Integration | Component | new-step-six', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    Object.keys(developerStepData).forEach((stepKey) => {
      window.localStorage.setItem(
        STEP_DATA_STORAGE_KEY[stepKey],
        JSON.stringify(developerStepData[stepKey]),
      );
    });
  });

  hooks.afterEach(function () {
    window.localStorage.clear();
  });

  test('it renders heading and subheading', async function (assert) {
    this.set('navigateToStep', () => {});
    this.set('onSubmit', () => {});
    this.set('heading', NEW_FORM_STEPS.headings[5]);
    this.set('subHeading', NEW_FORM_STEPS.subheadings[5]);

    await render(
      hbs`<NewJoinSteps::NewStepSix
        @heading={{this.heading}}
        @subHeading={{this.subHeading}}
        @navigateToStep={{this.navigateToStep}}
        @onSubmit={{this.onSubmit}}
      />`,
    );

    assert
      .dom('[data-test="review-heading"]')
      .hasText(NEW_FORM_STEPS.headings[5], 'Heading is displayed');
    assert
      .dom('[data-test="review-subheading"]')
      .hasText(NEW_FORM_STEPS.subheadings[5], 'Subheading is displayed');
  });

  test('it renders all review sections', async function (assert) {
    this.set('navigateToStep', () => {});
    this.set('onSubmit', () => {});
    this.set('heading', NEW_FORM_STEPS.headings[5]);
    this.set('subHeading', NEW_FORM_STEPS.subheadings[5]);

    await render(
      hbs`<NewJoinSteps::NewStepSix
        @heading={{this.heading}}
        @subHeading={{this.subHeading}}
        @navigateToStep={{this.navigateToStep}}
        @onSubmit={{this.onSubmit}}
      />`,
    );

    assert
      .dom('[data-test="review-step"]')
      .exists('Review step container exists');
    assert
      .dom('[data-test="review-section-personal"]')
      .exists('Personal Information section exists');
    assert
      .dom('[data-test="review-section-professional"]')
      .exists('Professional Details section exists');
    assert
      .dom('[data-test="review-section-hobbies"]')
      .exists('Hobbies & Interests section exists');
    assert
      .dom('[data-test="review-section-social"]')
      .exists('Social Profiles section exists');
    assert
      .dom('[data-test="review-section-why-rds"]')
      .exists('Why Real Dev Squad section exists');
  });

  test('it displays data from localStorage correctly', async function (assert) {
    this.set('navigateToStep', () => {});
    this.set('onSubmit', () => {});
    this.set('heading', NEW_FORM_STEPS.headings[5]);
    this.set('subHeading', NEW_FORM_STEPS.subheadings[5]);

    await render(
      hbs`<NewJoinSteps::NewStepSix
        @heading={{this.heading}}
        @subHeading={{this.subHeading}}
        @navigateToStep={{this.navigateToStep}}
        @onSubmit={{this.onSubmit}}
      />`,
    );

    assert
      .dom(this.element)
      .includesText(
        developerStepData.stepOne.fullName,
        'Full name is displayed',
      );
    assert
      .dom(this.element)
      .includesText(
        `${developerStepData.stepOne.city}, ${developerStepData.stepOne.state}, ${developerStepData.stepOne.country}`,
        'Location is displayed',
      );
    assert
      .dom(this.element)
      .includesText(developerStepData.stepOne.role, 'Role is displayed');
    assert
      .dom(this.element)
      .includesText(developerStepData.stepTwo.skills, 'Skills are displayed');
    assert
      .dom(this.element)
      .includesText(developerStepData.stepTwo.company, 'Company is displayed');
  });

  test('edit buttons call navigateToStep with correct step numbers', async function (assert) {
    assert.expect(1);

    const calledSteps = [];
    const navigateToStep = (stepNumber) => {
      calledSteps.push(stepNumber);
    };

    this.set('navigateToStep', navigateToStep);
    this.set('onSubmit', () => {});
    this.set('heading', NEW_FORM_STEPS.headings[5]);
    this.set('subHeading', NEW_FORM_STEPS.subheadings[5]);

    await render(
      hbs`<NewJoinSteps::NewStepSix
        @heading={{this.heading}}
        @subHeading={{this.subHeading}}
        @navigateToStep={{this.navigateToStep}}
        @onSubmit={{this.onSubmit}}
      />`,
    );

    await click('[data-test-button="edit-step-1"]');
    await click('[data-test-button="edit-step-2"]');
    await click('[data-test-button="edit-step-3"]');
    await click('[data-test-button="edit-step-4"]');
    await click('[data-test-button="edit-step-5"]');

    assert.deepEqual(
      calledSteps,
      [1, 2, 3, 4, 5],
      'navigateToStep called with correct step numbers',
    );
  });

  test('it shows GitHub field for Developer role', async function (assert) {
    this.set('navigateToStep', () => {});
    this.set('onSubmit', () => {});
    this.set('heading', NEW_FORM_STEPS.headings[5]);
    this.set('subHeading', NEW_FORM_STEPS.subheadings[5]);

    await render(
      hbs`<NewJoinSteps::NewStepSix
        @heading={{this.heading}}
        @subHeading={{this.subHeading}}
        @navigateToStep={{this.navigateToStep}}
        @onSubmit={{this.onSubmit}}
      />`,
    );

    assert
      .dom('[data-test="review-section-social"]')
      .includesText('GitHub', 'GitHub field is shown for Developer');
  });

  test('it shows Behance and Dribble fields for Designer role', async function (assert) {
    Object.keys(designerStepData).forEach((stepKey) => {
      window.localStorage.setItem(
        STEP_DATA_STORAGE_KEY[stepKey],
        JSON.stringify(designerStepData[stepKey]),
      );
    });

    this.set('navigateToStep', () => {});
    this.set('onSubmit', () => {});
    this.set('heading', NEW_FORM_STEPS.headings[5]);
    this.set('subHeading', NEW_FORM_STEPS.subheadings[5]);

    await render(
      hbs`<NewJoinSteps::NewStepSix
        @heading={{this.heading}}
        @subHeading={{this.subHeading}}
        @navigateToStep={{this.navigateToStep}}
        @onSubmit={{this.onSubmit}}
      />`,
    );

    assert
      .dom('[data-test="review-section-social"]')
      .includesText('Behance', 'Behance field is shown for Designer');
    assert
      .dom('[data-test="review-section-social"]')
      .includesText('Dribble', 'Dribble field is shown for Designer');
  });
});
