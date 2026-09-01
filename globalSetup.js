/**
 * Global Setup for Playwright - Inject French locale
 * Forces French locale in localStorage before each test starts
 */
import fs from 'node:fs';
import path from 'node:path';

export default async function globalSetup(config) {
  // Create a script that will be executed in the browser before each test
  const localeScript = `
    (function() {
      // Check if localStorage exists (should in browser context)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pdftoimages_lang', 'fr');
        console.log('[i18n] Locale forced to French');
      }
    })();
  `;

  // Save to a file that can be read by the test setup
  const setupDir = path.join(config.projectDir || process.cwd(), 'tests/e2e/setup');
  fs.mkdirSync(setupDir, { recursive: true });
  fs.writeFileSync(path.join(setupDir, 'inject-locale.js'), localeScript);

  console.log('✅ Global setup: French locale injection script created');
}
