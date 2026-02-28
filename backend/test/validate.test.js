import { describe, it } from 'node:test';
import assert from 'node:assert';
import { stripHtml, isValidEmail, isValidTime, isValidDays, isValidName, maxLength } from '../src/middleware/validate.js';

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    assert.strictEqual(stripHtml('<script>alert("xss")</script>'), 'alert("xss")');
    assert.strictEqual(stripHtml('Hello <b>World</b>'), 'Hello World');
    assert.strictEqual(stripHtml('clean text'), 'clean text');
  });

  it('handles non-strings', () => {
    assert.strictEqual(stripHtml(42), 42);
    assert.strictEqual(stripHtml(null), null);
  });
});

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    assert.ok(isValidEmail('test@example.com'));
    assert.ok(isValidEmail('user.name@domain.co'));
  });

  it('rejects invalid emails', () => {
    assert.ok(!isValidEmail(''));
    assert.ok(!isValidEmail('nope'));
    assert.ok(!isValidEmail('@missing.com'));
    assert.ok(!isValidEmail('a'.repeat(255) + '@x.com'));
  });
});

describe('isValidTime', () => {
  it('accepts HH:MM and HH:MM:SS', () => {
    assert.ok(isValidTime('07:00'));
    assert.ok(isValidTime('23:59'));
    assert.ok(isValidTime('00:00:00'));
    assert.ok(isValidTime('12:30:45'));
  });

  it('rejects invalid times', () => {
    assert.ok(!isValidTime('25:00'));
    assert.ok(!isValidTime('12:60'));
    assert.ok(!isValidTime('7:00'));
    assert.ok(!isValidTime(''));
    assert.ok(!isValidTime('noon'));
  });
});

describe('isValidDays', () => {
  it('accepts valid day arrays', () => {
    assert.ok(isValidDays([0, 1, 2, 3, 4, 5, 6]));
    assert.ok(isValidDays([1, 3, 5]));
    assert.ok(isValidDays([]));
  });

  it('rejects invalid', () => {
    assert.ok(!isValidDays([7]));
    assert.ok(!isValidDays([-1]));
    assert.ok(!isValidDays(['Mon']));
    assert.ok(!isValidDays('1,2,3'));
  });
});

describe('isValidName', () => {
  it('accepts valid names', () => {
    assert.ok(isValidName('Morning Alarm'));
    assert.ok(isValidName('A'));
  });

  it('rejects invalid', () => {
    assert.ok(!isValidName(''));
    assert.ok(!isValidName('A'.repeat(101)));
    assert.ok(!isValidName(42));
  });
});

describe('maxLength', () => {
  it('checks string length', () => {
    assert.ok(maxLength('hello', 10));
    assert.ok(!maxLength('hello', 3));
    assert.ok(!maxLength(42, 10));
  });
});
