import { describe, it } from 'node:test';
import assert from 'node:assert';

// Simulate browser env for i18n (no expo-localization)
globalThis.navigator = { language: 'de-DE' };

// Dynamic import after setting navigator
const { initI18n, t, tDays, getLocale, setLocale, getTTSLang } = await import('../../lib/i18n.ts');

describe('i18n', () => {
  it('detects German from navigator.language', () => {
    initI18n();
    assert.strictEqual(getLocale(), 'de');
  });

  it('returns German translations', () => {
    setLocale('de');
    assert.strictEqual(t('auth.login'), 'Anmelden');
    assert.strictEqual(t('common.error'), 'Fehler');
  });

  it('returns English translations', () => {
    setLocale('en');
    assert.strictEqual(t('auth.login'), 'Sign In');
    assert.strictEqual(t('common.error'), 'Error');
  });

  it('interpolates params', () => {
    setLocale('en');
    const result = t('detail.lastTriggered', { date: '2026-02-28' });
    assert.strictEqual(result, 'Last alarm: 2026-02-28');
  });

  it('returns day arrays', () => {
    setLocale('de');
    const days = tDays();
    assert.deepStrictEqual(days, ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']);

    setLocale('en');
    const daysEn = tDays();
    assert.deepStrictEqual(daysEn, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });

  it('returns correct TTS lang', () => {
    setLocale('de');
    assert.strictEqual(getTTSLang(), 'de-DE');
    setLocale('en');
    assert.strictEqual(getTTSLang(), 'en-US');
  });

  it('falls back to English for unsupported locales', () => {
    setLocale('fr');
    assert.strictEqual(getLocale(), 'en');
  });
});
