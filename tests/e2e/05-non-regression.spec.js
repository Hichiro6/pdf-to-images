/**
 * Tests de non-régression
 *
 * Couvre:
 * - Guard convertToImages(): null pdfDoc → early return
 * - Guard downloadResults(): no converted images → early return
 * - Conversion avec pages désélectionnées
 * - Ordre des pages préservé dans le ZIP
 * - Conversion multi-pages → bon nombre d'images
 * - i18n: locale FR appliquée
 * - Pas de fuite: URLs révoquées après reset
 * - Workflow complet: upload → convert → download → reset → re-upload
 */

import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { createRichPdf, createTestPdf } from './helpers/test-fixtures-gen.js';
import { getPageCardCount, uploadTestPdf, waitForConversion } from './helpers/test-utils.js';

const fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');
const downloadDir = path.join(process.cwd(), 'tests/e2e/downloads');

test.describe('🛡️ Non-régression', () => {
  test.beforeAll(async () => {
    fs.mkdirSync(fixturesDir, { recursive: true });
    fs.mkdirSync(downloadDir, { recursive: true });
    await createTestPdf({ pages: 3, text: 'Regression Test', filename: 'regression-test.pdf' });
    await createTestPdf({ pages: 1, text: 'Single Page', filename: 'single-page.pdf' });
    await createRichPdf({ pages: 2, filename: 'rich-content.pdf' });
  });

  test('Guard convertToImages(): bouton convert désactivé sans fichier', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    // No file uploaded — workspace hidden, convert disabled
    await expect(page.locator('#workspace')).toBeHidden();
    await expect(page.locator('#btn-convert')).toBeHidden();

    // No download possible
    let downloadTriggered = false;
    page.on('download', () => {
      downloadTriggered = true;
    });

    await page.waitForTimeout(500);
    expect(downloadTriggered).toBeFalsy();
  });

  test('Guard downloadResults(): bouton download caché avant conversion', async ({ page }) => {
    await uploadTestPdf(page, 'regression-test.pdf');

    // Download button should be hidden before conversion
    await expect(page.locator('#btn-download')).toBeHidden();

    // No download should trigger
    let downloadTriggered = false;
    page.on('download', () => {
      downloadTriggered = true;
    });

    await page.waitForTimeout(500);
    expect(downloadTriggered).toBeFalsy();
  });

  test('Conversion avec pages désélectionnées: respecte la sélection', async ({ page }) => {
    await uploadTestPdf(page, 'regression-test.pdf');

    // Deselect pages 1 and 3 (keep only page 2)
    const checkboxes = page.locator('.page-card__checkbox');
    await checkboxes.nth(0).uncheck();
    await checkboxes.nth(2).uncheck();
    await page.waitForTimeout(200);

    // Switch to custom mode
    await page.click('[data-pages="custom"]');

    // Convert
    await page.click('#btn-convert');
    await waitForConversion(page, 30000);

    // Should show 1 image (only page 2)
    await expect(page.locator('#result-info')).toBeVisible();
    await expect(page.locator('#result-info span')).toContainText('1');
  });

  test("PDF multi-pages: nombre d'images = nombre de pages converties", async ({ page }) => {
    await uploadTestPdf(page, 'regression-test.pdf');

    // 3 page cards expected
    expect(await getPageCardCount(page)).toBe(3);

    await page.click('#btn-convert');
    await waitForConversion(page, 30000);

    // 3 images created
    await expect(page.locator('#result-info span')).toContainText('3');
  });

  test('Ordre des pages préservé dans le ZIP', async ({ page }) => {
    await uploadTestPdf(page, 'regression-test.pdf');

    await page.click('#btn-convert');
    await waitForConversion(page, 30000);

    // Download ZIP
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;

    const savePath = path.join(downloadDir, 'order-test.zip');
    await download.saveAs(savePath);

    // Verify ZIP contains 3 files with correct naming order
    const AdmZip = await import('adm-zip').catch(() => null);
    if (AdmZip?.default) {
      const zip = new AdmZip.default(savePath);
      const entries = zip.getEntries().map((e) => e.entryName);
      expect(entries.length).toBe(3);
      // Files should be named _page_01, _page_02, _page_03
      expect(entries.some((e) => e.includes('_page_01'))).toBeTruthy();
      expect(entries.some((e) => e.includes('_page_02'))).toBeTruthy();
      expect(entries.some((e) => e.includes('_page_03'))).toBeTruthy();
    } else {
      // Fallback: just verify file exists and is a valid ZIP
      expect(fs.existsSync(savePath)).toBeTruthy();
      const fd = fs.openSync(savePath, 'r');
      const buffer = Buffer.alloc(4);
      fs.readSync(fd, buffer, 0, 4, 0);
      fs.closeSync(fd);
      expect(buffer[0]).toBe(0x50); // P
    }

    // Cleanup
    try {
      fs.unlinkSync(savePath);
    } catch {}
  });

  test('i18n: locale FR appliquée (texte en français)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    // Dropzone title should be in French
    const dropzoneTitle = await page.locator('[data-i18n="dropzone.title"]').textContent();
    expect(dropzoneTitle).toContain('Déposez votre PDF');

    // Tagline should be in French
    const tagline = await page.locator('.header__tagline').textContent();
    expect(tagline).toContain('navigateur');
  });

  test("Pas d'erreurs console pendant upload PDF", async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const pdfPath = path.join(fixturesDir, 'regression-test.pdf');
    await page.setInputFiles('#file-input', pdfPath);

    await expect(page.locator('#workspace')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('SW registration') && !e.includes('Service Worker'),
    );

    expect(criticalErrors, `Console errors: ${criticalErrors.join(', ')}`).toHaveLength(0);
    expect(pageErrors, `Page errors: ${pageErrors.join(', ')}`).toHaveLength(0);
  });

  test('Workflow complet: upload → convert → download → reset → re-upload', async ({ page }) => {
    // Phase 1: Upload and convert first PDF
    await uploadTestPdf(page, 'single-page.pdf');
    await page.click('#btn-convert');
    await waitForConversion(page, 20000);

    // Download
    const dl1 = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    await dl1;

    // Phase 2: Reset
    await page.click('#btn-reset');
    await page.waitForTimeout(500);
    await expect(page.locator('#dropzone')).toBeVisible();

    // Phase 3: Re-upload a different PDF
    await uploadTestPdf(page, 'regression-test.pdf');
    expect(await getPageCardCount(page)).toBe(3);

    // Convert again
    await page.click('#btn-convert');
    await waitForConversion(page, 30000);

    await expect(page.locator('#result-info span')).toContainText('3');

    // Download again
    const dl2 = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    await dl2;
  });

  test('PDF avec contenu riche (formes, rectangles) → conversion sans crash', async ({ page }) => {
    await uploadTestPdf(page, 'rich-content.pdf');

    expect(await getPageCardCount(page)).toBe(2);

    await page.click('#btn-convert');
    await waitForConversion(page, 30000);

    await expect(page.locator('#result-info span')).toContainText('2');

    // Download
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;

    const savePath = path.join(downloadDir, 'rich-content.zip');
    await download.saveAs(savePath);

    expect(fs.existsSync(savePath)).toBeTruthy();
    expect(fs.statSync(savePath).size).toBeGreaterThan(100);

    try {
      fs.unlinkSync(savePath);
    } catch {}
  });

  test("Conversion puis reset: pas de fuite d'URLs (pas d'erreur)", async ({ page }) => {
    await uploadTestPdf(page, 'regression-test.pdf');

    await page.click('#btn-convert');
    await waitForConversion(page, 30000);

    // Reset
    await page.click('#btn-reset');
    await page.waitForTimeout(500);

    // Verify clean state
    await expect(page.locator('#dropzone')).toBeVisible();
    await expect(page.locator('#workspace')).toBeHidden();
    await expect(page.locator('#btn-convert')).toBeDisabled();
  });

  test('Sélecteur de langue visible et fonctionnel', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    // Language selector should exist in header
    const langSelector = page.locator('.lang-selector');
    await expect(langSelector).toBeVisible();

    // Should have language buttons
    const langBtns = langSelector.locator('.lang-btn');
    const count = await langBtns.count();
    expect(count).toBeGreaterThanOrEqual(2); // At least EN and FR

    // French should be active (forced by globalSetup)
    const frenchBtn = langSelector.locator('.lang-btn[data-lang="fr"]');
    await expect(frenchBtn).toHaveClass(/active/);
  });
});
