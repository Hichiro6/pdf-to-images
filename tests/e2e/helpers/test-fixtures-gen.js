/**
 * Test fixtures generator for PDF-to-Images E2E tests
 * Generates PDFs with pdf-lib (no external dependencies needed)
 */
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const fixturesDir = path.join(process.cwd(), 'tests/e2e/fixtures');

/**
 * Create a test PDF with configurable pages and text content.
 * @param {Object} options
 * @param {number} options.pages - Number of pages (default: 1)
 * @param {string} options.filename - Output filename (default: 'test-document.pdf')
 * @param {string} options.text - Text to put on each page (default: 'Test Document')
 * @returns {Promise<string>} - Path to the created PDF file
 */
export async function createTestPdf(options = {}) {
  const {
    pages = 1,
    filename = 'test-document.pdf',
    text = 'Test Document',
  } = options;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < pages; i++) {
    const page = pdfDoc.addPage([595, 842]); // A4
    page.drawText(`${text} - Page ${i + 1}`, {
      x: 50, y: 780, size: 24, font,
      color: rgb(0, 0, 0),
    });
    for (let j = 0; j < 20; j++) {
      page.drawText(`Line ${j + 1}: Lorem ipsum dolor sit amet.`, {
        x: 50, y: 740 - j * 20, size: 12, font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(fixturesDir, filename);
  fs.mkdirSync(fixturesDir, { recursive: true });
  fs.writeFileSync(filePath, pdfBytes);
  return filePath;
}

/**
 * Create a multi-page test PDF.
 * @param {number} numPages - Number of pages
 * @returns {Promise<string>} - Path to the created PDF
 */
export async function createMultiPagePdf(numPages = 5) {
  return createTestPdf({ pages: numPages, filename: 'multi-page-test.pdf', text: 'Multi Page Test' });
}

/**
 * Create a long PDF (50+ pages) for stress testing.
 * @returns {Promise<string>} - Path to the created PDF
 */
export async function createLongPdf() {
  return createTestPdf({ pages: 55, filename: 'long-document-55pages.pdf', text: 'Long Document' });
}

/**
 * Create a PDF with varied content (drawings, text blocks).
 * @param {Object} options
 * @returns {Promise<string>} - Path to the created PDF
 */
export async function createRichPdf(options = {}) {
  const {
    pages = 3,
    filename = 'rich-content.pdf',
  } = options;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (let i = 0; i < pages; i++) {
    const page = pdfDoc.addPage([595, 842]);

    // Title
    page.drawText(`Document Riche - Page ${i + 1}`, {
      x: 50, y: 800, size: 28, font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Rectangle border
    page.drawRectangle({
      x: 40, y: 40, width: 515, height: 762,
      borderColor: rgb(0.5, 0.5, 0.5),
      borderWidth: 1,
    });

    // Content lines
    for (let j = 0; j < 25; j++) {
      page.drawText(`Ligne ${j + 1}: Contenu varie pour tester la conversion.`, {
        x: 50, y: 750 - j * 25, size: 11, font,
        color: rgb(0.2, 0.2, 0.2),
      });
    }

    // Draw some shapes
    page.drawCircle({
      x: 500, y: 700, size: 30,
      color: rgb(0.8, 0.2, 0.2),
    });
    page.drawSquare({
      x: 450, y: 600, size: 40,
      color: rgb(0.2, 0.6, 0.8),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(fixturesDir, filename);
  fs.mkdirSync(fixturesDir, { recursive: true });
  fs.writeFileSync(filePath, pdfBytes);
  return filePath;
}

/**
 * Create an invalid file (non-PDF) for testing rejection.
 * @param {string} filename - Output filename
 * @returns {string} - Path to the created file
 */
export function createInvalidFile(filename = 'invalid.txt') {
  const content = 'This is not a PDF file.\nIt should be rejected by the application.';
  const filePath = path.join(fixturesDir, filename);
  fs.mkdirSync(fixturesDir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

/**
 * Generate all standard test fixtures.
 * Call this in beforeAll or globalSetup.
 */
export async function generateAllFixtures() {
  console.log('Generating test fixtures...');
  fs.mkdirSync(fixturesDir, { recursive: true });

  const files = {
    testPdf: await createTestPdf({ pages: 2, text: 'Test PDF Document', filename: 'test-document.pdf' }),
    multiPagePdf: await createMultiPagePdf(5),
    longPdf: await createLongPdf(),
    richPdf: await createRichPdf({ pages: 3 }),
    invalidFile: createInvalidFile(),
  };

  console.log('✅ Fixtures generated');
  return files;
}
