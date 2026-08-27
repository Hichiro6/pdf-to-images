# PDF to Images

Convert PDF pages to PNG or JPEG images — 100% client-side, no uploads, no servers.

## Features

- 📄 **Drag & drop** PDF upload
- 🖼️ **Page thumbnails** with live preview
- 🔀 **Reorder pages** via drag-and-drop before export
- ☑️ **Select/deselect** individual pages for export
- 🎨 **Format selector**: PNG or JPEG
- 📐 **Quality control**: Low / Medium / High (JPEG)
- 🔍 **Scale/DPI selector**: 1x / 1.5x / 2x / 3x
- 📦 **Bulk download** as ZIP (via fflate)
- 🌐 **7 languages**: EN, FR, DE, ES, PT, NL, IT
- 🔒 **Privacy-first**: everything runs in your browser, nothing is uploaded

## Tech Stack

- [Vite](https://vitejs.dev/) — build tool
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) — PDF rendering
- [fflate](https://github.com/101arrowz/fflate) — ZIP compression
- [Vitest](https://vitest.dev/) — unit tests

## Development

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm run test     # unit tests
```

## Privacy

No data leaves your browser. PDF files are processed entirely client-side using WebAssembly-based PDF.js. No analytics, no tracking, no server-side processing.
