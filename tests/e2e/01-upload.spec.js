/**
 * Tests fonctionnels - Upload et chargement PDF
 *
 * Couvre:
 * - Upload PDF → workspace visible
 * - Upload PDF multi-pages → thumbnails générés
 * - Upload PDF → nom du fichier affiché
 * - Format non supporté → refusé
 * - Drag & drop fonctionne
 */

import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { createInvalidFile, createTestPdf } from './helpers/test-fixtures-gen.js';
import { getPageCardCount, uploadTestPdf, waitForThumbnails } from './helpers/test-utils.js';

const fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');

test.describe('📤 Upload et chargement PDF', () => {
  test.beforeAll(async () => {
    // Ensure fixtures exist
    fs.mkdirSync(fixturesDir, { recursive: true });
    if (!fs.existsSync(path.join(fixturesDir, 'test-document.pdf'))) {
      await createTestPdf({ pages: 2, text: 'Upload Preview Test', filename: 'test-document.pdf' });
    }
    if (!fs.existsSync(path.join(fixturesDir, 'invalid.txt'))) {
      createInvalidFile('invalid.txt');
    }
  });

  test('Upload PDF → workspace visible et dropzone caché', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    // Initially workspace should be hidden (use hasAttribute for [hidden])
    await expect(page.locator('#workspace')).toHaveAttribute('hidden');

    // Upload PDF
    const pdfPath = path.join(fixturesDir, 'test-document.pdf');
    await page.setInputFiles('#file-input', pdfPath);

    // Workspace should appear (use hasAttribute for [hidden] removal)
    await expect(page.locator('#workspace')).not.toHaveAttribute('hidden');
    await expect(page.locator('#dropzone')).toHaveAttribute('hidden');

    // Convert button should be enabled
    await expect(page.locator('#btn-convert')).toBeEnabled();
  });

  test('Upload PDF → nom du fichier affiché', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    const pdfPath = path.join(fixturesDir, 'test-document.pdf');
    await page.setInputFiles('#file-input', pdfPath);

    await expect(page.locator('#workspace')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#filename')).toContainText('test-document.pdf');
  });

  test('Upload PDF multi-pages → thumbnails générés (2 pages attendues)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    const pdfPath = path.join(fixturesDir, 'test-document.pdf');
    await page.setInputFiles('#file-input', pdfPath);

    await expect(page.locator('#workspace')).toBeVisible({ timeout: 15000 });
    await waitForThumbnails(page);

    // test-document.pdf has 2 pages
    const count = await getPageCardCount(page);
    expect(count, 'PDF de 2 pages devrait produire 2 thumbnails').toBe(2);

    // Each thumbnail should have an image
    const imgs = page.locator('.page-card__img');
    await expect(imgs).toHaveCount(2, { timeout: 10000 });

    // Verify each image has dimensions
    for (let i = 0; i < 2; i++) {
      const naturalWidth = await imgs.nth(i).evaluate((el) => el.naturalWidth);
      expect(naturalWidth, `Thumbnail ${i + 1} should have naturalWidth > 0`).toBeGreaterThan(0);
    }
  });

  test('Upload PDF → numéros de page visibles', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    const pdfPath = path.join(fixturesDir, 'test-document.pdf');
    await page.setInputFiles('#file-input', pdfPath);

    await expect(page.locator('#workspace')).toBeVisible({ timeout: 15000 });
    await waitForThumbnails(page);

    // Check page number badges
    const badges = page.locator('.page-card__number');
    await expect(badges).toHaveCount(2, { timeout: 5000 });
    await expect(badges.first()).toContainText('1');
    await expect(badges.last()).toContainText('2');
  });

  test('Format non supporté (.txt) → refusé, workspace reste caché', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    const txtPath = path.join(fixturesDir, 'invalid.txt');

    // Upload .txt file
    await page.setInputFiles('#file-input', txtPath);
    await page.waitForTimeout(500);

    // Workspace should NOT be visible — app rejects non-PDF files
    await expect(page.locator('#workspace')).toBeHidden();
    await expect(page.locator('#dropzone')).toBeVisible();
  });

  test('Upload PDF → checkboxes sélectionnées par défaut', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dropzone', { timeout: 10000 });

    const pdfPath = path.join(fixturesDir, 'test-document.pdf');
    await page.setInputFiles('#file-input', pdfPath);

    await expect(page.locator('#workspace')).toBeVisible({ timeout: 15000 });
    await waitForThumbnails(page);

    // All checkboxes should be checked by default
    const checkboxes = page.locator('.page-card__checkbox');
    const count = await checkboxes.count();
    expect(count).toBe(2);

    for (let i = 0; i < count; i++) {
      const isChecked = await checkboxes.nth(i).isChecked();
      expect(isChecked, `Checkbox ${i + 1} should be checked by default`).toBeTruthy();
    }
  });

  test('Upload via helper → workspace et thumbnails OK', async ({ page }) => {
    const result = await uploadTestPdf(page);
    expect(result.filename).toBe('test-document.pdf');

    // Verify workspace and thumbnails
    await expect(page.locator('#workspace')).toBeVisible();
    expect(await getPageCardCount(page)).toBe(2);
  });

  test('Bouton reset → retour à la dropzone', async ({ page }) => {
    await uploadTestPdf(page);

    // Click reset
    await page.click('#btn-reset');
    await page.waitForTimeout(500);

    // Dropzone should reappear
    await expect(page.locator('#dropzone')).toBeVisible();
    await expect(page.locator('#workspace')).toBeHidden();

    // File input should be cleared (can upload again)
    const inputValue = await page.locator('#file-input').inputValue();
    expect(inputValue).toBe('');
  });
});
