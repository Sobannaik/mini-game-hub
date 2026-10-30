# Game Break

Game Break is a browser-based collection of quick arcade games and immersive 3D experiences. Pick a game from the home page or collection, play directly in the browser, and revisit previous sessions through History.

## Website Overview

- **Home** introduces the collection, highlights featured games, and links to Games and History.
- **Games** organizes titles into arcade and 3D collections. 3D games can be played in the hub or opened in a separate tab.
- **History** lists this browser's saved play sessions, newest first, and supports filtering, deleting one entry, or clearing all entries.
- **About** provides project information.
- No account or login is required. Game History is stored locally in the current browser with `localStorage`.
- Session fields such as score, result, duration, and level are saved only when a game provides reliable values.

## Technology Stack

- **React 18** and JSX build the user interface and game pages.
- **Vite 5** runs the development server and creates production bundles.
- **React Router 6** handles Home, Games, History, About, and game routes.
- **JavaScript and CSS** implement shared UI, game logic, and responsive layouts.
- **Three.js** powers the hub's custom 3D games and scenes.
- **Unity WebGL** powers selected standalone 3D builds, including Survival Shooter.
- **Browser `localStorage`** stores personal game history and individual games' own settings or personal records.
- Game History does not use a backend, remote database, or authentication service.
- **Node.js built-in test runner** tests the History storage utility.

## Game Collection

The current catalog contains seven arcade games and four 3D games.

### Arcade Games

#### Tic-Tac-Toe
- Play X or O against the computer on a 3-by-3 board.
- Choose your side before the match begins.
- Place a mark by selecting an empty square.
- The computer takes the other mark and responds after a short delay.
- It looks for a winning move before choosing its next move.
- It also blocks an immediate player win when possible.
- A line of three matching marks wins the match.
- If all squares fill without a line, the match ends in a draw.
- The game maintains its on-screen X, O, and draw totals.
- History records the match result and measured duration.

#### Rock Paper Scissors
- Play Rock, Paper, or Scissors against the computer.
- Choose a move from the three large action buttons.
- The game animates both choices before showing the round result.
- Rock defeats Scissors, Scissors defeats Paper, and Paper defeats Rock.
- Matching choices produce a draw.
- Play multiple rounds in one session.
- The page shows current-session wins, draws, and losses.
- It also keeps separate all-time counters for the game.
- Use **Back to Games** to finish and save the session.
- History records the overall result and round totals, not a fabricated numeric score.

#### Reaction Time
- Start a three-count countdown to begin a round.
- Click each colored bubble before its timer expires.
- Bubble positions, sizes, and colors vary between targets.
- Every successful click increases the round's popped count.
- Each new target has less time, down to a half-second minimum.
- Missing a target ends the round.
- The result screen shows the number of bubbles popped.
- It also reports average and best reaction time when targets were hit.
- Personal reaction records are stored by the game in this browser.
- History records the final score and available reaction-time details.

#### Word Puzzle
- Read a short clue and choose the matching word from four options.
- The current clue and answer choices are shown together.
- Once an answer is selected, the choices lock briefly.
- Correct answers increase the on-screen score.
- Incorrect answers reveal the correct word.
- The game contains six built-in word puzzles.
- After each answer, it advances to the next clue.
- The puzzle set cycles so play can continue indefinitely.
- There is no separate win or loss condition.
- History saves the score and duration when the player leaves.

#### Image Puzzle
- Restore a picture by arranging tiles in a 3-by-3 sliding puzzle.
- One board space is empty and acts as the destination for a move.
- Only a tile adjacent to the empty space can be moved.
- Each valid slide increments the move counter.
- The game begins with a shuffled, solvable board.
- The page shows the current move count and a personal best.
- Completing the arrangement displays a solved state.
- **Shuffle** creates another playable arrangement.
- **Solve** reveals the completed picture.
- History records completion and available move details, without inventing a score.

#### Memory Match
- Match eight pairs of symbols across a 16-card board.
- Select two face-down cards to reveal their symbols.
- Matching cards stay face-up.
- Non-matching cards turn back over after a short pause.
- The game counts attempts as moves.
- Match every pair to clear the board.
- A move counter remains visible while playing.
- The game stores a personal best move count locally.
- Restart shuffles a new deck without changing the rules.
- History records a completed result and the final move count.

#### Snake
- Guide the snake around a 10-by-10 grid with the arrow keys.
- Collect food pellets to grow and increase the score.
- Each pellet is worth ten points.
- The snake continues moving automatically while the game is active.
- Turning directly back into the snake is ignored.
- Hitting a wall ends the run.
- Hitting the snake's own body also ends the run.
- The board shows the snake, its head, and the current food.
- Start Game begins a fresh run; Restart resets the board.
- History records Game Over and the final score.

### 3D Games

#### Serpentine
- Steer a 3D snake through a neon arena.
- The game offers three difficulty modes.
- Movement supports mouse, WASD, and arrow-key steering.
- Keep control of the snake as the arena's pace increases.
- Particle effects emphasize movement and game events.
- The arena is rendered with Three.js in the browser.
- Space pauses or resumes play.
- R restarts the current run.
- M toggles touch mode.
- History records a session after input when the game is closed; unsupported scores or outcomes are omitted.

#### ORBIT
- Roll across small planetoids and locate the exit portal.
- The full puzzle contains 24 levels.
- Collect each level's required keys before reaching its portal.
- Gravity can shift so surfaces become walkable walls or ceilings.
- Use W/S or Up/Down to roll.
- Use A/D or Left/Right to turn.
- Press Space to jump.
- Press Esc to pause and R to restart.
- The game is rendered with Three.js.
- History records the played session without guessing a score or result the game does not expose to the hub.

#### Sky Isles
- Explore a world made of nine floating islands above a cloud sea.
- Islands are connected by bridges and jump pads.
- Look for collectibles, temples, and environmental points of interest.
- Movement uses a third-person controller.
- Double-jump helps reach higher platforms.
- Hold jump in mid-air to glide.
- Move with WASD or the arrow keys.
- Drag the mouse to look around.
- Touch controls are supported on mobile devices.
- History records an embedded session after player input and omits unavailable score or level data.

#### Survival Shooter
- Fight waves of toy monsters in a top-down arena.
- Move to avoid enemies while keeping the player in a useful firing position.
- Aim with the mouse pointer.
- Fire the laser weapon with the left mouse button.
- Use Space for the bomb or special ability.
- Power-ups provide temporary gameplay advantages.
- Score multipliers reward continued play.
- The game is delivered as a Unity WebGL build.
- Its existing gameplay score remains part of the game itself.
- History records an embedded session after player input and only stores fields the game exposes.

## Run Locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Vite serves the application at `http://localhost:5173`.

## Build and Test

```bash
npm run build
node --test tests/historyStore.test.js
```

The History tests cover malformed local storage, optional session data, duplicate finish events, separate replays of the same game, and deleting or clearing entries.
