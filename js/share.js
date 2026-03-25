/**
 * Social sharing functionality for meditation cards
 */

document.addEventListener('DOMContentLoaded', () => {
  initializeShareButtons();
});

/**
 * Initialize all share buttons on the page
 */
function initializeShareButtons() {
  const shareToggles = document.querySelectorAll('.share-toggle');

  shareToggles.forEach(toggle => {
    const container = toggle.closest('.share-container');
    const menu = container.querySelector('.share-menu');
    const shareItems = container.querySelectorAll('.share-item');

    // Toggle share menu on button click
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isHidden = menu.classList.contains('hidden');

      // Close all other open menus
      closeAllShareMenus(container);

      // Toggle this menu
      if (isHidden) {
        menu.classList.remove('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Handle share item clicks
    shareItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = item.dataset.share;
        const card = container.closest('.meditation-card');
        const title = card.querySelector('.card-title').textContent;

        shareTrack(title, platform);

        // Close menu after sharing
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  });

  // Close menus when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.share-container')) {
      closeAllShareMenus();
    }
  });
}

/**
 * Close all open share menus except the specified container
 */
function closeAllShareMenus(exceptContainer = null) {
  const allMenus = document.querySelectorAll('.share-menu');
  const allToggles = document.querySelectorAll('.share-toggle');

  allMenus.forEach(menu => {
    const container = menu.closest('.share-container');
    if (container !== exceptContainer) {
      menu.classList.add('hidden');
    }
  });

  allToggles.forEach(toggle => {
    const container = toggle.closest('.share-container');
    if (container !== exceptContainer) {
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Share track to social platform
 */
function shareTrack(title, platform) {
  const url = window.location.href;
  const pageTitle = document.title;

  let shareUrl = '';

  switch(platform) {
    case 'twitter':
      const twitterText = `I'm listening to "${title}" on Between the Waves — free guided meditations 🌊`;
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`;
      break;

    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      break;

    case 'pinterest':
      shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`;
      break;

    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      break;

    case 'email':
      const subject = `Check out this meditation: ${title}`;
      const body = `I found this guided meditation on Between the Waves that I thought you might enjoy.\n\n"${title}"\n\nGive it a listen: ${url}`;
      shareUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      break;
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  }
}
