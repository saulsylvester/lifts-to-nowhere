# Art direction and generated assets

## Andy walking update

Saved asset: `public/art/andy-walk-cycle.png`. Built-in ImageGen mode, with `public/art/andy-blue-hoodie.png` as identity/style reference and `transparent_background: true`. Original output: `exec-94a472a7-f3ba-4501-8417-a99cb3494a7b.png`. In-game render review: `artifacts/andy-walk-cycles.png`.

Final prompt:

> Use case: identity-preserve. Asset type: transparent 16-bit pixel-art game walk-cycle sprite sheet. Input image: character identity, outfit and pixel-art style reference. Create a NEW animation sheet of the exact same Andy: blue hoodie, black baseball cap, orange lanyard with cream badge, blue trousers, brown boots, small blue backpack. Preserve character identity, colours, proportions and navy pixel outlines. Output a square sheet with EXACTLY FOUR ROWS and FOUR COLUMNS, 16 separate full-body poses, centered in equal square cells on genuinely transparent background. No labels, borders or shadows. Row1 faces viewer/front; Row2 faces screen-right; Row3 faces screen-left; Row4 faces away/back. Each row is a four-frame looping WALK animation: column1 left foot planted forward/right foot extended back; column2 passing pose with left supporting leg and right knee raised; column3 right foot planted forward/left foot extended back; column4 passing pose with right supporting leg and left knee raised. Make the alternating legs and opposing arm swing distinct and readable even at 32px high. No identical poses within a row. Keep head, hat, torso SIZE and body centre identical across all four columns; only legs and arms articulate, with at most one-pixel vertical body motion. Keep all ground baselines identical within each row and ample equal padding per cell; no clipping or overlap. Crisp intentionally placed pixel clusters, 3-5 shade colour ramps, charming GBA-era game sprite. Must look like footsteps, never hopping with both feet together. No props, scene, text, gradients, blurred edges or white background.

The four reviewed concept screens define the target: a warm, curious, richly furnished hotel rendered as true isometric 16-bit pixel art. Saturated greens, reds and blues, brass highlights, dark navy outlines, coarse intentional pixel clusters, framed portraits, pixel lettering and one consistent UI system.

## Generation

All PNG artwork listed below was generated with the built-in ImageGen tool. The corresponding original outputs remain intact in the chat's generated-image directory. These project copies are the durable sources. No pet service record was created or modified.

- `lobby-concept.png`: isometric cream/turquoise tiled hotel lobby, brass crimson lift, red runner, cobalt sofa, plants, reception desk, Andy in a red beanie and yellow jumper; navy/gold portrait HUD.
- `weather-concept.png`: same visual system, floor 07 greenhouse, smiling cloud, flowers, watering cans and upward rain.
- `jellyfish-concept.png`: floor 73 blue/teal salon, pink/cream jellyfish chandelier, lilac tentacles, shell furniture, brass trim.
- `plant-concept.png`: floor 101 botanical supper club, oversized carnivorous plant, terracotta pot, crimson table and curtains, playful menace.
- `ding.png`: transparent horizontal strip of four isolated poses of Ding, a sentient brass reception bell, teal arms and boots, red pillbox bellhop cap, cream luggage tag; idle, right walk, left walk, celebration; simple pixel shading and navy outlines.
- `andy.png`: transparent horizontal four-pose strip matching the lobby reference; red wool beanie, yellow striped jumper, indigo trousers, blue backpack; front, right walk, left walk, back; consistent size and foot baseline.
- `andy-blue-hoodie.png`: Andy's idle and portrait sprite source, edited from `andy.png` using the built-in ImageGen tool; blue hoodie, black baseball cap, orange lanyard and cream badge.
- `andy-walk-cycle.png`: archived earlier attempt with sixteen walking poses in four directions, derived from the outfit source using built-in ImageGen. This earlier attempt used four frames per direction at eight frames per second; it has been superseded by the articulated atlas below. Shared 208×288 source windows register the cap rather than the moving limbs; one shared transform renders them at 32 native pixels high. Andy's old whole-body movement bob is removed.
- `furniture.png`: transparent 2×2 sheet, isometric cobalt sofa, wooden reception desk with green lamp and service bell, lush ceramic-potted plant, wooden colourful bookcase.
- `heroes.png`: transparent 2×2 sheet, smiling cloud over a flowerpot, pink jellyfish chandelier with cord, giant potted carnivorous plant, brass-and-crimson elevator portal.

Shared production prompt: “Authentic GBA / Advance Wars-inspired 16-bit 2D pixel art; true 2:1 isometric view; deliberate square pixel clusters; dark navy outlines; bright saturated colour ramps; warm cream highlights; 3–5 discrete tones per material; no gradients, 3D, voxel rendering, antialiasing, scenery or labels in sprite sources. Whole sprites isolated with generous transparent padding.”

Technical fitting uses shared scale/registration for imported animation frames. Built-in sprite strips use isolated pose bounds. Prop sources use alpha thresholding to remove generated soft fringes. Gameplay frames are composed from floor geometry and individual objects; the concept paintings are not used as flat gameplay backgrounds.

## Andy outfit update

Saved asset: `public/art/andy-blue-hoodie.png`. Built-in ImageGen edit with `public/art/andy.png` as the edit target and `transparent_background: true`. Original generated output: `exec-ca6fe151-a35b-47e0-aefc-94852437b744.png`.

Final prompt:

> Use case: identity-preserve. Asset type: production pixel-art character sprite sheet for an isometric 16-bit exploration game. Edit target: the supplied Andy four-pose sprite sheet. Change only his outfit: replace his yellow shirt with a clearly BLUE HOODIE, including visible hood resting behind his neck and matching blue sleeves; replace the red headwear with a BLACK BASEBALL CAP with a short brim and subtle charcoal pixel highlights; add a vivid ORANGE LANYARD hanging around his neck down the front of his hoodie, with a tiny plain cream rectangular badge at chest level. The lanyard should read as two bright orange strips forming a narrow V on his chest. Preserve his face, brown hair, skin tone, chunky toy-like proportions, blue trousers, brown boots, and backpack. Preserve the crisp navy outlines, GBA-era discrete pixel shading and no modern soft gradients. Keep EXACTLY the same four poses in one horizontal row, in the same order: front three-quarter idle, walking facing right, walking facing left, rear view. Every pose must have the new hoodie and black cap; the orange lanyard is visible only where anatomically visible from front/sides, not on the back. Keep each complete figure isolated in its own equal-width quarter of the image, with clear transparent separation, matching scale, grounded foot alignment, no touching adjacent cells. Match the reference wide 4:1-ish layout. Genuine transparent background. No labels, no lettering, no extra poses, no scenery, no drop shadows. This replaces Andy's current outfit; no other design changes.

## Room 101 encounter

The plant is code-native Canvas 2D artwork in `src/plant-encounter.ts`, shared between idle and active states. Roots, stems, leaves, upper/lower jaws, teeth, cheek bulges, crimson splatters and falling fragments animate separately. Andy fragments include a black cap, brown boots with blue cuffs, and orange lanyard badges; Ding fragments include red bellhop caps, teal feet and brass chips. Imported explorers contribute their sampled sprite colours. `artifacts/plant-encounter-stages.png` and `artifacts/plant-encounter.gif` are actual renderer captures for both bundled explorers.

## Bookshelf and upside-down bakery

The isometric bookshelf now paints its grounded plinth before the cabinet, and each shelf board before its books. This hides the rear base face correctly instead of drawing it over the lowest shelf. Actual renderer captures: `artifacts/bookshelf-fixed.png` and `artifacts/bookshelf-lobby.png`.

Floor 69 preserves The Upside-Down Bakery’s authored identity and stamp. Its complete world rotates 180° around the room bounds after a short delay, temporarily fitting those bounds inside the game area during the roll. The final transform uses exact integer translations and a unit-scale 180° rotation so the inverted room remains crisp. HUD and prompts remain upright. Actual captures: `artifacts/upside-down-room.png`, `artifacts/upside-down-stages.png`, and `artifacts/upside-down-room.gif`. No new generated raster artwork was needed.

## Articulated Andy, dentist, growing plant and moving planets

Andy’s current walking animation is authored directly at native pixel resolution in `src/andy-walk.ts`. It combines the existing cap/face crops with explicitly jointed blue sleeves and trousers, eight alternating foot placements per direction, planted support feet, bent knees, and counter-swinging arms. A pre-rendered in-memory atlas keeps the final game pixels crisp. One gait cycle spans 32 travelled pixels; animation phase comes from successful movement rather than the global clock. Directional rest poses preserve his facing when he stops. The generated four-pose walking sheet remains an archived reference, not the runtime animation.

Room 43’s dentist is a dedicated code-native sprite in `src/dentist.ts`, with a white coat, mask, teal gloves, silver hair, head mirror, patient chart and moving dental tool. Room 101’s rooted seedling starts at 15×26 native pixels and grows to the existing 136-pixel monster over 0.85 seconds. Room 87’s planets share deterministic animated positions with their collision geometry, continuing their drift after discovery. New visual checks are recorded in `artifacts/plant-growth-stages.png` and `artifacts/space-motion.gif`.

## Black-hole cutscene

Room 26 uses code-native artwork in `src/black-hole.ts` for a 1.25-second sequence: the explorer shrinks into the floor aperture, then falls down a dark violet shaft with pixel rings and upward-moving streaks. The current avatar supplies the falling sprite, including imported pets. The HUD and caption remain outside the shaft. Reduced motion removes rotation, horizontal sway and moving streaks while retaining the short downward fall. The sequence ends in the lift beside its keypad. Actual renderer captures are `artifacts/black-hole-stages.png`, `artifacts/black-hole.gif`, and `artifacts/black-hole-lift-return.png`.
