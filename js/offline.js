/* ================================================
   Offline Manager — Between the Waves
   - Registers service worker
   - Shows PWA install banner (platform-aware)
   - Manages per-track offline save/remove via Cache API
   ================================================ */

const AUDIO_CACHE = 'btw-audio-v1';
const INSTALL_DISMISSED_KEY = 'btw-install-dismissed';

let installPrompt = null;

/* ── Service Worker registration ── */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

/* ── Capture install prompt (Chrome/Edge/Android) ── */
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installPrompt = e;
  // Only show custom banner on mobile — desktop browsers show their own native install UI
  if (/android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent)) {
    showInstallBanner('prompt');
  }
});

/* ── Utility: detect iOS Safari ── */
function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true;
}

/* ── Resolve relative audio src to absolute URL ── */
function resolveUrl(src) {
  return new URL(src, location.href).href;
}

/* ── Cache API helpers ── */
async function isTrackCached(audioSrc) {
  if (!('caches' in window)) return false;
  const cache = await caches.open(AUDIO_CACHE);
  const match = await cache.match(resolveUrl(audioSrc));
  return !!match;
}

async function saveTrack(audioSrc) {
  const cache = await caches.open(AUDIO_CACHE);
  await cache.add(resolveUrl(audioSrc));
}

async function removeTrack(audioSrc) {
  const cache = await caches.open(AUDIO_CACHE);
  await cache.delete(resolveUrl(audioSrc));
}

/* ── Install banner ── */
function showInstallBanner(type) {
  if (localStorage.getItem(INSTALL_DISMISSED_KEY)) return;
  if (isInStandaloneMode()) return;

  const banner = document.getElementById('install-banner');
  const text   = document.getElementById('install-banner-text');
  const btn    = document.getElementById('install-btn');
  if (!banner || !text) return;

  if (type === 'prompt') {
    text.textContent = 'Save this site to your phone — meditations available without internet.';
    btn.classList.remove('hidden');
  } else if (type === 'ios') {
    text.innerHTML = 'To use offline: tap the <strong>Share</strong> button in your browser, then choose <strong>Add to Home Screen</strong>.';
  }

  banner.classList.remove('hidden');
}

/* ── Offline button UI helpers ── */
function setButtonSaved(btn) {
  btn.classList.remove('is-saving');
  btn.classList.add('is-saved');
  btn.setAttribute('aria-label', 'Saved offline — tap to remove');
  const label = btn.querySelector('.offline-btn-label');
  if (label) label.textContent = 'Saved';
}

function setButtonUnsaved(btn) {
  btn.classList.remove('is-saving', 'is-saved');
  btn.setAttribute('aria-label', 'Save for offline');
  const label = btn.querySelector('.offline-btn-label');
  if (label) label.textContent = 'Save';
}

function setButtonSaving(btn) {
  btn.classList.add('is-saving');
  btn.setAttribute('aria-label', 'Saving…');
  const label = btn.querySelector('.offline-btn-label');
  if (label) label.textContent = '…';
}

/* ── Toast (reuse share.js global if available, else local) ── */
function offlineToast(message) {
  if (typeof showToast === 'function') {
    showToast(message);
    return;
  }
  // Fallback if share.js not loaded
  let toast = document.getElementById('share-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.className = 'share-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2200);
}

/* ── Initialise on DOM ready ── */
document.addEventListener('DOMContentLoaded', () => {

  /* Install banner setup */
  const banner  = document.getElementById('install-banner');
  const btn     = document.getElementById('install-btn');
  const dismiss = document.getElementById('install-dismiss');

  if (dismiss) {
    dismiss.addEventListener('click', () => {
      banner.classList.add('hidden');
      localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
    });
  }

  if (btn) {
    btn.addEventListener('click', async () => {
      if (!installPrompt) return;
      await installPrompt.prompt();
      installPrompt = null;
      banner.classList.add('hidden');
      localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
    });
  }

  /* Show iOS banner if appropriate */
  if (isIos() && !isInStandaloneMode() && !localStorage.getItem(INSTALL_DISMISSED_KEY)) {
    showInstallBanner('ios');
  }

  /* Always show footer install hint on iOS (even if banner was dismissed) */
  if (isIos() && !isInStandaloneMode()) {
    const hint = document.getElementById('footer-install-hint');
    if (hint) hint.style.display = 'block';
  }

  /* Offline save buttons */
  if (!('caches' in window)) return; // Cache API not supported — skip

  document.querySelectorAll('.offline-btn').forEach(async offlineBtn => {
    const audioSrc = offlineBtn.dataset.audioSrc;
    if (!audioSrc) return;

    // Set initial state
    if (await isTrackCached(audioSrc)) {
      setButtonSaved(offlineBtn);
    }

    offlineBtn.addEventListener('click', async () => {
      const alreadySaved = offlineBtn.classList.contains('is-saved');

      if (alreadySaved) {
        await removeTrack(audioSrc);
        setButtonUnsaved(offlineBtn);
        offlineToast('Removed from offline saves');
      } else {
        setButtonSaving(offlineBtn);
        try {
          await saveTrack(audioSrc);
          setButtonSaved(offlineBtn);
          offlineToast('Saved for offline listening');
        } catch {
          setButtonUnsaved(offlineBtn);
          offlineToast('Could not save — check your connection');
        }
      }
    });
  });
});
