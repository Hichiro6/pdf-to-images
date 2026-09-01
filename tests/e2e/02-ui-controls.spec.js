/**
 * Tests fonctionnels - Contrôles UI
 *
 * Couvre:
 * - Sélecteur de format: PNG / JPEG (toggle active state, quality group visibility)
 * - Sélecteur de qualité: low / medium / high
 * - Sélecteur d'échelle: 1x / 1.5x / 2x / 3x
 * - Mode de pages: toutes / sélectionnées
 * - Boutons select-all / deselect-all
 * - Checkboxes individuelles de pages
 * - Sections repliables (collapsible)
 */
import { expect, test } from '@playwright/test';
import { createTestPdf } from './helpers/test-fixtures-gen.js';
import { uploadTestPdf } from './helpers/test-utils.js';

test.describe('🎛️ Contrôles UI - Format, Qualité, Échelle, Pages', () => {
  test.beforeAll(async () => {
    await createTestPdf({ pages: 3, text: 'Controls Test', filename: 'controls-test.pdf' });
  });

  test('Sélecteur de format: PNG actif par défaut, JPEG sélectionnable', async ({ page }) => {
    await uploadTestPdf(page, 'controls-test.pdf');

    const pngBtn = page.locator('[data-format="png"]');
    const jpgBtn = page.locator('[data-format="jpg"]');
    const qualityGroup = page.locator('#quality-group');

    // PNG should be active by default
    await expect(pngBtn).toHaveClass(/active/);
    await expect(pngBtn).toHaveAttribute('aria-checked', 'true');

    // Quality group should be hidden for PNG
    await expect(qualityGroup).toBeHidden();

    // Switch to JPEG
    await jpgBtn.click();
    await expect(jpgBtn).toHaveClass(/active/);
    await expect(jpgBtn).toHaveAttribute('aria-checked', 'true');
    await expect(pngBtn).not.toHaveClass(/active/);

    // Quality group should now be visible
    await expect(qualityGroup).toBeVisible();

    // Switch back to PNG
    await pngBtn.click();
    await expect(pngBtn).toHaveClass(/active/);
    await expect(qualityGroup).toBeHidden();
  });

  test('Sélecteur de qualité: low / medium / high (visible avec JPEG)', async ({ page }) => {
    await uploadTestPdf(page, 'controls-test.pdf');

    // Switch to JPEG to reveal quality controls
    await page.click('[data-format="jpg"]');
    await expect(page.locator('#quality-group')).toBeVisible();

    // Medium should be active by default
    const mediumBtn = page.locator('[data-quality="medium"]');
    await expect(mediumBtn).toHaveClass(/active/);

    // Click low
    const lowBtn = page.locator('[data-quality="low"]');
    await lowBtn.click();
    await expect(lowBtn).toHaveClass(/active/);
    await expect(mediumBtn).not.toHaveClass(/active/);

    // Click high
    const highBtn = page.locator('[data-quality="high"]');
    await highBtn.click();
    await expect(highBtn).toHaveClass(/active/);
    await expect(lowBtn).not.toHaveClass(/active/);
  });

  test("Sélecteur d'échelle: valeurs disponibles et changement", async ({ page }) => {
    await uploadTestPdf(page, 'controls-test.pdf');

    const scaleSelect = page.locator('#scale-select');

    // Default should be 1.5
    expect(await scaleSelect.inputValue()).toBe('1.5');

    // Change to 1x
    await scaleSelect.selectOption('1');
    expect(await scaleSelect.inputValue()).toBe('1');

    // Change to 2x
    await scaleSelect.selectOption('2');
    expect(await scaleSelect.inputValue()).toBe('2');

    // Change to 3x
    await scaleSelect.selectOption('3');
    expect(await scaleSelect.inputValue()).toBe('3');

    // Back to 1.5x
    await scaleSelect.selectOption('1.5');
    expect(await scaleSelect.inputValue()).toBe('1.5');
  });

  test('Mode pages: "Toutes" actif par défaut, "Sélection" activable', async ({ page }) => {
    await uploadTestPdf(page, 'controls-test.pdf');

    const allBtn = page.locator('[data-pages="all"]');
    const customBtn = page.locator('[data-pages="custom"]');

    // "All pages" should be active by default
    await expect(allBtn).toHaveClass(/active/);
    await expect(allBtn).toHaveAttribute('aria-checked', 'true');

    // Click "Custom range"
    await customBtn.click();
    await expect(customBtn).toHaveClass(/active/);
    await expect(allBtn).not.toHaveClass(/active/);

    // Switch back
    await allBtn.click();
    await expect(allBtn).toHaveClass(/active/);
  });

  test('Bouton "Select all" → toutes les checkboxes cochées', async ({ page }) => {
    await uploadTestPdf(page, 'controls-test.pdf');

    // Deselect all first
    await page.click('#btn-deselect-all');
    await page.waitForTimeout(200);

    // Verify all unchecked
    const checkboxes = page.locator('.page-card__checkbox');
    for (let i = 0; i < 3; i++) {
      expect(await checkboxes.nth(i).isChecked()).toBeFalsy();
    }

    // Click select all
    await page.click('#btn-select-all');
    await page.waitForTimeout(200);

    // Verify all checked
    for (let i = 0; i < 3; i++) {
      expect(await checkboxes.nth(i).isChecked()).toBeTruthy();
    }

    // Convert button should be enabled
    await expect(page.locator('#btn-convert')).toBeEnabled();
  });

  test('Bouton "Deselect all" → toutes décochées, bouton convert désactivé', async ({ page }) => {
    await uploadTestPdf(page, 'controls-test.pdf');

    // All checked by default
    const checkboxes = page.locator('.page-card__checkbox');
    for (let i = 0; i < 3; i++) {
      expect(await checkboxes.nth(i).isChecked()).toBeTruthy();
    }

    // Click deselect all
    await page.click('#btn-deselect-all');
    await page.waitForTimeout(200);

    // All should be unchecked
    for (let i = 0; i < 3; i++) {
      expect(await checkboxes.nth(i).isChecked()).toBeFalsy();
    }

    // Convert button should be disabled
    await expect(page.locator('#btn-convert')).toBeDisabled();
  });

  test('Checkbox individuelle: décocher une page', async ({ page }) => {
    await uploadTestPdf(page, 'controls-test.pdf');

    const firstCheckbox = page.locator('.page-card__checkbox').first();

    // Initially checked
    expect(await firstCheckbox.isChecked()).toBeTruthy();

    // Uncheck
    await firstCheckbox.uncheck();
    await page.waitForTimeout(200);
    expect(await firstCheckbox.isChecked()).toBeFalsy();

    // Card should lose selected class
    const firstCard = page.locator('.page-card').first();
    await expect(firstCard).not.toHaveClass(/page-card--selected/);

    // Re-check
    await firstCheckbox.check();
    await page.waitForTimeout(200);
    expect(await firstCheckbox.isChecked()).toBeTruthy();
    await expect(firstCard).toHaveClass(/page-card--selected/);
  });

  test('Sections repliables: toggle ouvrir/fermer', async ({ page }) => {
    await uploadTestPdf(page, 'controls-test.pdf');

    // Find a collapsible title
    const formatTitle = page.locator('.control-group__title').first();

    // Should be expanded by default
    await expect(formatTitle).toHaveAttribute('aria-expanded', 'true');

    // Click to collapse
    await formatTitle.click();
    await expect(formatTitle).toHaveAttribute('aria-expanded', 'false');

    // Body should be hidden
    const body = formatTitle.locator('+ .control-group__body');
    await expect(body).toBeHidden();

    // Click to expand
    await formatTitle.click();
    await expect(formatTitle).toHaveAttribute('aria-expanded', 'true');
    await expect(body).toBeVisible();
  });

  test('Bouton convert: désactivé quand aucune page sélectionnée', async ({ page }) => {
    await uploadTestPdf(page, 'controls-test.pdf');

    // Initially enabled (all pages selected)
    await expect(page.locator('#btn-convert')).toBeEnabled();

    // Deselect all
    await page.click('#btn-deselect-all');
    await page.waitForTimeout(200);

    // Convert should be disabled
    await expect(page.locator('#btn-convert')).toBeDisabled();

    // Select all again
    await page.click('#btn-select-all');
    await page.waitForTimeout(200);

    // Should be enabled again
    await expect(page.locator('#btn-convert')).toBeEnabled();
  });
});
