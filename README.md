# Mediakit Website — Peaceful Mind Meditation Library

A clean, responsive static website for hosting guided meditation MP3s.

## Structure

```
mediakit-website/
├── index.html          # Homepage with hero + 3 featured meditations
├── meditations.html    # Full library (12 sessions, filterable by category)
├── css/style.css       # All styles — dark navy theme, blue accents
├── js/player.js        # Custom audio player (play/pause, progress, volume)
└── audio/              # Place your MP3 files here (see filenames below)
```

## Adding Your MP3 Files

Drop your MP3 files into the `audio/` folder using these exact filenames:

| File | Title | Category |
|------|-------|----------|
| `deep-sleep-relaxation.mp3` | Deep Sleep Relaxation | Sleep |
| `nighttime-stillness.mp3` | Nighttime Stillness | Sleep |
| `peaceful-dreams.mp3` | Peaceful Dreams | Sleep |
| `calm-anxious-mind.mp3` | Calm the Anxious Mind | Anxiety |
| `grounding-54321.mp3` | 5-4-3-2-1 Grounding | Anxiety |
| `release-and-let-go.mp3` | Release & Let Go | Anxiety |
| `morning-clarity.mp3` | Morning Clarity | Focus |
| `reset-refocus.mp3` | Reset & Refocus | Focus |
| `deep-work-flow.mp3` | Deep Work Flow | Focus |
| `box-breathing.mp3` | Box Breathing | Breathwork |
| `478-calm-breath.mp3` | 4-7-8 Calm Breath | Breathwork |
| `energy-vitality-breath.mp3` | Energy & Vitality Breath | Breathwork |

## Deploying (GitHub Pages — free hosting)

1. Go to your repo on GitHub
2. Click **Settings → Pages**
3. Under *Branch*, select `main` and click **Save**
4. Your site will be live at `https://YOUR-USERNAME.github.io/mediakit-website/`
