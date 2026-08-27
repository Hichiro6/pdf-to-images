/**
 * PDF to Images - i18n System
 * Languages: EN (default), FR, DE, ES, PT, NL, IT
 *
 * API:
 *   initI18n()              - Initialize language on startup
 *   setLanguage(lang, cb)   - Change language
 *   getCurrentLanguage()    - Get current language code
 *   t(key, params)          - Get translated string with param substitution
 */

export const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  es: { name: 'Español', flag: '🇪🇸' },
  pt: { name: 'Português', flag: '🇵🇹' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
  it: { name: 'Italiano', flag: '🇮🇹' },
};

const STORAGE_KEY = 'pdftoimages_lang';
let currentLang = 'en';

export const TRANSLATIONS = {
  en: {
    'app.title': 'PDF to Images — Convert your PDF to images',
    'header.tagline': 'Convert PDF pages to images in your browser',
    'privacy.badge': '🔒 100% local — your files never leave your browser',
    'dropzone.title': 'Drop your PDF here',
    'dropzone.subtitle': 'or click to select a file',
    'controls.format': 'Output format',
    'controls.quality': 'Quality',
    'controls.scale': 'Scale / DPI',
    'controls.pages': 'Pages to convert',
    'format.png': 'PNG — Lossless, larger files',
    'format.jpg': 'JPEG — Smaller files, adjustable quality',
    'quality.low': 'Low — Faster, smaller',
    'quality.medium': 'Medium — Balanced',
    'quality.high': 'High — Better quality, larger',
    'pages.all': 'All pages',
    'pages.custom': 'Custom range',
    'btn.convert': 'Convert to Images',
    'btn.reset': 'Reset',
    'btn.download': 'Download image',
    'btn.downloadZip': 'Download ZIP',
    'btn.selectFile': 'Select PDF file',
    'alerts.noFile': 'Please select a PDF file.',
    'alerts.invalidType': 'Only PDF files are supported.',
    'alerts.error': 'Conversion error: {msg}',
    'alerts.success': 'PDF converted successfully!',
    'progress.converting': 'Converting PDF...',
    'progress.page': 'Converting page {current} of {total}...',
    'result.imageCount': '{count} images created',
    'lang.label': 'Language',
  },

  fr: {
    'app.title': 'PDF to Images — Convertissez vos PDF en images',
    'header.tagline': 'Convertissez vos pages PDF en images dans votre navigateur',
    'privacy.badge': '🔒 100% local — vos fichiers ne quittent jamais votre navigateur',
    'dropzone.title': 'Déposez votre PDF ici',
    'dropzone.subtitle': 'ou cliquez pour sélectionner un fichier',
    'controls.format': 'Format de sortie',
    'controls.quality': 'Qualité',
    'controls.scale': 'Échelle / DPI',
    'controls.pages': 'Pages à convertir',
    'format.png': 'PNG — Sans perte, fichiers plus volumineux',
    'format.jpg': 'JPEG — Fichiers plus petits, qualité ajustable',
    'quality.low': 'Faible — Plus rapide, plus petit',
    'quality.medium': 'Moyenne — Équilibré',
    'quality.high': 'Élevée — Meilleure qualité, plus volumineux',
    'pages.all': 'Toutes les pages',
    'pages.custom': 'Plage personnalisée',
    'btn.convert': 'Convertir en images',
    'btn.reset': 'Réinitialiser',
    'btn.download': 'Télécharger l\'image',
    'btn.downloadZip': 'Télécharger le ZIP',
    'btn.selectFile': 'Sélectionner un PDF',
    'alerts.noFile': 'Veuillez sélectionner un fichier PDF.',
    'alerts.invalidType': 'Seuls les fichiers PDF sont pris en charge.',
    'alerts.error': 'Erreur de conversion : {msg}',
    'alerts.success': 'PDF converti avec succès !',
    'progress.converting': 'Conversion du PDF...',
    'progress.page': 'Conversion de la page {current} sur {total}...',
    'result.imageCount': '{count} images créées',
    'lang.label': 'Langue',
  },

  de: {
    'app.title': 'PDF to Images — PDF in Bilder konvertieren',
    'header.tagline': 'Konvertieren Sie PDF-Seiten in Bilder im Browser',
    'privacy.badge': '🔒 100% lokal — Ihre Dateien verlassen nie den Browser',
    'dropzone.title': 'Legen Sie Ihr PDF hier ab',
    'dropzone.subtitle': 'oder klicken Sie, um eine Datei auszuwählen',
    'controls.format': 'Ausgabeformat',
    'controls.quality': 'Qualität',
    'controls.scale': 'Skalierung / DPI',
    'controls.pages': 'Zu konvertierende Seiten',
    'format.png': 'PNG — Verlustfrei, größere Dateien',
    'format.jpg': 'JPEG — Kleinere Dateien, einstellbare Qualität',
    'quality.low': 'Niedrig — Schneller, kleiner',
    'quality.medium': 'Mittel — Ausgewogen',
    'quality.high': 'Hoch — Bessere Qualität, größer',
    'pages.all': 'Alle Seiten',
    'pages.custom': 'Benutzerdefinierter Bereich',
    'btn.convert': 'In Bilder konvertieren',
    'btn.reset': 'Zurücksetzen',
    'btn.download': 'Bild herunterladen',
    'btn.downloadZip': 'ZIP herunterladen',
    'btn.selectFile': 'PDF auswählen',
    'alerts.noFile': 'Bitte wählen Sie eine PDF-Datei aus.',
    'alerts.invalidType': 'Nur PDF-Dateien werden unterstützt.',
    'alerts.error': 'Konvertierungsfehler: {msg}',
    'alerts.success': 'PDF erfolgreich konvertiert!',
    'progress.converting': 'PDF wird konvertiert...',
    'progress.page': 'Seite {current} von {total} wird konvertiert...',
    'result.imageCount': '{count} Bilder erstellt',
    'lang.label': 'Sprache',
  },

  es: {
    'app.title': 'PDF to Images — Convierte tu PDF a imágenes',
    'header.tagline': 'Convierte páginas PDF a imágenes en el navegador',
    'privacy.badge': '🔒 100% local — tus archivos nunca salen del navegador',
    'dropzone.title': 'Deja tu PDF aquí',
    'dropzone.subtitle': 'o haz clic para seleccionar un archivo',
    'controls.format': 'Formato de salida',
    'controls.quality': 'Calidad',
    'controls.scale': 'Escala / DPI',
    'controls.pages': 'Páginas a convertir',
    'format.png': 'PNG — Sin pérdida, archivos más grandes',
    'format.jpg': 'JPEG — Archivos más pequeños, calidad ajustable',
    'quality.low': 'Baja — Más rápido, más pequeño',
    'quality.medium': 'Media — Equilibrado',
    'quality.high': 'Alta — Mejor calidad, más grande',
    'pages.all': 'Todas las páginas',
    'pages.custom': 'Rango personalizado',
    'btn.convert': 'Convertir a imágenes',
    'btn.reset': 'Reiniciar',
    'btn.download': 'Descargar imagen',
    'btn.downloadZip': 'Descargar ZIP',
    'btn.selectFile': 'Seleccionar PDF',
    'alerts.noFile': 'Por favor, selecciona un archivo PDF.',
    'alerts.invalidType': 'Solo se admiten archivos PDF.',
    'alerts.error': 'Error de conversión: {msg}',
    'alerts.success': '¡PDF convertido con éxito!',
    'progress.converting': 'Convirtiendo PDF...',
    'progress.page': 'Convirtiendo página {current} de {total}...',
    'result.imageCount': '{count} imágenes creadas',
    'lang.label': 'Idioma',
  },

  pt: {
    'app.title': 'PDF to Images — Converta seu PDF em imagens',
    'header.tagline': 'Converta páginas PDF em imagens no navegador',
    'privacy.badge': '🔒 100% local — seus arquivos nunca saem do navegador',
    'dropzone.title': 'Solte seu PDF aqui',
    'dropzone.subtitle': 'ou clique para selecionar um arquivo',
    'controls.format': 'Formato de saída',
    'controls.quality': 'Qualidade',
    'controls.scale': 'Escala / DPI',
    'controls.pages': 'Páginas para converter',
    'format.png': 'PNG — Sem perdas, arquivos maiores',
    'format.jpg': 'JPEG — Arquivos menores, qualidade ajustável',
    'quality.low': 'Baixa — Mais rápido, menor',
    'quality.medium': 'Média — Equilibrado',
    'quality.high': 'Alta — Melhor qualidade, maior',
    'pages.all': 'Todas as páginas',
    'pages.custom': 'Intervalo personalizado',
    'btn.convert': 'Converter em imagens',
    'btn.reset': 'Redefinir',
    'btn.download': 'Baixar imagem',
    'btn.downloadZip': 'Baixar ZIP',
    'btn.selectFile': 'Selecionar PDF',
    'alerts.noFile': 'Por favor, selecione um arquivo PDF.',
    'alerts.invalidType': 'Apenas arquivos PDF são suportados.',
    'alerts.error': 'Erro de conversão: {msg}',
    'alerts.success': 'PDF convertido com sucesso!',
    'progress.converting': 'Convertendo PDF...',
    'progress.page': 'Convertendo página {current} de {total}...',
    'result.imageCount': '{count} imagens criadas',
    'lang.label': 'Idioma',
  },

  nl: {
    'app.title': 'PDF to Images — Converteer uw PDF naar afbeeldingen',
    'header.tagline': 'Converteer PDF-pagina\'s naar afbeeldingen in uw browser',
    'privacy.badge': '🔒 100% lokaal — uw bestanden verlaten nooit uw browser',
    'dropzone.title': 'Sleep uw PDF hierheen',
    'dropzone.subtitle': 'of klik om een bestand te selecteren',
    'controls.format': 'Uitvoerformaat',
    'controls.quality': 'Kwaliteit',
    'controls.scale': 'Schaal / DPI',
    'controls.pages': 'Te converteren pagina\'s',
    'format.png': 'PNG — Verliesvrij, grotere bestanden',
    'format.jpg': 'JPEG — Kleinere bestanden, instelbare kwaliteit',
    'quality.low': 'Laag — Sneller, kleiner',
    'quality.medium': 'Gemiddeld — Gebalanceerd',
    'quality.high': 'Hoog — Betere kwaliteit, groter',
    'pages.all': 'Alle pagina\'s',
    'pages.custom': 'Aangepast bereik',
    'btn.convert': 'Converteren naar afbeeldingen',
    'btn.reset': 'Opnieuw',
    'btn.download': 'Afbeelding downloaden',
    'btn.downloadZip': 'ZIP downloaden',
    'btn.selectFile': 'PDF selecteren',
    'alerts.noFile': 'Selecteer een PDF-bestand.',
    'alerts.invalidType': 'Alleen PDF-bestanden worden ondersteund.',
    'alerts.error': 'Conversiefout: {msg}',
    'alerts.success': 'PDF succesvol geconverteerd!',
    'progress.converting': 'PDF converteren...',
    'progress.page': 'Pagina {current} van {total} converteren...',
    'result.imageCount': '{count} afbeeldingen gemaakt',
    'lang.label': 'Taal',
  },

  it: {
    'app.title': 'PDF to Images — Converti il tuo PDF in immagini',
    'header.tagline': 'Converti pagine PDF in immagini nel browser',
    'privacy.badge': '🔒 100% locale — i tuoi file non lasciano mai il browser',
    'dropzone.title': 'Trascina qui il tuo PDF',
    'dropzone.subtitle': 'o clicca per selezionare un file',
    'controls.format': 'Formato di output',
    'controls.quality': 'Qualità',
    'controls.scale': 'Scala / DPI',
    'controls.pages': 'Pagine da convertire',
    'format.png': 'PNG — Senza perdita, file più grandi',
    'format.jpg': 'JPEG — File più piccoli, qualità regolabile',
    'quality.low': 'Bassa — Più veloce, più piccolo',
    'quality.medium': 'Media — Equilibrato',
    'quality.high': 'Alta — Migliore qualità, più grande',
    'pages.all': 'Tutte le pagine',
    'pages.custom': 'Intervallo personalizzato',
    'btn.convert': 'Converti in immagini',
    'btn.reset': 'Ripristina',
    'btn.download': 'Scarica immagine',
    'btn.downloadZip': 'Scarica ZIP',
    'btn.selectFile': 'Seleziona PDF',
    'alerts.noFile': 'Seleziona un file PDF.',
    'alerts.invalidType': 'Solo i file PDF sono supportati.',
    'alerts.error': 'Errore di conversione: {msg}',
    'alerts.success': 'PDF convertito con successo!',
    'progress.converting': 'Conversione del PDF...',
    'progress.page': 'Conversione della pagina {current} su {total}...',
    'result.imageCount': '{count} immagini create',
    'lang.label': 'Lingua',
  },
};

/**
 * Translate a key with optional parameter substitution.
 * @param {string} key - Translation key (e.g. 'alerts.error')
 * @param {Object} params - Parameters to substitute (e.g. { msg: 'error' })
 * @returns {string} Translated string
 */
export function t(key, params = {}) {
  const lang = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  let str = lang[key] || TRANSLATIONS.en[key] || key;

  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{${k}}`, String(v));
  }

  return str;
}

/**
 * Get the current language code.
 * @returns {string} Current language code (e.g. 'en', 'fr')
 */
export function getCurrentLanguage() {
  return currentLang;
}

/**
 * Apply translations to all data-i18n elements in the DOM.
 */
function applyTranslations() {
  // data-i18n: textContent
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });

  // data-i18n-title: title attribute
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) {
      el.setAttribute('title', t(key));
    }
  });

  // data-i18n-aria-label: aria-label attribute
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) {
      el.setAttribute('aria-label', t(key));
    }
  });

  // Update document title and lang attribute
  document.title = t('app.title');
  document.documentElement.lang = currentLang;
}

/**
 * Set the current language, persist to localStorage, and apply translations.
 * @param {string} lang - Language code (e.g. 'fr', 'de')
 * @param {Function} [callback] - Optional callback after language change
 */
export function setLanguage(lang, callback) {
  if (!LANGUAGES[lang]) {
    console.warn(`Unknown language: ${lang}, falling back to 'en'`);
    lang = 'en';
  }

  currentLang = lang;

  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    // localStorage might be unavailable (private browsing)
  }

  applyTranslations();

  if (typeof callback === 'function') {
    callback(lang);
  }
}

/**
 * Create the language selector buttons and append to header.
 */
function createLanguageSelector() {
  const header = document.querySelector('.header');
  if (!header) return;

  // Remove existing selector if any
  const existing = header.querySelector('.lang-selector');
  if (existing) existing.remove();

  const selector = document.createElement('div');
  selector.className = 'lang-selector';
  selector.setAttribute('role', 'group');
  selector.setAttribute('aria-label', t('lang.label'));

  for (const [code, info] of Object.entries(LANGUAGES)) {
    const btn = document.createElement('button');
    btn.className = 'lang-btn';
    btn.textContent = info.flag;
    btn.title = info.name;
    btn.setAttribute('aria-label', info.name);
    btn.setAttribute('data-lang', code);
    if (code === currentLang) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.setAttribute('aria-pressed', 'false');
    }

    btn.addEventListener('click', () => {
      // Update active states
      selector.querySelectorAll('.lang-btn').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      setLanguage(code);
    });

    selector.appendChild(btn);
  }

  header.appendChild(selector);
}

/**
 * Initialize i18n on app startup.
 * Loads saved language from localStorage, defaults to 'en'.
 */
export function initI18n() {
  let savedLang = 'en';

  try {
    savedLang = localStorage.getItem(STORAGE_KEY) || 'en';
  } catch (e) {
    // localStorage unavailable
  }

  if (!LANGUAGES[savedLang]) {
    savedLang = 'en';
  }

  currentLang = savedLang;
  applyTranslations();
  createLanguageSelector();
}
