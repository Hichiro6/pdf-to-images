# Tests E2E — pdf-to-images

Suite de tests end-to-end Playwright pour l'application **pdf-to-images**.

## Structure

```
tests/e2e/
├── .gitignore                  # Ignore fixtures/, downloads/, artifacts/
├── README.md                   # Ce fichier
├── globalSetup.js              # Injection de la locale FR via localStorage
├── helpers/
│   ├── test-fixtures-gen.js    # Génération de PDFs de test (pdf-lib)
│   └── test-utils.js           # Utilitaires: upload, attente, sélection
├── 01-upload.spec.js           # Upload et chargement PDF
├── 02-ui-controls.spec.js     # Contrôles UI (format, qualité, échelle, pages)
├── 03-conversion.spec.js       # Processus de conversion
├── 04-download.spec.js         # Téléchargement (image unique + ZIP)
├── 05-non-regression.spec.js   # Non-régression et workflow complet
└── 06-edge-cases.spec.js        # Cas limites et validation
```

## Configuration

- **Config Playwright** : `playwright.config.js` (racine du projet)
- **BaseURL** : `http://localhost:5173` (serveur Vite dev)
- **Navigateurs** : Chromium, Firefox, WebKit
- **Locale** : `fr-FR` (forcée via `globalSetup.js`)
- **Storage key** : `pdftoimages_lang`

## Exécution

```bash
# Tous les tests E2E
npx playwright test

# Un fichier spécifique
npx playwright test tests/e2e/01-upload.spec.js

# Mode headed (visible)
npx playwright test --headed

# Un navigateur spécifique
npx playwright test --project=chromium

# Avec rapport HTML
npx playwright test --reporter=html
```

## Specs

### 01-upload.spec.js — Upload et chargement
- Upload PDF valide → workspace visible
- Affichage du nom du fichier
- Génération des thumbnails
- PDF multi-pages → nombre de cartes correct
- Bouton reset → retour à l'état initial

### 02-ui-controls.spec.js — Contrôles UI
- Sélecteur de format PNG/JPEG (toggle, état actif, visibilité quality group)
- Sélecteur de qualité low/medium/high
- Sélecteur d'échelle 1x/1.5x/2x/3x
- Mode pages: toutes / sélectionnées
- Boutons select-all / deselect-all
- Checkboxes individuelles
- Sections repliables
- État du bouton convert selon sélection

### 03-conversion.spec.js — Conversion
- Conversion PDF → PNG (multi-pages)
- Conversion PDF → JPEG
- Barre de progression visible
- Bouton download apparaît après conversion
- Info résultat (nombre d'images)
- Conversion pages sélectionnées uniquement
- Conversion avec échelle 3x
- Bouton convert désactivé pendant traitement
- Conversion + reset

### 04-download.spec.js — Téléchargement
- Téléchargement image unique (PNG)
- Téléchargement ZIP (multi-pages)
- Vérification magic bytes PNG/JPEG/ZIP
- Nom du fichier contient le nom du PDF source
- Pas d'erreurs console
- Double téléchargement

### 05-non-regression.spec.js — Non-régression
- Guards: convert sans PDF, download sans conversion
- Respect de la sélection de pages
- Nombre d'images = nombre de pages
- Ordre des pages préservé dans le ZIP
- Locale FR appliquée (i18n)
- Workflow complet: upload → convert → download → reset → re-upload
- PDF avec contenu riche
- Sélecteur de langue

### 06-edge-cases.spec.js — Cas limites
- Upload fichier non-PDF (.txt, .jpg)
- PDF corrompu
- PDF volumineux (60 pages)
- Drag & drop de pages
- Double-click sur dropzone
- Changement rapide de format
- Conversion interrompue par reset
- A11y: aria-live, navigation Tab
- Responsive (viewport mobile)

## Helpers

### test-fixtures-gen.js
Génère des PDFs de test programmatiquement avec `pdf-lib` :
- `createTestPdf(options)` — PDF simple avec texte
- `createRichPdf(options)` — PDF avec formes géométriques
- `createMultiPagePdf(numPages, filename)` — PDF multi-pages

### test-utils.js
Utilitaires de test Playwright :
- `uploadTestPdf(page, filename)` — Upload un PDF et attend le workspace
- `waitForThumbnails(page, timeout)` — Attend la stabilisation des thumbnails
- `waitForConversion(page, timeout)` — Attend la fin de la conversion
- `getPageCardCount(page)` — Retourne le nombre de page cards
- `getFixturePath(filename)` — Retourne le chemin d'une fixture

## Notes

- Les fixtures sont générées à l'exécution dans `tests/e2e/fixtures/` (ignoré par git)
- Les téléchargements vont dans `tests/e2e/downloads/` (ignoré par git)
- Les artefacts Playwright (screenshots, traces) dans `tests/e2e/artifacts/`
- Tous les fichiers utilisent la syntaxe ESM (`import/export`)
