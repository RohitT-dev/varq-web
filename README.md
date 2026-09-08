# Varq — Web

Static Privacy Policy and About/Contact pages for the Varq app, served via GitHub Pages.

- [`privacy-policy.html`](privacy-policy.html)
- [`about.html`](about.html) (also served as `index.html`)

Source of truth for the content is `securo/web/*.html` in the private `Securo` repo — this repo is a
deploy target only. Regenerate by copying those two files here, rewriting `../assets/fonts/` →
`assets/fonts/`, copying `about.html` over `index.html`, and syncing the six fonts from the app
repo's root `assets/fonts/`.

Replaces `mindbridge-web`, retired when the app was renamed Varq.
