# Portfolio

Static site: plain HTML, CSS and JS. No build step.

- `data.js`: **edit this one.** Projects (grid cells) and notes (post-its), with how they're wired together.
- `index.html`: header links, plus the Experience and Education lists.
- `styles.css` / `script.js`: layout and interaction.

## Adding a project
Add an entry to `projects` in `data.js`. Put images in an `img/` folder and set `image: "img/name.png"`.
To wire it to a note, add the project's `id` to that note's `projects` list.

## Settings (top of `script.js`)
- `DROP_AFTER_MS`: how long an opened project stays up before falling (8000).
- `PAUSE_ON_HOVER`: hold the timer while the visitor hovers or tabs into the card.

## Run locally
```
python -m http.server 5500
```
Then open http://localhost:5500. Opening `index.html` directly also works.

## Deploy
Any static host works (GitHub Pages, Netlify, Vercel). Upload the folder as is.
