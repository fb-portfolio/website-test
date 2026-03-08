# Portfolio Setup

## 1. Local Fonts (important for DSGVO)

Download Plus Jakarta Sans from:
https://gwfh.mademuli.com/fonts/plus-jakarta-sans

Select weights: 300, 300 italic, regular (400), 500
Format: woff2 only

Place the .woff2 files in the `fonts/` folder.
Then open main.css and replace the Google Fonts @import at the top with:

```css
@font-face {
  font-family: 'Plus Jakarta Sans';
  src: url('fonts/FILENAME-300.woff2') format('woff2');
  font-weight: 300; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Plus Jakarta Sans';
  src: url('fonts/FILENAME-300italic.woff2') format('woff2');
  font-weight: 300; font-style: italic; font-display: swap;
}
@font-face {
  font-family: 'Plus Jakarta Sans';
  src: url('fonts/FILENAME-regular.woff2') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Plus Jakarta Sans';
  src: url('fonts/FILENAME-500.woff2') format('woff2');
  font-weight: 500; font-style: normal; font-display: swap;
}
```

Replace FILENAME with the actual filenames from the download.

## 2. Contact Form

Open contact.html and replace YOUR_FORMSPREE_ID with your Formspree ID.
Sign up free at https://formspree.io

## 3. File placement

- main.css, main.js, band.js → root of repo
- about.html, contact.html, impressum.html → root
- index.html, projects.html, web.html → already updated in root
- projects/*/index.html → each project subfolder

## 4. Deploy

git add .
git commit -m "new portfolio"
git push
