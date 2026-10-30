# Game Break Audio Assets

All files in this directory are short, original PCM WAV sounds generated locally by `scripts/generate-audio-assets.js` using oscillator synthesis. No third-party samples, commercial music, external URLs, or runtime network downloads are used.

## Music

| File | Intended use |
| --- | --- |
| `music/home.wav` | Warm mellow keys for Home, History, and About. |
| `music/arcade.wav` | Light electronic loop for the game collection and arcade games. |
| `music/adventure.wav` | Soft atmospheric synth loop for exploration and adventure games. |

## Sound Effects

| File | Intended use |
| --- | --- |
| `sfx/ui-click.wav` | Short control click. |
| `sfx/navigation.wav` | Navigation link selection. |
| `sfx/start.wav` | Starting a game or round. |
| `sfx/success.wav` | Successful solve, match, or objective. |
| `sfx/invalid.wav` | Incorrect answer or failed action. |
| `sfx/draw.wav` | Draw result. |
| `sfx/move.wav` | Tile or board movement. |
| `sfx/collect.wav` | Collecting an item or target. |
| `sfx/jump.wav` | Jump action. |
| `sfx/collision.wav` | Collision or damage event. |
| `sfx/power-up.wav` | Power-up activation. |
| `sfx/game-over.wav` | Actual game-over event. |
| `sfx/pause.wav` | Pause or resume event. |

Regenerate the assets with `node scripts/generate-audio-assets.js`.