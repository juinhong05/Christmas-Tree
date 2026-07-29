# Christmas Tree

An interactive particle Christmas tree made with React, Canvas, and Vinext.

The scene is inspired by a glowing Python Christmas tree video: a black stage, pink-white sparkling tree particles, circular light rings, falling snow, a heart topper, and a handwritten "Merry Christmas" greeting.

## Live Demo

[Open the Christmas tree](https://python-christmas-tree-20260729.juinhong05314175.chatgpt.site)

Note: the demo is deployed through OpenAI Sites. If the workspace keeps Sites private, access may require the owner account.

## Features

- Animated particle Christmas tree with pink and white sparkle effects.
- Layered branch tiers for a stronger sense of depth and hierarchy.
- Glowing circular rings around the base.
- Falling snow and a pulsing heart topper.
- Drag left or right to rotate the tree.
- Drag upward for a limited top view of the tree and rings.
- Keyboard arrow support for rotation and view changes.

## Tech Stack

- React
- TypeScript
- Canvas 2D
- Vinext
- Tailwind CSS

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by the dev server.

## Build

```bash
npm run build
```

## Project Structure

- `app/page.tsx` contains the animated particle scene and interaction logic.
- `app/globals.css` contains the full-screen stage styling.
- `.openai/hosting.json` contains the OpenAI Sites project metadata.
