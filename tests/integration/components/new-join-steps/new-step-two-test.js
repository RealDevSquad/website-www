import { fillIn, render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import {
  NEW_FORM_STEPS,
  NEW_STEP_LIMITS,
} from 'website-www/constants/new-join-form';
import { setupRenderingTest } from 'website-www/tests/helpers';

module(
  'Integration | Component | new-join-steps/new-step-two',
  function (hooks) {
    setupRenderingTest(hooks);

    function generateWords(count) {
      return Array(count).fill('word').join(' ');
    }

    hooks.beforeEach(function () {
      localStorage.clear();
    });

    test('it renders step two correctly', async function (assert) {
      this.set('setIsPreValid', () => {});
      this.set('setIsValid', () => {});
      this.set('heading', NEW_FORM_STEPS.headings[1]);
      this.set('subHeading', NEW_FORM_STEPS.subheadings[1]);

      await render(hbs`
        <NewJoinSteps::NewStepTwo
          @setIsPreValid={{this.setIsPreValid}}
          @setIsValid={{this.setIsValid}}
          @heading={{this.heading}}
          @subHeading={{this.subHeading}}
        />
      `);

      assert.dom('[data-test-heading]').hasText(NEW_FORM_STEPS.headings[1]);
      assert
        .dom('[data-test-sub-heading]')
        .hasText(NEW_FORM_STEPS.subheadings[1]);
      assert.dom('[data-test-input-field][name="skills"]').exists();
      assert.dom('[data-test-input-field][name="company"]').exists();
      assert.dom('[data-test-textarea-field][name="introduction"]').exists();
      assert.dom('[data-test-word-count="introduction"]').exists();
    });

    test('it validates step two fields and updates word count', async function (assert) {
      this.set('setIsPreValid', () => {});
      this.set('setIsValid', () => {});
      this.set('heading', NEW_FORM_STEPS.headings[1]);
      this.set('subHeading', NEW_FORM_STEPS.subheadings[1]);

      await render(hbs`
        <NewJoinSteps::NewStepTwo
          @setIsPreValid={{this.setIsPreValid}}
          @setIsValid={{this.setIsValid}}
          @heading={{this.heading}}
          @subHeading={{this.subHeading}}
        />
      `);

      await fillIn(
        '[data-test-textarea-field][name="introduction"]',
        generateWords(120),
      );

      await waitUntil(() =>
        document
          .querySelector('[data-test-word-count="introduction"]')
          ?.textContent.includes('120/'),
      );

      assert
        .dom('[data-test-word-count="introduction"]')
        .hasText(`120/${NEW_STEP_LIMITS.stepTwo.introduction.max} words`);

      await fillIn('[data-test-input-field][name="skills"]', generateWords(3));

      await waitUntil(() =>
        document.querySelector('[data-test-error="skills"]'),
      );

      assert.dom('[data-test-error="skills"]').exists();
    });

    test('it correctly updates step two data to localStorage', async function (assert) {
      let setIsPreValidCalled = false;
      let isValidValue = null;

      this.set('setIsPreValid', () => {
        setIsPreValidCalled = true;
      });
      this.set('setIsValid', (val) => {
        isValidValue = val;
      });
      this.set('heading', NEW_FORM_STEPS.headings[1]);
      this.set('subHeading', NEW_FORM_STEPS.subheadings[1]);

      await render(hbs`
        <NewJoinSteps::NewStepTwo
          @setIsPreValid={{this.setIsPreValid}}
          @setIsValid={{this.setIsValid}}
          @heading={{this.heading}}
          @subHeading={{this.subHeading}}
        />
      `);

      await fillIn('[data-test-input-field][name="skills"]', generateWords(10));
      await fillIn('[data-test-input-field][name="company"]', 'Real Dev Squad');
      await fillIn(
        '[data-test-textarea-field][name="introduction"]',
        generateWords(120),
      );

      await waitUntil(
        () => JSON.parse(localStorage.getItem('newStepTwoData') || '{}').skills,
      );

      assert.ok(setIsPreValidCalled);
      assert.true(isValidValue);
      assert.ok(
        JSON.parse(localStorage.getItem('newStepTwoData') || '{}').skills,
      );
    });

    test('it loads step two data from localStorage', async function (assert) {
      const testData = {
        skills: generateWords(10),
        company: 'Real Dev Squad',
        introduction: generateWords(150),
      };
      localStorage.setItem('newStepTwoData', JSON.stringify(testData));

      this.set('setIsPreValid', () => {});
      this.set('setIsValid', () => {});
      this.set('heading', NEW_FORM_STEPS.headings[1]);
      this.set('subHeading', NEW_FORM_STEPS.subheadings[1]);

      await render(hbs`
        <NewJoinSteps::NewStepTwo
          @setIsPreValid={{this.setIsPreValid}}
          @setIsValid={{this.setIsValid}}
          @heading={{this.heading}}
          @subHeading={{this.subHeading}}
        />
      `);

      assert
        .dom('[data-test-input-field][name="skills"]')
        .hasValue(testData.skills);
    });
  },
);
