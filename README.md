# Varq — Web

Static site for the Varq app, served by GitHub Pages at https://rohitt-dev.github.io/varq-web/

- `index.html` (home; identical to `about.html`), `privacy-policy.html`, `terms.html`, `404.html`
- `site/` holds the shared stylesheet, script, self-hosted fonts, icons and link-preview image

This repo is a deploy target only. The source of truth is `web/` in the private Securo repo, and every
change starts there. To publish, run `tool/build_varq_web.sh <path to this checkout>` from the Securo repo,
review `git status` here, commit, and push to `main`.

The site makes no third-party requests: fonts are self-hosted and nothing is loaded from elsewhere.

Replaces `mindbridge-web`, retired when the app was renamed Varq.
