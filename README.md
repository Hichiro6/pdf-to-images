# PDF to Images

> Convert PDF pages to PNG or JPEG images in your browser — 100% client-side, privacy-first

<div align="center">

![License](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-red)
![Platform](https://img.shields.io/badge/Platform-Web-green)
![Tests](https://img.shields.io/badge/Tests-Playwright%20%7C%20Vitest-blue)

**Your files never leave your browser — no uploads, no servers, no tracking**

</div>

---

## 🔒 Privacy-First Design

Need images from a PDF? Extract pages for editing, presentation, or annotation?

PDF to Images renders every page of your PDF to **PNG or JPEG locally in your browser** using [PDF.js](https://mozilla.github.io/pdf.js/) and the Canvas API. Your files stay on your device — nothing is uploaded to any server.

---

## ⚡ Key Features

- **📄 Drag & Drop** — Upload any PDF file
- **🖼️ Page Thumbnails** — Live preview of every page
- **🔀 Reorder Pages** — Drag-and-drop pages before export
- **☑️ Select / Deselect** — Export only the pages you need
- **🎨 Format Choice** — PNG (lossless) or JPEG (smaller files)
- **📐 Quality Control** — Low / Medium / High for JPEG output
- **🔍 Scale / DPI** — Render at 1× / 1.5× / 2× / 3× for sharp prints
- **📦 Bulk Download** — Download all images as a single ZIP (via [fflate](https://github.com/101arrowz/fflate))
- **🌐 7 Languages** — EN, FR, DE, ES, PT, NL, IT
- **🔒 Privacy-First** — Everything runs in your browser, nothing is uploaded

---

## 🚀 Quick Start

```bash
git clone https://github.com/Hichiro6/pdf-to-images.git
cd pdf-to-images

npm install
npm run dev
```

---

## 📖 Usage Guide

### Step 1: Upload Your PDF
Drag and drop a PDF onto the dropzone (or click to browse). All pages appear as thumbnails.

### Step 2: Choose Your Pages & Settings
- **Reorder** or **deselect** pages you don't need
- **Pick a format**: PNG or JPEG
- **Set quality** (JPEG only): Low / Medium / High
- **Choose a scale**: 1× (screen) up to 3× (print-ready)

### Step 3: Convert & Download
Click **Convert** to render the pages, then **Download** — either individual images or a single ZIP archive.

---

## 🛠️ Technical Stack

| Technology | Purpose |
|------------|---------|
| **[Vite](https://vitejs.dev/)** | Build tool & dev server |
| **[PDF.js](https://mozilla.github.io/pdf.js/)** | PDF rendering to canvas |
| **[fflate](https://github.com/101arrowz/fflate)** | Fast ZIP compression for bulk downloads |
| **[Biome](https://biomejs.dev/)** | Linting & formatting |
| **[Vitest](https://vitest.dev/)** | Unit testing |
| **[Playwright](https://playwright.dev/)** | E2E testing |

---

## 🧪 Testing

```bash
npm run test:run       # Unit tests
npm run test:e2e       # E2E suite (upload, controls, conversion, download, edge cases)
npm run test:ui        # Interactive mode
```

---

## 📂 Project Structure

```
pdf-to-images/
├── src/
│   ├── main.js           # Application logic
│   └── i18n.js           # Internationalization
├── styles/
│   └── main.css          # Global styles
├── public/
│   ├── manifest.json     # PWA manifest
│   └── favicon.svg
├── tests/
│   ├── unit/             # Unit tests
│   └── e2e/              # Playwright E2E tests + fixtures
├── vite.config.js        # Vite configuration
├── playwright.config.js  # Playwright configuration
└── biome.json            # Biome linting rules
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code with Biome |
| `npm run format` | Format code with Biome |
| `npm run test:run` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |

---

## 📝 Use Cases

- **Editing** — Extract a page to annotate in a graphics app
- **Presentations** — Turn report pages into slides or images
- **Print prep** — Render pages at 3× for high-resolution printing
- **Web content** — Convert document pages to optimized JPEGs
- **Comparison** — Snapshot document pages for version tracking

---

## 🔐 Security & Privacy

- ✅ **No network calls** — All processing is local
- ✅ **No analytics** — No tracking or telemetry
- ✅ **No cookies** — Nothing stored externally
- ✅ **Open source** — Code is auditable
- ✅ **Client-side only** — No backend requirements

---

## 📄 License

Copyright © 2026 Hichiro6

Licensed under **CC BY-NC-ND 4.0** — Non-commercial use with attribution, no derivative works.

See [LICENSE](LICENSE) for details.

---

<div align="center">

**Made with ❤️ for privacy-conscious users**

[Report Bug](https://github.com/Hichiro6/pdf-to-images/issues) · [Request Feature](https://github.com/Hichiro6/pdf-to-images/issues)

</div>
