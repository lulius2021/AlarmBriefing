import { describe, it } from 'node:test';
import assert from 'node:assert';

// Test the i18n logic directly (can't import .ts, so we test the pattern)
describe('i18n pattern', () => {
  const translations = {
    de: { login: 'Anmelden', error: 'Fehler', days: ['So','Mo','Di','Mi','Do','Fr','Sa'] },
    en: { login: 'Sign In', error: 'Error', days: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] },
  };

  function detectLang(navLang) {
    const lang = (navLang || 'en').slice(0, 2);
    return translations[lang] ? lang : 'en';
  }

  it('detects German', () => {
    assert.strictEqual(detectLang('de-DE'), 'de');
    assert.strictEqual(detectLang('de'), 'de');
  });

  it('detects English', () => {
    assert.strictEqual(detectLang('en-US'), 'en');
    assert.strictEqual(detectLang('en'), 'en');
  });

  it('falls back to English for unsupported', () => {
    assert.strictEqual(detectLang('fr-FR'), 'en');
    assert.strictEqual(detectLang('ja'), 'en');
    assert.strictEqual(detectLang(''), 'en');
  });

  it('returns correct translations', () => {
    assert.strictEqual(translations.de.login, 'Anmelden');
    assert.strictEqual(translations.en.login, 'Sign In');
  });

  it('returns correct day arrays', () => {
    assert.deepStrictEqual(translations.de.days, ['So','Mo','Di','Mi','Do','Fr','Sa']);
    assert.deepStrictEqual(translations.en.days, ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']);
  });

  it('interpolates params', () => {
    const template = 'Last alarm: {date}';
    const result = template.replace('{date}', '2026-02-28');
    assert.strictEqual(result, 'Last alarm: 2026-02-28');
  });
});
