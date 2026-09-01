/**
 * Tests fonctionnels - Téléchargement
 *
 * Couvre:
 * - Téléchargement image unique (PDF 1 page → PNG)
 * - Téléchargement ZIP (PDF multi-pages)
 * - Fichier téléchargé valide (header PNG/JPEG/ZIP)
 * - Nom du fichier téléchargé correct
 * - Téléchargement après conversion JPEG
 * - Pas d'erreurs console pendant download
 */

import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { createTestPdf } from './helpers/test-fixtures-gen.js';
import { uploadTestPdf, waitForConversion } from './helpers/test-utils.js';

const _fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');
const downloadDir = path.join(process.cwd(), 'tests/e2e/downloads');

test.describe('⬇️ Téléchargement', () => {
  test.beforeAll(async () => {
    fs.mkdirSync(downloadDir, { recursive: true });
    await createTestPdf({ pages: 2, text: 'Download PDF Test', filename: 'download-test.pdf' });
    await createTestPdf({ pages: 1, text: 'Download Single', filename: 'download-single.pdf' });
  });

  test.afterEach(async () => {
    // Clean downloads
    try {
      const files = fs.readdirSync(downloadDir);
      for (const f of files) {
        fs.unlinkSync(path.join(downloadDir, f));
      }
    } catch {}
  });

  test('Téléchargement image unique (PDF 1 page) → fichier PNG généré', async ({ page }) => {
    await uploadTestPdf(page, 'download-single.pdf');

    await page.click('#btn-convert');
    await waitForConversion(page, 20000);

    // Download
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;

    const savePath = path.join(downloadDir, 'downloaded-image.png');
    await download.saveAs(savePath);

    expect(fs.existsSync(savePath), 'Downloaded file should exist').toBeTruthy();
    const stats = fs.statSync(savePath);
    expect(stats.size, 'Downloaded file size > 0').toBeGreaterThan(0);

    // Filename should contain _page_ and end with .png
    const filename = download.suggestedFilename();
    expect(filename).toContain('_page_');
    expect(filename).toMatch(/\.png$/);
  });

  test('Téléchargement ZIP (PDF 2 pages) → fichier ZIP valide', async ({ page }) => {
    await uploadTestPdf(page, 'download-test.pdf');

    await page.click('#btn-convert');
    await waitForConversion(page, 30000);

    // Download
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;

    const savePath = path.join(downloadDir, 'downloaded-images.zip');
    await download.saveAs(savePath);

    expect(fs.existsSync(savePath), 'Downloaded ZIP should exist').toBeTruthy();
    const stats = fs.statSync(savePath);
    expect(stats.size, 'Downloaded ZIP size > 0').toBeGreaterThan(100);

    // Filename should end with .zip
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.zip$/);

    // Verify ZIP magic bytes (PK\x03\x04)
    const fd = fs.openSync(savePath, 'r');
    const buffer = Buffer.alloc(4);
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    expect(buffer[0]).toBe(0x50); // P
    expect(buffer[1]).toBe(0x4b); // K
    expect(buffer[2]).toBe(0x03);
    expect(buffer[3]).toBe(0x04);
  });

  test('Téléchargement JPEG → fichier JPG valide', async ({ page }) => {
    await uploadTestPdf(page, 'download-single.pdf');

    // Switch to JPEG
    await page.click('[data-format="jpg"]');
    await page.click('[data-quality="high"]');

    await page.click('#btn-convert');
    await waitForConversion(page, 20000);

    // Download
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;

    const savePath = path.join(downloadDir, 'downloaded-image.jpg');
    await download.saveAs(savePath);

    expect(fs.existsSync(savePath), 'Downloaded JPEG should exist').toBeTruthy();

    // Verify JPEG magic bytes (FF D8 FF)
    const fd = fs.openSync(savePath, 'r');
    const buffer = Buffer.alloc(3);
    fs.readSync(fd, buffer, 0, 3, 0);
    fs.closeSync(fd);

    expect(buffer[0]).toBe(0xff);
    expect(buffer[1]).toBe(0xd8);
    expect(buffer[2]).toBe(0xff);

    // Filename should end with .jpg
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.jpg$/);
  });

  test('Nom du fichier téléchargé contient le nom du PDF source', async ({ page }) => {
    await uploadTestPdf(page, 'download-single.pdf');

    await page.click('#btn-convert');
    await waitForConversion(page, 20000);

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;

    const filename = download.suggestedFilename();
    expect(filename).toContain('download-single');
  });

  test("Pas d'erreurs console pendant conversion + download", async ({ page }) => {
    await uploadTestPdf(page, 'download-single.pdf');

    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    // Full flow: convert → download
    await page.click('#btn-convert');
    await waitForConversion(page, 20000);

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    await downloadPromise;

    await page.waitForTimeout(1000);

    // Filter out expected/non-critical errors
    const criticalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('SW registration') &&
        !e.includes('Service Worker') &&
        !e.includes('NotReadableError'),
    );

    expect(criticalErrors, `Console errors: ${criticalErrors.join(', ')}`).toHaveLength(0);
    expect(pageErrors, `Page errors: ${pageErrors.join(', ')}`).toHaveLength(0);
  });

  test('Téléchargement sans conversion: bouton download caché', async ({ page }) => {
    await uploadTestPdf(page, 'download-test.pdf');

    // Without converting, download button should be hidden
    await expect(page.locator('#btn-download')).toBeHidden();
  });

  test('Double téléchargement: peut télécharger deux fois', async ({ page }) => {
    await uploadTestPdf(page, 'download-single.pdf');

    await page.click('#btn-convert');
    await waitForConversion(page, 20000);

    // First download
    const dl1 = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    await dl1;

    await page.waitForTimeout(500);

    // Second download (button still visible)
    await expect(page.locator('#btn-download')).toBeVisible();
    const dl2 = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download2 = await dl2;

    const savePath = path.join(downloadDir, 'second-download.png');
    await download2.saveAs(savePath);
    expect(fs.existsSync(savePath), 'Second download should succeed').toBeTruthy();
  });
});
