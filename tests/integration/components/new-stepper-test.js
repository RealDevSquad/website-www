import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Service from '@ember/service';
import { STEP_DATA_STORAGE_KEY } from 'website-www/constants/new-join-form';

function clearAllStepData() {
  Object.values(STEP_DATA_STORAGE_KEY).forEach((key) =>
    localStorage.removeItem(key),
  );
  localStorage.removeItem('isValid');
  localStorage.removeItem('currentStep');
}

function setupFetchStub(response = {}) {
  sinon.restore();
  return sinon.stub(window, 'fetch').resolves({
    ok: true,
    status: 201,
    json: () => Promise.resolve({ application: { id: 'test-id' } }),
    ...response,
  });
}

module('Integration | Component | new-stepper', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.routerStub = {
      transitionTo: sinon.stub(),
      replaceWith: sinon.stub(),
      currentRoute: { queryParams: {} },
    };

    const testContext = this;
    class ToastStub extends Service {
      constructor(...args) {
        super(...args);
        this.success = sinon.stub();
        this.error = sinon.stub();
        testContext.toastStub = this;
      }
    }

    this.owner.register('service:router', this.routerStub, {
      instantiate: false,
    });
    this.owner.register('service:toast', ToastStub);

    this.mockStepData = {
      stepOne: {
        firstName: 'John',
        lastName: 'Doe',
        role: 'Developer',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        imageUrl: 'https://example.com/photo.jpg',
      },
      stepTwo: {
        skills: 'JavaScript, Python',
        college: 'Stanford University',
        introduction: 'Passionate developer with 5 years experience.',
      },
      stepThree: {
        forFun: 'I love hiking and photography.',
        funFact: 'I have visited 20 countries.',
      },
      stepFour: {
        phoneNo: '+1 555-123-4567',
        twitter: '@johndoe',
        github: 'github.com/johndoe',
        linkedin: 'linkedin.com/in/johndoe',
        instagram: 'instagram.com/johndoe',
      },
      stepFive: {
        numberOfHours: '20',
        whyRDS: 'I want to contribute to meaningful projects.',
        anythingElse: 'Looking forward to collaborating!',
      },
    };

    Object.entries(this.mockStepData).forEach(([step, data]) => {
      localStorage.setItem(STEP_DATA_STORAGE_KEY[step], JSON.stringify(data));
    });
    this.fetchStub = setupFetchStub();
  });

  hooks.afterEach(function () {
    clearAllStepData();
    sinon.restore();
  });

  test('it renders the welcome screen at step 0', async function (assert) {
    await render(hbs`<NewStepper @step={{0}} />`);

    assert.dom('[data-test="stepper"]').exists();
    assert.dom('[data-test="welcome-screen"]').exists();
    assert
      .dom('[data-test="welcome-greeting"]')
      .hasText('Ready to apply to Real Dev Squad?');
    assert.dom('[data-test-button="start"]').exists();
  });

  test('start button is disabled when terms are not accepted', async function (assert) {
    await render(hbs`<NewStepper @step={{0}} />`);
    assert.dom('[data-test-button="start"]').isDisabled();
  });

  test('start button is enabled when terms are accepted', async function (assert) {
    const terms = this.owner.lookup('service:joinApplicationTerms');
    terms.hasUserAcceptedTerms = true;

    await render(hbs`<NewStepper @step={{0}} />`);
    assert.dom('[data-test-button="start"]').isNotDisabled();
  });

  test('handleSubmit success - submits form data and redirects', async function (assert) {
    await render(hbs`<NewStepper @step={{6}} />`);
    await click('[data-test-button="submit-review"]');

    assert.ok(this.fetchStub.calledOnce);
    assert.ok(this.fetchStub.firstCall.args[0].includes('/applications'));
    assert.strictEqual(this.fetchStub.firstCall.args[1].method, 'POST');
    assert.ok(
      this.toastStub.success.calledWith(
        'Application submitted successfully!',
        'Success!',
      ),
    );
    assert.ok(
      this.routerStub.replaceWith.calledWith('join', {
        queryParams: { dev: true },
      }),
    );
    assert.strictEqual(localStorage.getItem('isValid'), null);
    assert.strictEqual(localStorage.getItem('currentStep'), null);
  });

  test('handleSubmit handles 409 conflict - shows already submitted error', async function (assert) {
    setupFetchStub({
      ok: false,
      status: 409,
      message: 'Application already exists',
    });

    await render(hbs`<NewStepper @step={{6}} />`);
    await click('[data-test-button="submit-review"]');

    assert.ok(
      this.toastStub.error.calledWith(
        'You have already submitted an application.',
        'Application Exists!',
      ),
    );
    assert.notOk(this.routerStub.replaceWith.called);
    assert.notOk(this.toastStub.success.called);
  });

  test('handleSubmit handles API error - shows error toast', async function (assert) {
    setupFetchStub({
      ok: false,
      status: 500,
      message: 'Internal Server Error',
    });

    await render(hbs`<NewStepper @step={{6}} />`);
    await click('[data-test-button="submit-review"]');

    assert.ok(this.toastStub.error.called);
    assert.notOk(this.routerStub.replaceWith.called);
  });

  test('handleSubmit handles network failure - shows error toast', async function (assert) {
    sinon.restore();
    sinon.stub(window, 'fetch').rejects(new Error('Network error'));

    await render(hbs`<NewStepper @step={{6}} />`);
    await click('[data-test-button="submit-review"]');

    assert.ok(
      this.toastStub.error.calledWith(
        'Failed to submit application. Please try again.',
        'Error!',
      ),
    );
  });

  test('submit button is enabled before and after submission', async function (assert) {
    await render(hbs`<NewStepper @step={{6}} />`);

    assert.dom('[data-test-button="submit-review"]').isNotDisabled();
    await click('[data-test-button="submit-review"]');
    assert.dom('[data-test-button="submit-review"]').isNotDisabled();
  });

  test('collectApplicationData merges all step data correctly', async function (assert) {
    await render(hbs`<NewStepper @step={{6}} />`);
    await click('[data-test-button="submit-review"]');

    const submittedData = JSON.parse(this.fetchStub.firstCall.args[1].body);

    assert.strictEqual(submittedData.firstName, 'John');
    assert.strictEqual(submittedData.lastName, 'Doe');
    assert.strictEqual(submittedData.role, 'developer');
    assert.strictEqual(submittedData.city, 'San Francisco');
    assert.strictEqual(submittedData.college, 'Stanford University');
    assert.strictEqual(submittedData.skills, 'JavaScript, Python');
    assert.strictEqual(submittedData.forFun, 'I love hiking and photography.');
    assert.deepEqual(submittedData.socialLink, this.mockStepData.stepFour);
    assert.strictEqual(submittedData.numberOfHours, 20);
  });

  test('collectApplicationData handles empty step data gracefully', async function (assert) {
    Object.values(STEP_DATA_STORAGE_KEY).forEach((key) =>
      localStorage.setItem(key, '{}'),
    );

    await render(hbs`<NewStepper @step={{6}} />`);
    await click('[data-test-button="submit-review"]');

    const submittedData = JSON.parse(this.fetchStub.firstCall.args[1].body);

    assert.notOk(submittedData.role);
    assert.strictEqual(submittedData.numberOfHours, 0);
  });

  test('clearAllStepData removes all step storage keys', async function (assert) {
    assert.expect(5);

    Object.values(STEP_DATA_STORAGE_KEY).forEach((key) =>
      localStorage.setItem(key, JSON.stringify({ test: 'data' })),
    );

    await render(hbs`<NewStepper @step={{6}} />`);
    await click('[data-test-button="submit-review"]');

    Object.values(STEP_DATA_STORAGE_KEY).forEach((key) => {
      assert.strictEqual(localStorage.getItem(key), null);
    });
  });

  test('clearAllStepData clears isValid and currentStep', async function (assert) {
    localStorage.setItem('isValid', 'true');
    localStorage.setItem('currentStep', '6');

    await render(hbs`<NewStepper @step={{6}} />`);
    await click('[data-test-button="submit-review"]');

    assert.strictEqual(localStorage.getItem('isValid'), null);
    assert.strictEqual(localStorage.getItem('currentStep'), null);
  });
});
