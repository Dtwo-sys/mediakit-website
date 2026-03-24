/**
 * Listen Now Dropdown & Welcome Back Feature
 * Handles track selection, localStorage, and frictionless audio playback
 */

const STORAGE_KEY = 'lastPlayedTrack';

// Track metadata
const tracks = {
  'card-1': { name: 'All Shall Be Well', file: 'audio/all-shall-be-well-trust-shadow-love-meditation.mp3' },
  'card-2': { name: '5 · 4 · 3 · 2 · 1', file: 'audio/5-4-3-2-1.mp3' },
  'card-3': { name: 'Yoga Nidra', file: 'audio/YogaNidra.mp3' },
  'card-4': { name: 'Letting Go — A Meditation on Release', file: 'audio/Wipers.mp3' },
  'card-5': { name: 'Letting Go into the Sea', file: 'audio/Letting_Go.mp3' },
  'card-6': { name: 'Staying with What Is', file: 'audio/Staying.mp3' }
};

// DOM Elements
const listenNowBtn = document.getElementById('listen-now-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
const dropdownItems = document.querySelectorAll('.dropdown-item');
const welcomeBackCta = document.getElementById('welcome-back-cta');
const welcomeBackBtn = document.getElementById('welcome-back-btn');
const welcomeBackTrackName = document.getElementById('welcome-back-track');
const browseAllBtn = document.getElementById('browse-all-btn');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAndInitWelcomeBack();
  attachEventListeners();
});

/**
 * Check if user has a saved track, show Welcome Back UI if so
 */
function checkAndInitWelcomeBack() {
  const savedTrack = localStorage.getItem(STORAGE_KEY);

  if (savedTrack) {
    // Parse saved track info
    let trackInfo;
    try {
      trackInfo = JSON.parse(savedTrack);
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // Show Welcome Back UI
    listenNowBtn.classList.add('hidden');
    dropdownMenu.classList.add('hidden');
    welcomeBackCta.classList.remove('hidden');

    // Populate track name
    welcomeBackTrackName.textContent = trackInfo.name;
    welcomeBackBtn.dataset.cardId = trackInfo.cardId;
    welcomeBackBtn.dataset.trackName = trackInfo.name;
  }
}

/**
 * Attach event listeners to buttons and dropdown items
 */
function attachEventListeners() {
  // Toggle dropdown on "Listen Now" button click
  listenNowBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');
    listenNowBtn.setAttribute('aria-expanded', !dropdownMenu.classList.contains('hidden'));
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!listenNowBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.add('hidden');
      listenNowBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Handle dropdown item clicks
  dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const cardId = item.dataset.cardId;
      const trackName = item.dataset.trackName;
      playTrack(cardId, trackName);
      dropdownMenu.classList.add('hidden');
      listenNowBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Handle Welcome Back button click
  welcomeBackBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const cardId = welcomeBackBtn.dataset.cardId;
    const trackName = welcomeBackBtn.dataset.trackName;
    playTrack(cardId, trackName);
  });

  // Handle "Browse all 6 sessions" button click
  if (browseAllBtn) {
    browseAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const featuredSection = document.getElementById('featured');
      if (featuredSection) {
        const navHeight = 80; // Approximate fixed nav height
        const sectionTop = featuredSection.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: sectionTop,
          behavior: 'smooth'
        });
      }
    });
  }
}

/**
 * Play a track: scroll to card, play audio, save to localStorage
 */
function playTrack(cardId, trackName) {
  // Find the meditation card
  const card = document.getElementById(cardId);
  if (!card) return;

  // Find the audio element within the card
  const audio = card.querySelector('audio');
  if (!audio) return;

  // Save to localStorage
  saveTrackToStorage(cardId, trackName);

  // Smooth scroll to the card
  scrollToCard(card);

  // Attempt to play audio
  playAudio(audio);
}

/**
 * Save track info to localStorage
 */
function saveTrackToStorage(cardId, trackName) {
  const trackInfo = {
    cardId: cardId,
    name: trackName,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trackInfo));
}

/**
 * Smooth scroll to a card with some offset for the fixed nav
 */
function scrollToCard(card) {
  const navHeight = 80; // Approximate fixed nav height
  const cardTop = card.getBoundingClientRect().top + window.scrollY - navHeight;

  window.scrollTo({
    top: cardTop,
    behavior: 'smooth'
  });
}

/**
 * Play audio with error handling
 * Does not autoplay — only plays on user click
 */
function playAudio(audioElement) {
  // Pause all other audio first
  document.querySelectorAll('audio').forEach(a => {
    if (a !== audioElement) {
      a.pause();
    }
  });

  // Attempt to play
  audioElement.play().catch(err => {
    // Graceful failure — user can press play button manually
    console.warn('Audio playback blocked or failed:', err);
  });
}
