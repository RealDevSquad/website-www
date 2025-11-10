import { setOwner } from '@ember/application';
import { module, test } from 'qunit';
import BaseStepComponent from 'website-www/components/new-join-steps/base-step';
import { setupTest } from 'website-www/tests/helpers';

module('Unit | Component | new-join-steps/base-step', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    const TestComponent = class extends BaseStepComponent {
      constructor(owner, args) {
        super(owner, args);
      }
    };
    this.component = Object.create(TestComponent.prototype);
    setOwner(this.component, this.owner);
    this.component.args = { onValidityChange: () => {} };
    this.component.data = {};
    this.component.errorMessage = {};
    this.component.wordCount = {};
    this.component.stepValidation = {};
  });

  test('validateField returns correct result for valid input', function (assert) {
    this.component.stepValidation = { field1: { min: 1, max: 10 } };
    const result = this.component.validateField('field1', 'valid input');

    assert.true(result.isValid);
    assert.strictEqual(result.wordCount, 2);
  });

  test('validateField returns invalid for empty required field', function (assert) {
    this.component.stepValidation = { field1: { min: 1, max: 10 } };
    const result = this.component.validateField('field1', '');

    assert.false(result.isValid);
    assert.strictEqual(result.remainingToMin, 1);
  });

  test('validateField returns invalid when exceeds max words', function (assert) {
    this.component.stepValidation = { field1: { min: 1, max: 3 } };
    const result = this.component.validateField('field1', 'one two three four');
    assert.false(result.isValid);
  });

  test('isDataValid returns true when all fields valid', function (assert) {
    this.component.stepValidation = {
      field1: { min: 1, max: 10 },
      field2: { min: 1, max: 5 },
    };
    this.component.data = { field1: 'valid text', field2: 'ok' };

    const result = this.component.isDataValid();
    assert.true(result);
  });

  test('isDataValid returns false when any field invalid', function (assert) {
    this.component.stepValidation = {
      field1: { min: 1, max: 10 },
      field2: { min: 1, max: 5 },
    };
    this.component.data = { field1: 'valid text', field2: '' };

    const result = this.component.isDataValid();
    assert.false(result);
  });

  test('updateFieldValue updates data and syncs storage', function (assert) {
    this.component.data = {};
    Object.defineProperty(this.component, 'storageKey', {
      value: 'test-key',
      writable: true,
      configurable: true,
    });

    this.component.updateFieldValue('field1', 'new value');
    assert.strictEqual(this.component.data.field1, 'new value');
  });

  test('updateWordCount updates word count correctly', function (assert) {
    this.component.wordCount = {};
    this.component.updateWordCount('field1', { wordCount: 5 });
    assert.strictEqual(this.component.wordCount.field1, 5);
  });

  test('formatError returns empty string when valid', function (assert) {
    this.component.stepValidation = { field1: { min: 1, max: 10 } };
    const result = this.component.formatError('field1', { isValid: true });
    assert.strictEqual(result, '');
  });

  test('formatError returns min words message', function (assert) {
    this.component.stepValidation = { field1: { min: 5, max: 10 } };
    const result = this.component.formatError('field1', {
      isValid: false,
      remainingToMin: 3,
    });
    assert.strictEqual(result, 'At least 3 more word(s) required');
  });

  test('formatError returns max words message', function (assert) {
    this.component.stepValidation = { field1: { min: 1, max: 5 } };
    const result = this.component.formatError('field1', { isValid: false });
    assert.strictEqual(result, 'Maximum 5 words allowed');
  });

  test('updateErrorMessage updates error correctly', function (assert) {
    this.component.stepValidation = { field1: { min: 1, max: 10 } };
    this.component.errorMessage = {};
    this.component.updateErrorMessage('field1', {
      isValid: false,
      remainingToMin: 2,
    });

    assert.strictEqual(
      this.component.errorMessage.field1,
      'At least 2 more word(s) required',
    );
  });
});
