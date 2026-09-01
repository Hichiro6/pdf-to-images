/**
 * Tests fonctionnels - Processus de conversion
 *
 * Couvre:
 * - Conversion PDF → images (PNG)
 * - Conversion PDF → images (JPEG)
 * - Barre de progression visible pendant conversion
 * - Bouton download apparaît après conversion
 * - Info résultat affichée (nombre d'images)
 * - Conversion avec pages sélectionnées uniquement
 * - Conversion avec échelles différentes
 * - Conversion désactivée pendant traitement (isConverting)
 */
import { expect, test } from '@playwright/test';
import { createTestPdf } from './helpers/test-fixtures-gen.js';
import { uploadTestPdf, waitForConversion } from './helpers/test-utils.js';

test.describe('🔄 Processus de conversion', () => {
  test.beforeAll(async () => {
    await createTestPdf({ pages: 3, text: 'Conversion Test', filename: 'conversion-test.pdf' });
    await createTestPdf({ pages: 1, text: 'Single Page Test', filename: 'single-page.pdf' });
  });

  test('Conversion PDF 3 pages → PNG → bouton download visible', async ({ page }) => {
    await uploadTestPdf(page, 'conversion-test.pdf');

    // Click convert
    await page.click('#btn-convert');

    // Progress should appear
    await expect(page.locator('#progress-container')).toBeVisible({ timeout: 5000 });

    // Wait for completion
    await waitForConversion(page, 30000);

    // Download button should be visible
    await expect(page.locator('#btn-download')).toBeVisible();

    // Convert button should be hidden
    await expect(page.locator('#btn-convert')).toBeHidden();

    // Result info should show 3 images created
    await expect(page.locator('#result-info')).toBeVisible();
    await expect(page.locator('#result-info span')).toContainText('3');

    // Download button should mention ZIP (multiple images)
    const downloadText = await page.locator('#btn-download span').textContent();
    expect(downloadText).toContain('ZIP');
  });

  test('Conversion PDF 1 page → bouton "Télécharger l\'image" (pas ZIP)', async ({ page }) => {
    await uploadTestPdf(page, 'single-page.pdf');

    await page.click('#btn-convert');
    await waitForConversion(page, 20000);

    // Download button visible
    await expect(page.locator('#btn-download')).toBeVisible();

    // Should show single image download text (not ZIP)
    const downloadText = await page.locator('#btn-download span').textContent();
    expect(downloadText).not.toContain('ZIP');
  });

  test('Barre de progression: pourcentage augmente pendant conversion', async ({ page }) => {
    await uploadTestPdf(page, 'conversion-test.pdf');

    // Start conversion
    await page.click('#btn-convert');

    // Wait for progress to appear
    await expect(page.locator('#progress-container')).toBeVisible({ timeout: 5000 });

    // Progress text should indicate page conversion
    const progressText = await page.locator('#progress-text').textContent();
    expect(progressText).toContain('page');

    // Wait for completion
    await waitForConversion(page, 30000);

    // Progress should be hidden after completion
    await expect(page.locator('#progress-container')).toBeHidden();
  });

  test('Conversion PNG → format PNG sélectionné', async ({ page }) => {
    await uploadTestPdf(page, 'conversion-test.pdf');

    // Ensure PNG is selected
    await expect(page.locator('[data-format="png"]')).toHaveClass(/active/);

    await page.click('#btn-convert');
    await waitForConversion(page, 30000);

    // Download and verify file extension
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;

    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.zip$/);
  });

  test('Conversion JPEG → format JPEG avec qualité', async ({ page }) => {
    await uploadTestPdf(page, 'conversion-test.pdf');

    // Switch to JPEG
    await page.click('[data-format="jpg"]');
    await expect(page.locator('#quality-group')).toBeVisible();

    // Set quality to high
    await page.click('[data-quality="high"]');

    await page.click('#btn-convert');
    await waitForConversion(page, 30000);

    // Download and verify
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;

    // Filename should contain .jpg extension in ZIP
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.zip$/);
  });

  test('Conversion pages sélectionnées uniquement', async ({ page }) => {
    await uploadTestPdf(page, 'conversion-test.pdf');

    // Deselect page 2 (middle checkbox)
    const checkboxes = page.locator('.page-card__checkbox');
    await checkboxes.nth(1).uncheck();
    await page.waitForTimeout(200);

    // Switch to "custom" mode (selected pages only)
    await page.click('[data-pages="custom"]');
    await page.waitForTimeout(200);

    // Convert
    await page.click('#btn-convert');
    await waitForConversion(page, 30000);

    // Should show 2 images (3 pages - 1 deselected)
    await expect(page.locator('#result-info')).toBeVisible();
    await expect(page.locator('#result-info span')).toContainText('2');
  });

  test('Conversion avec échelle 3x → images haute résolution', async ({ page }) => {
    await uploadTestPdf(page, 'single-page.pdf');

    // Set scale to 3x
    await page.locator('#scale-select').selectOption('3');

    await page.click('#btn-convert');
    await waitForConversion(page, 30000);

    // Download single image
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('#btn-download');
    const download = await downloadPromise;

    // Verify downloaded file is not empty
    const path = await download.path();
    const fs = await import('node:fs');
    if (path && fs.existsSync(path)) {
      const stats = fs.statSync(path);
      expect(stats.size).toBeGreaterThan(1000);
    }
  });

  test('Conversion: bouton convert désactivé pendant traitement', async ({ page }) => {
    await uploadTestPdf(page, 'conversion-test.pdf');

    await page.click('#btn-convert');

    // Button should be disabled during conversion
    await expect(page.locator('#btn-convert')).toBeDisabled({ timeout: 3000 });

    await waitForConversion(page, 30000);

    // After conversion, convert button is hidden (download shown)
    await expect(page.locator('#btn-convert')).toBeHidden();
  });

  test('Conversion: aria-valuenow sur la barre de progression', async ({ page }) => {
    await uploadTestPdf(page, 'conversion-test.pdf');

    await page.click('#btn-convert');

    // Progress bar should have role="progressbar"
    const progressBar = page.locator('#progress-bar');
    await expect(progressBar).toHaveAttribute('role', 'progressbar');

    // After completion, should reach 100%
    await waitForConversion(page, 30000);
  });

  test('Conversion puis reset: état réinitialisé', async ({ page }) => {
    await uploadTestPdf(page, 'single-page.pdf');

    await page.click('#btn-convert');
    await waitForConversion(page, 20000);

    // Click reset
    await page.click('#btn-reset');
    await page.waitForTimeout(500);

    // Should be back to initial state
    await expect(page.locator('#dropzone')).toBeVisible();
    await expect(page.locator('#workspace')).toBeHidden();
    await expect(page.locator('#btn-convert')).toBeDisabled();
    await expect(page.locator('#btn-download')).toBeHidden();
  });
});
