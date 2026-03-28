/**
 * Listen Now Button - Unified Play Experience
 * Always-visible button that updates to show last played track
 */

const STORAGE_KEY = 'lastPlayedTrack';

// Track metadata
const tracks = {
  'card-1': { name: 'All Shall Be Well', intent: 'Turning Inward', duration: '24 min', file: 'audio/Turning_Inward_All_Shall_Be_Well.mp3' },
  'card-2': { name: '5 · 4 · 3 · 2 · 1', intent: 'Grounding', duration: '8 min', file: 'audio/Grounding_54321.mp3' },
  'card-3': { name: 'Yoga Nidra', intent: 'Sleep', duration: '17 min', file: 'audio/Sleep_Yoga_Nidra.mp3' },
  'card-4': { name: 'A Meditation on Release', intent: 'Letting Go', duration: '7 min', file: 'audio/Letting_Go_Release.mp3' },
  'card-5': { name: 'Into the Sea', intent: 'Releasing', duration: '6 min', file: 'audio/Releasing_Into_The_Sea.mp3' },
  'card-6': { name: 'Staying with What Is', intent: 'Acceptance', duration: '7 min', file: 'audio/Acceptance_Staying_With_What_Is.mp3' }
};

// DOM Elements
let listenNowBtn;
let listenBtnText;
let dropdownMenu;
let dropdownItems;
let chooseDifferentLink;
let lastPlayedCardId = null; // Track if user has a previous track

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Query DOM elements after page load
  listenNowBtn = document.getElementById('listen-now-btn');
  listenBtnText = document.getElementById('listen-btn-text');
  dropdownMenu = document.getElementById('dropdown-menu');
  dropdownItems = document.querySelectorAll('.dropdown-item');
  chooseDifferentLink = document.getElementById('choose-different-link');

  console.log('DOM elements found:', {
    listenNowBtn: !!listenNowBtn,
    listenBtnText: !!listenBtnText,
    dropdownMenu: !!dropdownMenu,
    dropdownItems: dropdownItems.length,
    chooseDifferentLink: !!chooseDifferentLink
  });

  // Update button with last played track (if exists)
  updateButtonFromStorage();

  // Attach all event listeners
  attachEventListeners();
});

/**
 * Update the Listen Now button to show last played track
 */
function updateButtonFromStorage() {
  const savedTrack = localStorage.getItem(STORAGE_KEY);

  if (savedTrack && listenBtnText) {
    try {
      const trackInfo = JSON.parse(savedTrack);
      const trackMeta = tracks[trackInfo.cardId];
      if (trackMeta) {
        const displayText = `▶ ${trackMeta.intent}, ${trackMeta.duration}`;
        listenBtnText.textContent = displayText;
        lastPlayedCardId = trackInfo.cardId;

        // Show "Choose different" link for returning visitors
        if (chooseDifferentLink) {
          chooseDifferentLink.classList.remove('hidden');
        }

        console.log('Button updated from storage:', displayText);
      }
    } catch (e) {
      console.error('Failed to parse saved track:', e);
      resetButtonText();
    }
  }
}

/**
 * Reset button text to default
 */
function resetButtonText() {
  if (listenBtnText) {
    listenBtnText.textContent = 'Listen Now ▶';
  }
}

/**
 * Attach event listeners to buttons and dropdown items
 */
function attachEventListeners() {
  if (!listenNowBtn || !dropdownMenu) return;

  // Button behavior depends on whether user has a previous track
  listenNowBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (lastPlayedCardId) {
      // Returning visitor: click button to PLAY last track
      const trackName = tracks[lastPlayedCardId].name;
      console.log('Button clicked - playing last track:', lastPlayedCardId);
      playTrack(lastPlayedCardId, trackName);
    } else {
      // First-time visitor: click button to OPEN dropdown
      console.log('Button clicked - opening dropdown for first-time visitor');
      dropdownMenu.classList.toggle('hidden');
      listenNowBtn.setAttribute('aria-expanded', !dropdownMenu.classList.contains('hidden'));
    }
  });

  // "Choose different" link - opens dropdown for returning visitors
  if (chooseDifferentLink) {
    chooseDifferentLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Choose different link clicked - opening dropdown');
      dropdownMenu.classList.remove('hidden');
      listenNowBtn.setAttribute('aria-expanded', 'true');
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!listenNowBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.add('hidden');
      listenNowBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Debug: Log clicks on dropdown area
  dropdownMenu.addEventListener('click', (e) => {
    console.log('Click on dropdown area - target:', e.target.tagName, e.target.textContent);
  }, true);

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

/**
 * Play a track: scroll to card, play audio, save to localStorage, update button
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

  // Save to localStorage and update button
  console.log('About to save track to localStorage');
  saveTrackToStorage(cardId, trackName);

  // Update the Listen Now button immediately
  const trackMeta = tracks[cardId];
  if (trackMeta && listenBtnText) {
    listenBtnText.textContent = `▶ ${trackMeta.intent}, ${trackMeta.duration}`;
  }

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
