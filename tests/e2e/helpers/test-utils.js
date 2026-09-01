/**
 * Test utilities for PDF-to-Images E2E tests
 * Provides a common helper to upload a test PDF,
 * wait for workspace to appear, and interact with page thumbnails.
 */

import path from 'node:path';

const fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');

/**
 * Upload a test PDF and wait for workspace to appear.
 * @param {import('@playwright/test').Page} page
 * @param {string} filename - fixture filename (default: test-document.pdf)
 * @returns {Promise<{filename: string}>}
 */
export async function uploadTestPdf(page, filename = 'test-document.pdf') {
  await page.goto('/');

  // Wait for dropzone to be visible (initial state)
  await page.waitForSelector('#dropzone', { timeout: 10000 });

  const filePath = path.join(fixturesDir, filename);
  await page.setInputFiles('#file-input', filePath);

  // Wait for workspace to appear (dropzone hides, workspace shows)
  await page.waitForSelector('#workspace:not([hidden])', { timeout: 15000 });

  // Wait for page thumbnails to render
  await waitForThumbnails(page);

  return {
    filename: path.basename(filename),
  };
}

/**
 * Wait for page thumbnails to render after PDF upload.
 * Waits for at least one .page-card to be present, then for count to stabilize.
 * @param {import('@playwright/test').Page} page
 * @param {number} timeout - timeout in ms (default: 20000)
 */
export async function waitForThumbnails(page, timeout = 20000) {
  // Wait for at least one page card
  await page.waitForSelector('.page-card', { timeout });

  // Wait for thumbnail count to stabilize (handles multi-page PDFs)
  await page.waitForFunction(
    () => {
      const count = document.querySelectorAll('.page-card').length;
      return new Promise((resolve) => {
        const prev = count;
        setTimeout(() => {
          resolve(document.querySelectorAll('.page-card').length === prev);
        }, 500);
      });
    },
    null,
    { timeout },
  );
}

/**
 * Wait for conversion to complete.
 * Looks for the progress bar to disappear and download button to appear.
 * @param {import('@playwright/test').Page} page
 * @param {number} timeout - timeout in ms (default: 30000)
 */
export async function waitForConversion(page, timeout = 30000) {
  // Wait for progress container to become visible (conversion started)
  await page
    .waitForSelector('#progress-container:not([hidden])', { timeout: 5000 })
    .catch(() => {});

  // Wait for download button to become visible (conversion complete)
  await page.waitForSelector('#btn-download:not([hidden])', { timeout });

  // Wait for progress to be hidden
  await page.waitForSelector('#progress-container[hidden]', { timeout: 5000 }).catch(() => {});
}

/**
 * Get the number of page cards currently rendered.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<number>}
 */
export async function getPageCardCount(page) {
  return await page.locator('.page-card').count();
}

/**
 * Get a fixture file path
 */
export function getFixturePath(filename) {
  return path.join(fixturesDir, filename);
}

/**
 * Upload a PDF and run the full conversion flow.
 * @param {import('@playwright/test').Page} page
 * @param {string} filename - fixture filename
 * @returns {Promise<void>}
 */
export async function uploadAndConvert(page, filename = 'test-document.pdf') {
  await uploadTestPdf(page, filename);
  await page.click('#btn-convert');
  await waitForConversion(page);
}
