import { describe, expect, it } from 'vitest';
import { getCurrentLanguage, LANGUAGES, setLanguage, t } from '../../src/i18n.js';

describe('i18n - Core functions', () => {
  it('returns the correct code from getCurrentLanguage()', () => {
    expect(getCurrentLanguage()).toBe('en');
  });

  it('falls back to English for unknown keys', () => {
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('substitutes params correctly', () => {
    const result = t('progress.page', { current: 2, total: 5 });
    expect(result).toContain('2');
    expect(result).toContain('5');
  });

  it('falls back to English string when switching to unknown lang', () => {
    setLanguage('xx');
    expect(t('app.title')).toBe(TRANSLATIONS.en['app.title'] || 'PDF to Images — Convert your PDF to images');
    // Restore
    setLanguage('en');
  });

  it('switches to French correctly', () => {
    setLanguage('fr');
    const result = t('dropzone.title');
    expect(result).toBe('Déposez votre PDF ici');
    setLanguage('en');
  });

  it('switches to German correctly', () => {
    setLanguage('de');
    const result = t('dropzone.title');
    expect(result).toBe('Legen Sie Ihr PDF hier ab');
    setLanguage('en');
  });

  it('LANGUAGES has 7 languages', () => {
    expect(Object.keys(LANGUAGES)).toHaveLength(7);
  });

  it('all 7 languages have the same keys as English', () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    for (const lang of Object.keys(LANGUAGES)) {
      if (lang === 'en') continue;
      const langKeys = Object.keys(TRANSLATIONS[lang]).sort();
      expect(langKeys).toEqual(enKeys);
    }
  });
});

import { TRANSLATIONS } from '../../src/i18n.js';
