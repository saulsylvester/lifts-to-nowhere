# Lift to Nowhere

One lift. One hundred improbable places to visit.

Lift to Nowhere is a keyboard exploration game made for the [London Codex Community Hack](https://luma.com/dde-ldn-hack). Explore as **Ambassador Andy**, **Ding** ([my](https://github.com/saulsylvester/) Codex Pex), a small, lobby service bell made for the demo, or you can also import a downloaded Codex pet sprite.

I wanted to build a fun, workable & immersive example of what happens when image and coding models work together on a real project. **GPT-image** turns written art direction and visual references into usable character and prop artwork. **Astra** helps shape the ideas and interactions; **Sol** builds them into a working TypeScript game, with movement, collisions, rooms, interface, and sound. The result is more than a set of generated images: the art appears inside a playable world.

The whole development process was iterative. Described a scene, make its art, wire it into the game, then inspect a screenshot and ask for a specific improvement. That feedback loop lets the models help across concept art, implementation, and visual polish, while keeping the result coherent and playable. Lift to Nowhere is a compact demo of that end-to-end creative collaboration.

## Run the game

Install [Node.js](https://nodejs.org/) **22.12 or later**. The included `.nvmrc` selects Node 24.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To make and serve a production build locally:

```sh
npm run build
npm run preview
```

The game runs in the browser and uses local assets. It needs no account, backend, or network connection after it loads.

## Controls

| Key | Action |
| --- | --- |
| **WASD** or **arrow keys** | Walk in screen directions |
| **E** | Use the lift, operate its panel, enter doors, or interact with a discovery |
| **J** | Open or close the discoveries journal |
| **M** | Toggle sound |
| **Escape** | Close a dialog |
| **R** | Return directly to the lift |

The **R** shortcut places you beside the lift’s wall keypad: press **E** immediately to choose another floor. It keeps your explorer and discoveries. During a lift ride it takes you to the selected floor’s cabin; it also clears an encounter. Text fields retain normal typing.

Follow the red carpet through the lobby doors. In the smaller lift cabin, approach the brass wall panel and press **E** to enter a positive whole floor number. Numbers above 100 take you to floor 101. After the ride, leave through the lift doors to enter that room. Use its brass **LIFT** door to return to the cabin. Click the explorer portrait to choose Andy, Ding, or an imported pet; switching explorers preserves your location and discoveries.

## A few floors to try

The building has 100 discoveries, a hidden bonus room, and plenty of strange rooms in between. These floors show off some of its special interactions:

- **04 — The Shy Lighthouse:** entering starts a six-second flood. Translucent light-blue water fills the room; swim to the lighthouse and back to the door.
- **12 — Gravity on Holiday:** loose objects and furniture levitate.
- **26 — The Polite Black Hole:** walk close to the hole or press **E** to offer a biscuit. It pulls you in, shows a brief falling cutscene, then drops you safely beside the lift keypad with your discovery stamp.
- **43 — A Dentist for Zippers:** meet the dentist, have your zipper examined, and collect the original stamp.
- **69 — The Upside-Down Bakery:** the room turns over after you arrive. Walk around while inverted, collect the discovery, and return through the rotated door.
- **87 — The Jellybean Planet:** step through a doorway into space. Float among four planets; press **E** away from the door or collect the discovery to set them moving.
- **88 — Disco for Absent Guests:** turn on the music and watch the shoes dance.
- **91 — The Emergency Rainbow:** pull the lever to reveal a big rainbow.
- **101 — The Hungry Houseplant:** the plant starts as a tiny seedling, then grows after a couple of steps. It grabs, chews, and spits the explorer back out. There is no stamp on this floor; discoveries survive a restart.

Floor 4 refills when you return. In space, the planets keep moving after the discovery animation ends. Both scenes respond to reduced-motion settings.

## Choose an explorer

Andy is the default. He wears a blue hoodie, black cap, and orange lanyard, with an eight-pose walking cycle in each direction. **Ding** is a bundled demo character, not a registered Codex pet.

To use your own pet, select **Use my pet** and choose a downloaded transparent PNG or WebP sprite sheet. Review the preview, edit its display name if you like, and confirm. The importer supports these installed Pets layouts:

- v1: **1536 × 1872** pixels
- v2: **1536 × 2288** pixels
- Both: eight columns of **192 × 208** pixel cells, maximum file size **20 MiB**

The standard animation rows contain 6, 8, 8, 4, 5, 8, 6, 6, and 6 poses. The v2 sheet also has two eight-pose look-direction rows. Unused cells must be transparent. Movement uses the walking animations; look-direction frames are not treated as steps. Frames share a consistent scale and registration, and vertical movement keeps the last left or right facing.

This is a local file import, not account access or pet registration. See the [ChatGPT Pets documentation](https://learn.chatgpt.com/docs/pets) for the pet sprite-sheet workflow.

## Progress and storage

Discoveries and sound preferences use the original `andy-nowhere-v1` browser save format. Avatar preferences are stored separately, and imported pet artwork is saved in IndexedDB. If storage is unavailable, the game remains playable for the current session.

## Development

Run the available checks and room contact-sheet generator with:

```sh
npm run typecheck
npm test
npm run test:browser
npm run build
npm run contact-sheets
```

The browser tests use Playwright. If Chromium is not installed, run `npx playwright install chromium`. The contact-sheet script expects the development server on port 5173 and writes its captures to `artifacts/`.

Add `?dev=1` to the local game URL to show the development room inspector. It can jump to a floor, play an encounter, or advance to the next floor. The inspector API (`window.__nowhere`) is available only in development and is omitted from production builds.

Capture helpers include `scripts/inspect-walk.mjs` for Andy’s walking atlas and game-speed preview, `scripts/inspect-plant.mjs` for the Room 101 encounter, `scripts/inspect-small-plant.mjs` for its growth stages, `scripts/inspect-space-motion.mjs` for the moving planets, and `scripts/inspect-black-hole.mjs --gif` for the fall and lift return. Animated previews require ffmpeg.

## Art and code

The game renders on a **480 × 320** canvas with 32 × 16 isometric tiles, crisp outlines, saturated colors, and a navy-and-gold interface. The source separates floor stories (`src/catalogue.ts`), room layouts (`src/rooms.ts`), simulation and saving (`src/core.ts`), avatar and pet imports (`src/avatars.ts`), rendering (`src/render.ts` and `src/catalogue-art.ts`), sound, and interface behavior (`src/main.ts`).

Reviewed concept stills and generated sprite sources are in `public/art/`. See [ART-DIRECTION.md](ART-DIRECTION.md) for visual references and production notes. The room stories and base prop and encounter drawings were adapted from the local hackathon project `lift-to-nowhere-2d`. Silkscreen by Jason Kottke is bundled under the SIL Open Font License; see `public/art/FONT-LICENSE.txt`.
