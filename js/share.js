document.addEventListener('DOMContentLoaded', () => {
  initializeShareButtons();
});

function initializeShareButtons() {
  const shareToggles = document.querySelectorAll('.share-toggle');

  shareToggles.forEach(toggle => {
    const container = toggle.closest('.share-container');
    const menu = container.querySelector('.share-menu');
    const shareItems = container.querySelectorAll('.share-item');

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = menu.classList.contains('hidden');
      closeAllShareMenus(container);
      if (isHidden) {
        menu.classList.remove('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    shareItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = item.dataset.share;
        const card = container.closest('.meditation-card');
        const title = card.querySelector('.card-title').textContent;

        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');

        shareTrack(title, platform);
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.share-container')) {
      closeAllShareMenus();
    }
  });
}

function closeAllShareMenus(exceptContainer = null) {
  document.querySelectorAll('.share-menu').forEach(menu => {
    if (menu.closest('.share-container') !== exceptContainer) {
      menu.classList.add('hidden');
    }
  });
  document.querySelectorAll('.share-toggle').forEach(toggle => {
    if (toggle.closest('.share-container') !== exceptContainer) {
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function shareTrack(title, platform) {
  const url = window.location.href;

  if (platform === 'link') {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `"${title}" — a free guided meditation on Between the Waves`,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied!');
      }).catch(() => {
        showToast('Copy: ' + url);
      });
    }
    return;
  }

  let shareUrl = '';

  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      break;

    case 'x': {
      const text = `Listening to "${title}" on Between the Waves — free guided meditations 🌊`;
      shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      break;
    }

    case 'bluesky': {
      const text = `Listening to "${title}" on Between the Waves — free guided meditations 🌊 ${url}`;
      shareUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`;
      break;
    }
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  }
}

function showToast(message) {
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
