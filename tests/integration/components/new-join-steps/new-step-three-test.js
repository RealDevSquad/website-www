import { fillIn, render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import {
  NEW_FORM_STEPS,
  NEW_STEP_LIMITS,
} from 'website-www/constants/new-join-form';
import { setupRenderingTest } from 'website-www/tests/helpers';

module(
  'Integration | Component | new-join-steps/new-step-three',
  function (hooks) {
    setupRenderingTest(hooks);

    function generateWords(count) {
      return Array(count).fill('word').join(' ');
    }

    hooks.beforeEach(function () {
      localStorage.removeItem('newStepThreeData');
      localStorage.removeItem('isValid');
    });

    hooks.afterEach(function () {
      localStorage.removeItem('newStepThreeData');
      localStorage.removeItem('isValid');
    });

    test('it renders step three correctly', async function (assert) {
      this.set('setIsPreValid', () => {});
      this.set('setIsValid', () => {});
      this.set('heading', NEW_FORM_STEPS.headings[2]);
      this.set('subHeading', NEW_FORM_STEPS.subheadings[2]);

      await render(hbs`
      <NewJoinSteps::NewStepThree
        @setIsPreValid={{this.setIsPreValid}}
        @setIsValid={{this.setIsValid}}
        @heading={{this.heading}}
        @subHeading={{this.subHeading}}
      />
    `);

      assert.dom('[data-test-heading]').hasText(NEW_FORM_STEPS.headings[2]);
      assert
        .dom('[data-test-sub-heading]')
        .hasText(NEW_FORM_STEPS.subheadings[2]);
      assert.dom('[data-test-textarea-field][name="hobbies"]').exists();
      assert.dom('[data-test-textarea-field][name="funFact"]').exists();
      assert.dom('[data-test-word-count="hobbies"]').exists();
      assert.dom('[data-test-word-count="funFact"]').exists();
    });

    test('it validates step three fields and updates word counts', async function (assert) {
      this.set('setIsPreValid', () => {});
      this.set('setIsValid', () => {});
      this.set('heading', NEW_FORM_STEPS.headings[2]);
      this.set('subHeading', NEW_FORM_STEPS.subheadings[2]);

      await render(hbs`
      <NewJoinSteps::NewStepThree
        @setIsPreValid={{this.setIsPreValid}}
        @setIsValid={{this.setIsValid}}
        @heading={{this.heading}}
        @subHeading={{this.subHeading}}
      />
    `);

      await fillIn(
        '[data-test-textarea-field][name="hobbies"]',
        generateWords(120),
      );

      await waitUntil(() =>
        document
          .querySelector('[data-test-word-count="hobbies"]')
          ?.textContent.includes('120/'),
      );
      assert
        .dom('[data-test-word-count="hobbies"]')
        .hasText(`120/${NEW_STEP_LIMITS.stepThree.hobbies.max} words`);

      await fillIn(
        '[data-test-textarea-field][name="funFact"]',
        generateWords(130),
      );

      await waitUntil(() =>
        document
          .querySelector('[data-test-word-count="funFact"]')
          ?.textContent.includes('130/'),
      );
      assert
        .dom('[data-test-word-count="funFact"]')
        .hasText(`130/${NEW_STEP_LIMITS.stepThree.funFact.max} words`);

      await fillIn(
        '[data-test-textarea-field][name="hobbies"]',
        generateWords(50),
      );

      await waitUntil(() =>
        document.querySelector('[data-test-error="hobbies"]'),
      );
      assert.dom('[data-test-error="hobbies"]').exists();
    });

    test('it saves step three data to localStorage and calls callbacks', async function (assert) {
      let setIsPreValidCalled = false;
      let isValidValue = null;

      this.set('setIsPreValid', () => {
        setIsPreValidCalled = true;
      });
      this.set('setIsValid', (val) => {
        isValidValue = val;
      });
      this.set('heading', NEW_FORM_STEPS.headings[2]);
      this.set('subHeading', NEW_FORM_STEPS.subheadings[2]);

      await render(hbs`
      <NewJoinSteps::NewStepThree
        @setIsPreValid={{this.setIsPreValid}}
        @setIsValid={{this.setIsValid}}
        @heading={{this.heading}}
        @subHeading={{this.subHeading}}
      />
    `);

      await fillIn(
        '[data-test-textarea-field][name="hobbies"]',
        generateWords(120),
      );
      await fillIn(
        '[data-test-textarea-field][name="funFact"]',
        generateWords(130),
      );

      await waitUntil(
        () =>
          JSON.parse(localStorage.getItem('newStepThreeData') || '{}').hobbies,
      );

      assert.ok(setIsPreValidCalled);
      assert.true(isValidValue);
      assert
        .dom('[data-test-textarea-field][name="hobbies"]')
        .hasValue(generateWords(120));
      assert
        .dom('[data-test-textarea-field][name="funFact"]')
        .hasValue(generateWords(130));
    });

    test('it loads step three data from localStorage', async function (assert) {
      const testData = {
        hobbies: generateWords(200),
        funFact: generateWords(300),
      };
      localStorage.setItem('newStepThreeData', JSON.stringify(testData));

      this.set('setIsPreValid', () => {});
      this.set('setIsValid', () => {});
      this.set('heading', NEW_FORM_STEPS.headings[2]);
      this.set('subHeading', NEW_FORM_STEPS.subheadings[2]);

      await render(hbs`
      <NewJoinSteps::NewStepThree
        @setIsPreValid={{this.setIsPreValid}}
        @setIsValid={{this.setIsValid}}
        @heading={{this.heading}}
        @subHeading={{this.subHeading}}
      />
    `);

      assert
        .dom('[data-test-textarea-field][name="hobbies"]')
        .hasValue(testData.hobbies);
      assert
        .dom('[data-test-textarea-field][name="funFact"]')
        .hasValue(testData.funFact);
    });
  },
);
