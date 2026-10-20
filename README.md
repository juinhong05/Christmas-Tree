# Christmas Tree

An interactive Christmas greeting built with React and the Canvas API. It recreates a sparkling pink-and-white particle tree against a snowy night sky, ready to share as a single link.

## Live Demo

[Open the Christmas tree](https://christmas-tree-six.vercel.app/)

## Highlights

- A layered, rotating particle Christmas tree with a glowing heart topper.
- Falling snow, sparkling branch lights, and animated rings around the base.
- Left and right drag controls to spin the scene, plus a capped upward view to look over the rings without losing the tree.
- Background music that starts automatically when allowed by the browser.
- A small ornament-shaped **Tap for surprise** prompt when a visitor needs to start the music manually.
- A Santa, reindeer, and gift flight animation after the surprise is tapped.
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

## Project Structure

- `app/page.tsx` contains the Canvas scene, interaction, audio, and surprise animation.
- `app/globals.css` contains the full-screen scene and prompt styling.
- `public/last-christmas.mp3` contains the background music.
- `vite.vercel.config.ts` and `vercel.json` configure the Vercel static deployment.
