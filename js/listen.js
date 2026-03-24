/**
 * Listen Now Dropdown & Welcome Back Feature
 * Handles track selection, localStorage, and frictionless audio playback
 */

const STORAGE_KEY = 'lastPlayedTrack';

// Track metadata
const tracks = {
  'card-1': { name: 'All Shall Be Well', intent: 'Turning Inward', duration: '24 min', file: 'audio/all-shall-be-well-trust-shadow-love-meditation.mp3' },
  'card-2': { name: '5 · 4 · 3 · 2 · 1', intent: 'Grounding', duration: '8 min', file: 'audio/5-4-3-2-1.mp3' },
  'card-3': { name: 'Yoga Nidra', intent: 'Sleep', duration: '17 min', file: 'audio/YogaNidra.mp3' },
  'card-4': { name: 'Letting Go — A Meditation on Release', intent: 'Letting Go', duration: '7 min', file: 'audio/Wipers.mp3' },
  'card-5': { name: 'Letting Go into the Sea', intent: 'Releasing', duration: '6 min', file: 'audio/Letting_Go.mp3' },
  'card-6': { name: 'Staying with What Is', intent: 'Acceptance', duration: '7 min', file: 'audio/Staying.mp3' }
};

// DOM Elements (will be re-queried in DOMContentLoaded to ensure they exist)
let listenNowBtn;
let dropdownMenu;
let dropdownItems;
let welcomeBackCta;
let welcomeBackBtn;
let welcomeBackTrackName;
let browseAllBtn;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Query DOM elements after page load
  listenNowBtn = document.getElementById('listen-now-btn');
  dropdownMenu = document.getElementById('dropdown-menu');
  dropdownItems = document.querySelectorAll('.dropdown-item');
  welcomeBackCta = document.getElementById('welcome-back-cta');
  welcomeBackBtn = document.getElementById('welcome-back-btn');
  welcomeBackTrackName = document.getElementById('welcome-back-track');
  browseAllBtn = document.getElementById('browse-all-btn');

  console.log('DOM elements found:', {
    listenNowBtn: !!listenNowBtn,
    dropdownMenu: !!dropdownMenu,
    dropdownItems: dropdownItems.length,
    welcomeBackBtn: !!welcomeBackBtn,
    browseAllBtn: !!browseAllBtn
  });

  checkAndInitWelcomeBack();
  attachEventListeners();
});

/**
 * Check if user has a saved track, show Welcome Back UI if so
 */
function checkAndInitWelcomeBack() {
  const savedTrack = localStorage.getItem(STORAGE_KEY);
  console.log('checkAndInitWelcomeBack - savedTrack:', savedTrack);

  if (savedTrack) {
    // Parse saved track info
    let trackInfo;
    try {
      trackInfo = JSON.parse(savedTrack);
      console.log('Parsed trackInfo:', trackInfo);
    } catch (e) {
      console.error('Failed to parse saved track:', e);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // Show Welcome Back UI
    listenNowBtn.classList.add('hidden');
    dropdownMenu.classList.add('hidden');
    welcomeBackCta.classList.remove('hidden');

    // Get track metadata for display
    const trackMeta = tracks[trackInfo.cardId];
    const displayText = trackMeta ? `${trackMeta.intent}, ${trackMeta.duration}` : trackInfo.name;

    // Populate button with shortened prefix + intent + duration
    welcomeBackTrackName.textContent = displayText;

    // Update button HTML to show "▶ Previous: " prefix
    const buttonText = welcomeBackBtn.innerHTML;
    welcomeBackBtn.innerHTML = `▶ Previous: <span id="welcome-back-track">${displayText}</span>`;
    welcomeBackBtn.dataset.cardId = trackInfo.cardId;
    welcomeBackBtn.dataset.trackName = trackInfo.name;
  }
}

/**
 * Attach event listeners to buttons and dropdown items
 */
function attachEventListeners() {
  // Handle Listen Now dropdown (if it exists)
  if (listenNowBtn && dropdownMenu) {
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

    // Debug: Log any clicks on the dropdown menu
    dropdownMenu.addEventListener('click', (e) => {
      console.log('Click on dropdown area - target:', e.target.tagName, e.target.textContent);
    }, true); // Use capture phase to catch all clicks

    // Handle dropdown item clicks
    dropdownItems.forEach(item => {
      item.addEventListener('click', (e) => {
        console.log('Dropdown item clicked:', item.textContent);
        e.preventDefault();
        const cardId = item.dataset.cardId;
        const trackName = item.dataset.trackName;
        console.log('Dropdown item data - cardId:', cardId, 'trackName:', trackName);
        playTrack(cardId, trackName);
        dropdownMenu.classList.add('hidden');
        listenNowBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Handle Welcome Back button click (always attach, regardless of dropdown)
  if (welcomeBackBtn) {
    welcomeBackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const cardId = welcomeBackBtn.dataset.cardId;
      const trackName = welcomeBackBtn.dataset.trackName;
      playTrack(cardId, trackName);
    });
  }

  // Handle "Pick a different session" link (show dropdown, hide Welcome Back)
  const pickDifferentLink = document.getElementById('pick-different-link');
  if (pickDifferentLink) {
    pickDifferentLink.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Pick different session clicked');
      welcomeBackCta.classList.add('hidden');
      listenNowBtn.classList.remove('hidden');
      dropdownMenu.classList.remove('hidden');
      listenNowBtn.setAttribute('aria-expanded', 'true');
    });
  }
}

/**
 * Play a track: scroll to card, play audio, save to localStorage
 */
function playTrack(cardId, trackName) {
  console.log('playTrack called - cardId:', cardId, 'trackName:', trackName);

  // Find the meditation card
  const card = document.getElementById(cardId);
  console.log('Card found:', !!card, 'cardId:', cardId);
  if (!card) {
    console.error('Card not found with id:', cardId);
    return;
  }

  // Find the audio element within the card
  const audio = card.querySelector('audio');
  console.log('Audio element found:', !!audio);
  if (!audio) {
    console.error('Audio element not found in card:', cardId);
    return;
  }

  // Save to localStorage
  console.log('About to save track to localStorage');
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
  try {
    const trackInfo = {
      cardId: cardId,
      name: trackName,
      timestamp: new Date().toISOString()
    };
    console.log('BEFORE localStorage.setItem - trackInfo:', trackInfo);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trackInfo));

    // Verify it was actually saved
    const verify = localStorage.getItem(STORAGE_KEY);
    console.log('AFTER localStorage.setItem - verify read:', verify);
    console.log('Saved to localStorage - cardId:', cardId, 'trackName:', trackName);
  } catch (e) {
    console.error('Failed to save track to localStorage:', e);
  }
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
