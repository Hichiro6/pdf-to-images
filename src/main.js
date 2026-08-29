/**
 * PDF to Images — Main Application
 * 100% client-side PDF to image conversion using pdfjs-dist
 */

import { zipSync } from 'fflate';
// ===== pdf.js Worker Setup =====
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { initI18n, t } from './i18n.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// ===== State =====
let pdfFile = null;
let pdfDoc = null;
let pages = []; // [{ id, pageNum, selected, thumbnail }]
let isConverting = false;
let selectedFormat = 'png';
let selectedQuality = 'medium';
let selectedPagesMode = 'all';
let selectedScale = 1.5;
let convertedImages = []; // [{ name, blob, url }]
let draggedPageId = null;
let progressBar = null;

// ===== DOM Elements =====
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const workspace = document.getElementById('workspace');
const pagesGrid = document.getElementById('pages-grid');
const filenameEl = document.getElementById('filename');
const btnReset = document.getElementById('btn-reset');
const btnConvert = document.getElementById('btn-convert');
const btnDownload = document.getElementById('btn-download');
const btnSelectAll = document.getElementById('btn-select-all');
const btnDeselectAll = document.getElementById('btn-deselect-all');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressPercent = document.getElementById('progress-percent');
const progressText = document.getElementById('progress-text');
const resultInfo = document.getElementById('result-info');
const qualityGroup = document.getElementById('quality-group');
const scaleSelect = document.getElementById('scale-select');
const srLive = document.getElementById('sr-live');
progressBar = document.getElementById('progress-bar');

// ===== Helpers =====
function announce(msg) {
  if (srLive) srLive.textContent = msg;
}

function getQualityValue(level) {
  const map = { low: 0.4, medium: 0.7, high: 0.92 };
  return map[level] ?? 0.7;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ===== PDF Loading =====
async function loadPdf(file) {
  pdfFile = file;
  filenameEl.textContent = file.name;

  const arrayBuffer = await file.arrayBuffer();
  pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  pages = [];
  const totalPages = pdfDoc.numPages;
  for (let i = 1; i <= totalPages; i++) {
    pages.push({ id: crypto.randomUUID(), pageNum: i, selected: true, thumbnail: null });
  }

  await renderThumbnails();

  // Show workspace
  dropzone.hidden = true;
  workspace.hidden = false;
  btnConvert.disabled = false;
  btnConvert.hidden = false;
  btnDownload.hidden = true;
  resultInfo.hidden = true;

  announce(`${totalPages} pages loaded`);
}

async function renderThumbnails() {
  pagesGrid.innerHTML = '';
  for (const page of pages) {
    const card = await createPageCard(page);
    pagesGrid.appendChild(card);
  }
}

async function createPageCard(page) {
  const card = document.createElement('div');
  card.className = 'page-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('draggable', 'true');
  card.dataset.pageId = page.id;

  // Thumbnail
  const thumbWrapper = document.createElement('div');
  thumbWrapper.className = 'page-card__thumb';

  if (!page.thumbnail) {
    try {
      const pdfPage = await pdfDoc.getPage(page.pageNum);
      const viewport = pdfPage.getViewport({ scale: 0.3 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await pdfPage.render({ canvasContext: ctx, viewport }).promise;
      page.thumbnail = canvas.toDataURL('image/png');
    } catch {
      page.thumbnail = '';
    }
  }

  if (page.thumbnail) {
    const img = document.createElement('img');
    img.src = page.thumbnail;
    img.alt = `Page ${page.pageNum}`;
    img.className = 'page-card__img';
    thumbWrapper.appendChild(img);
  } else {
    thumbWrapper.textContent = '?';
  }

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'page-card__checkbox';
  checkbox.checked = page.selected;
  checkbox.setAttribute('aria-label', `Select page ${page.pageNum}`);
  checkbox.addEventListener('change', () => {
    page.selected = checkbox.checked;
    card.classList.toggle('page-card--selected', page.selected);
    updateConvertButton();
  });

  // Page number badge
  const badge = document.createElement('span');
  badge.className = 'page-card__number';
  badge.textContent = String(pages.indexOf(page) + 1);

  card.appendChild(thumbWrapper);
  card.appendChild(checkbox);
  card.appendChild(badge);

  if (page.selected) card.classList.add('page-card--selected');

  // Drag-and-drop reordering
  card.addEventListener('dragstart', (e) => {
    draggedPageId = page.id;
    card.classList.add('page-card--dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('page-card--dragging');
    draggedPageId = null;
    for (const c of pagesGrid.querySelectorAll('.page-card')) {
      c.classList.remove('page-card--drag-over');
    }
    updatePageNumbers();
  });

  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedPageId && draggedPageId !== page.id) {
      card.classList.add('page-card--drag-over');
    }
  });

  card.addEventListener('dragleave', () => {
    card.classList.remove('page-card--drag-over');
  });

  card.addEventListener('drop', async (e) => {
    e.preventDefault();
    card.classList.remove('page-card--drag-over');
    if (!draggedPageId || draggedPageId === page.id) return;

    const fromIdx = pages.findIndex((p) => p.id === draggedPageId);
    const toIdx = pages.findIndex((p) => p.id === page.id);
    if (fromIdx === -1 || toIdx === -1) return;

    const [moved] = pages.splice(fromIdx, 1);
    pages.splice(toIdx, 0, moved);

    // Re-render in new order (sequential to preserve order)
    pagesGrid.innerHTML = '';
    for (const p of pages) {
      const newCard = await createPageCard(p);
      pagesGrid.appendChild(newCard);
    }
    updatePageNumbers();
    announce(`Page moved to position ${toIdx + 1}`);
  });

  return card;
}

function updatePageNumbers() {
  const cards = pagesGrid.querySelectorAll('.page-card');
  cards.forEach((card, idx) => {
    const badge = card.querySelector('.page-card__number');
    if (badge) badge.textContent = String(idx + 1);
  });
}

function updateConvertButton() {
  const hasSelection = pages.some((p) => p.selected);
  btnConvert.disabled = !hasSelection || isConverting;
}

// ===== Conversion =====
async function convertToImages() {
  if (!pdfDoc || isConverting) return;

  const pagesToConvert = selectedPagesMode === 'all' ? pages : pages.filter((p) => p.selected);
  if (pagesToConvert.length === 0) {
    announce(t('alerts.noFile'));
    return;
  }

  isConverting = true;
  btnConvert.disabled = true;
  btnDownload.hidden = true;
  resultInfo.hidden = true;
  progressContainer.hidden = false;

  // Revoke object URLs from previous conversions to prevent memory leaks
  for (const img of convertedImages) {
    if (img.url) URL.revokeObjectURL(img.url);
  }
  convertedImages = [];
  const quality = getQualityValue(selectedQuality);
  const scale = selectedScale;
  const format = selectedFormat;
  const ext = format === 'png' ? 'png' : 'jpg';
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const baseName = pdfFile.name.replace(/\.pdf$/i, '');

  try {
    for (let i = 0; i < pagesToConvert.length; i++) {
      const page = pagesToConvert[i];
      const pdfPage = await pdfDoc.getPage(page.pageNum);
      let viewport = pdfPage.getViewport({ scale });

      // Mobile Safari canvas limit: ~16.7 megapixels (4096×4096).
      // Auto-reduce scale if the canvas would exceed the limit.
      const MAX_CANVAS_PIXELS = 16700000;
      let effectiveScale = scale;
      const totalPixels = Math.ceil(viewport.width) * Math.ceil(viewport.height);
      if (totalPixels > MAX_CANVAS_PIXELS) {
        effectiveScale = scale * Math.sqrt(MAX_CANVAS_PIXELS / totalPixels);
        viewport = pdfPage.getViewport({ scale: effectiveScale });
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');

      // White background for JPEG (transparency becomes black otherwise)
      if (format === 'jpg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      await pdfPage.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, mimeType, format === 'jpg' ? quality : undefined);
      });

      const name = `${baseName}_page_${String(i + 1).padStart(2, '0')}.${ext}`;
      const url = URL.createObjectURL(blob);
      convertedImages.push({ name, blob, url });

      // Update progress
      const percent = Math.round(((i + 1) / pagesToConvert.length) * 100);
      progressFill.style.width = `${percent}%`;
      progressPercent.textContent = `${percent}%`;
      progressBar.setAttribute('aria-valuenow', String(percent));
      progressText.textContent = t('progress.page', {
        current: i + 1,
        total: pagesToConvert.length,
      });
      announce(t('progress.page', { current: i + 1, total: pagesToConvert.length }));
    }

    // Done
    progressContainer.hidden = true;
    btnConvert.hidden = true;
    btnDownload.hidden = false;
    resultInfo.hidden = false;
    resultInfo.querySelector('span').textContent = t('result.imageCount', {
      count: convertedImages.length,
    });
    announce(t('alerts.success'));

    // If only 1 image, download directly. Otherwise show ZIP button.
    if (convertedImages.length === 1) {
      btnDownload.querySelector('span').textContent = t('btn.download');
    } else {
      btnDownload.querySelector('span').textContent = t('btn.downloadZip');
    }
  } catch (err) {
    console.error('Conversion error:', err);
    announce(t('alerts.error', { msg: err.message }));
    progressContainer.hidden = true;
    btnConvert.disabled = false;
  } finally {
    isConverting = false;
  }
}

async function downloadResults() {
  if (convertedImages.length === 0) return;

  if (convertedImages.length === 1) {
    downloadBlob(convertedImages[0].blob, convertedImages[0].name);
    return;
  }

  // Convert blobs to Uint8Array then create ZIP via fflate
  try {
    const items = await Promise.all(
      convertedImages.map(async (img) => ({
        name: img.name,
        data: new Uint8Array(await img.blob.arrayBuffer()),
      })),
    );
    const z = {};
    for (const item of items) z[item.name] = item.data;
    const zipBlob = new Blob([zipSync(z)], { type: 'application/zip' });
    downloadBlob(zipBlob, `${pdfFile.name.replace(/\.pdf$/i, '')}_images.zip`);
  } catch (err) {
    console.error('ZIP creation error:', err);
    announce(t('alerts.error', { msg: err.message }));
  }
}

// ===== Reset =====
function reset() {
  // Cleanup
  for (const img of convertedImages) {
    if (img.url) URL.revokeObjectURL(img.url);
  }

  pdfFile = null;
  pdfDoc = null;
  pages = [];
  convertedImages = [];
  isConverting = false;

  dropzone.hidden = false;
  workspace.hidden = true;
  progressContainer.hidden = true;
  btnDownload.hidden = true;
  resultInfo.hidden = true;
  btnConvert.hidden = false;
  btnConvert.disabled = true;
  fileInput.value = '';
}

// ===== Event Handlers =====

// Dropzone click
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});

// Drag & drop on dropzone
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dropzone--active');
});
dropzone.addEventListener('dragleave', (e) => {
  // Only deactivate when leaving the dropzone itself (not child elements)
  if (e.target === dropzone) {
    dropzone.classList.remove('dropzone--active');
  }
});
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dropzone--active');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
});

// File input
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFileSelect(file);
});

function handleFileSelect(file) {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    announce(t('alerts.invalidType'));
    return;
  }
  loadPdf(file).catch((err) => {
    console.error(err);
    announce(t('alerts.error', { msg: err.message }));
  });
}

// ===== Radio group keyboard navigation (arrow keys) =====
/**
 * WAI-ARIA radiogroup pattern: Arrow Up/Left = previous, Arrow Down/Right = next,
 * Home = first, End = last. The active radio receives tabindex=0, others tabindex=-1.
 */
function setupRadioGroupKeyboard(selector) {
  document.querySelectorAll(selector).forEach((group) => {
    const radios = Array.from(group.querySelectorAll('[role="radio"]'));
    if (radios.length === 0) return;

    group.addEventListener('keydown', (e) => {
      const currentIdx = radios.findIndex((r) => r.getAttribute('aria-checked') === 'true');
      let newIdx = currentIdx;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        newIdx = (currentIdx + 1) % radios.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        newIdx = (currentIdx - 1 + radios.length) % radios.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        newIdx = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        newIdx = radios.length - 1;
      }

      if (newIdx !== currentIdx) {
        radios[newIdx].focus();
        radios[newIdx].click();
      }
    });
  });
}

// Format selector
document.querySelectorAll('[data-format]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-format]').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
      b.setAttribute('tabindex', '-1');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-checked', 'true');
    btn.setAttribute('tabindex', '0');
    selectedFormat = btn.dataset.format;
    qualityGroup.hidden = selectedFormat !== 'jpg';
  });
});

// Quality selector
document.querySelectorAll('[data-quality]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-quality]').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
      b.setAttribute('tabindex', '-1');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-checked', 'true');
    btn.setAttribute('tabindex', '0');
    selectedQuality = btn.dataset.quality;
  });
});

// Pages mode selector
document.querySelectorAll('[data-pages]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-pages]').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
      b.setAttribute('tabindex', '-1');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-checked', 'true');
    btn.setAttribute('tabindex', '0');
    selectedPagesMode = btn.dataset.pages;
  });
});

// Enable arrow-key navigation for all radiogroups
setupRadioGroupKeyboard('[role="radiogroup"]');

// Scale selector
scaleSelect.addEventListener('change', () => {
  selectedScale = parseFloat(scaleSelect.value);
});

// Select/deselect all
btnSelectAll.addEventListener('click', () => {
  for (const p of pages) p.selected = true;
  for (const cb of pagesGrid.querySelectorAll('.page-card__checkbox')) {
    cb.checked = true;
    cb.closest('.page-card').classList.add('page-card--selected');
  }
  updateConvertButton();
});

btnDeselectAll.addEventListener('click', () => {
  for (const p of pages) p.selected = false;
  for (const cb of pagesGrid.querySelectorAll('.page-card__checkbox')) {
    cb.checked = false;
    cb.closest('.page-card').classList.remove('page-card--selected');
  }
  updateConvertButton();
});

// Buttons
btnConvert.addEventListener('click', convertToImages);
btnDownload.addEventListener('click', downloadResults);
btnReset.addEventListener('click', reset);

// ===== Collapsible sections =====
document.querySelectorAll('.control-group__title').forEach((title) => {
  title.addEventListener('click', () => {
    const body = title.nextElementSibling;
    const isOpen = body && !body.hidden;
    if (body) body.hidden = isOpen;
    title.setAttribute('aria-expanded', String(!isOpen));
  });
  title.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      title.click();
    }
  });
});

// ===== Init =====
initI18n();
