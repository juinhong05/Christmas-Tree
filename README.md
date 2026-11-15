# Christmas Tree

An interactive Christmas greeting built with React and the Canvas API, featuring a sparkling green tree against a snowy night sky.

## Live Demo

[Open the Christmas tree](https://christmas-tree-six.vercel.app/)

## Source

[View the project on GitHub](https://github.com/juinhong05/Christmas-Tree)

The `main` branch is connected to Vercel, so pushes to GitHub automatically update the live experience.

## Highlights

- The page opens with snowfall and a **Tap for Christmas surprise** ornament. Tap it to build a solid, layered evergreen from the ground up, then watch the lights spiral around it and a softly glowing gold star appear.
- Falling snow, sparkling branch lights, and animated rings around the base.
- Left and right drag controls to spin the scene, plus a capped upward view to look over the rings without losing the tree.
- Background music that starts automatically when allowed by the browser.
- Music pauses when switching tabs, leaving the page, locking the screen, or switching away from the browser on mobile. Previously started music resumes from its paused position when the page is visible and focused again; if the browser blocks resuming, tap the prompt.
- Santa and his reindeer make three slower passes in alternating directions, dropping twelve presents that stay beside the tree.
- Keyboard arrow controls for rotation and viewing angle.

## Run Locally

```bash
npm install
npm run dev
```

Open the local address printed by the development server.

## Production Build

```bash
npm run build:vercel
```

The Vercel-ready static site is generated in `dist/vercel`.

## Audio Regression Tests

```bash
node --test tests/audio-lifecycle.test.mjs
```

These tests cover background pausing, returning to the page, blocked autoplay, cleanup, and pending playback requests.

## Project Structure

- `app/page.tsx` contains the Canvas scene, interaction, audio, and surprise animation.
- `app/globals.css` contains the full-screen scene and prompt styling.
- `public/last-christmas.mp3` contains the background music.
- `vite.vercel.config.ts` and `vercel.json` configure the Vercel static deployment.
