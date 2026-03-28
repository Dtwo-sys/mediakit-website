/* ================================================
   Custom Audio Player — mediakit-website
   ================================================ */

(function () {
  'use strict';

  /* Track currently active player so only one plays at a time */
  let currentPlayer = null;

  function initPlayers() {
    document.querySelectorAll('.player').forEach(setupPlayer);
  }

  function setupPlayer(playerEl) {
    const audio       = playerEl.querySelector('audio');
    const btnPlay     = playerEl.querySelector('.btn-play');
    const progressWrap= playerEl.querySelector('.progress-wrap');
    const progressFill= playerEl.querySelector('.progress-fill');
    const timeEl      = playerEl.querySelector('.player-time');
    const volSlider   = playerEl.querySelector('.vol-slider');

    if (!audio || !btnPlay) return;

    /* ── Play / Pause ── */
    btnPlay.addEventListener('click', () => {
      if (audio.paused) {
        /* Pause any other active player */
        if (currentPlayer && currentPlayer !== audio) {
          currentPlayer.pause();
          syncPlayIcon(currentPlayer, false);
        }
        audio.play();
        currentPlayer = audio;
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play',  () => syncPlayIcon(audio, true));
    audio.addEventListener('pause', () => syncPlayIcon(audio, false));
    audio.addEventListener('ended', () => syncPlayIcon(audio, false));

    /* ── Progress bar ── */
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      timeEl.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
    });

    audio.addEventListener('loadedmetadata', () => {
      timeEl.textContent = '0:00 / ' + formatTime(audio.duration);
    });

    progressWrap.addEventListener('click', (e) => {
      const rect = progressWrap.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    /* ── Volume ── */
    if (volSlider) {
      volSlider.value = audio.volume;
      volSlider.addEventListener('input', () => {
        audio.volume = volSlider.value;
      });
    }
  }

  function syncPlayIcon(audio, playing) {
    const playerEl = audio.closest('.player');
    if (!playerEl) return;
    const btn = playerEl.querySelector('.btn-play');
    if (!btn) return;
    btn.innerHTML = playing
      ? `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Pause`
      : `<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>Play`;
    btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  function formatTime(secs) {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return m + ':' + s;
  }

  /* ── Filter tabs (meditations page) ── */
  function initFilters() {
    const tabs = document.querySelectorAll('.filter-btn');
    const cards= document.querySelectorAll('.meditation-card');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;
        cards.forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ── Mobile nav toggle ── */
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links  = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });

    /* Close on link click */
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initPlayers();
    initFilters();
    initNav();
  });
})();
