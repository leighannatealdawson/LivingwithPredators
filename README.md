# Wildlife Perception Survey  Ireland

A short public survey about foxes and pine martens on the island of Ireland.
PhD research, School of Geography and Environmental Sciences, Ulster University.

The site is a static SPA hosted on GitHub Pages. Responses POST to a Google
Apps Script endpoint that appends one row per submission to a Google Sheet the
researcher owns. No backend servers, no analytics, no cookies.

## Structure

```
docs/form.xlsx                  # Authoritative content: questions, choices, logic
scripts/xlsform-to-schema.ts    # Regenerates src/survey/schema.generated.ts
scripts/generate-header-row.ts  # Emits Google Sheet column order
src/                            # React + TypeScript app
server/apps-script/             # Deploy instructions + Code.gs for the Sheet
.github/workflows/              # CI + GitHub Pages deploy
```

## Local development

```bash
npm install
npm run dev            # http://localhost:5173
npm test               # unit tests
npm run typecheck
npm run build          # generates schema, typechecks, builds
npm run preview        # serve the built ./dist
```

With no `VITE_SUBMIT_URL` set, the submit step logs the payload to the browser
console and shows the thank-you screen, so you can click through the full flow
locally without touching Google.

## Updating survey content

The researcher edits `docs/form.xlsx` in Excel / Numbers / Google Sheets. Then:

```bash
npm run generate:schema        # re-emits src/survey/schema.generated.ts
npm run generate:header-row    # re-emits server/apps-script/header-row.tsv
```

Commit both regenerated files. CI fails the build if the generated schema is
out of date relative to `docs/form.xlsx`.

If new columns appeared in the header row, paste the new header into row 1 of
the Google Sheet (existing rows keep their values; new columns are blank for
older submissions).

## First-time setup

### 1. Create the GitHub repository

1. Create an empty repo on GitHub (any name — the site auto-detects it).
2. Push this code:
   ```bash
   git remote add origin git@github.com:<you>/<repo>.git
   git push -u origin main
   ```

### 2. Enable GitHub Pages

1. Repo **Settings → Pages**.
2. Source: **GitHub Actions**.
3. Push to `main` (or run the **Deploy** workflow manually from the Actions
   tab). After a couple of minutes the site is live at
   `https://<you>.github.io/<repo>/`.

### 3. Wire up the Google Sheet backend

Follow [`server/apps-script/README.md`](server/apps-script/README.md). It is a
one-time process: create a Sheet, paste `Code.gs` into its Apps Script editor,
deploy as a Web App, and paste the resulting URL into the GitHub repo variable
`VITE_SUBMIT_URL` (Repo **Settings → Secrets and variables → Actions →
Variables**). Re-run the deploy workflow and submissions will start landing in
the Sheet.

### 4. Swap in the real species photos

`public/species/fox.jpg` and `public/species/pm.jpg` currently hold
`loremflickr` placeholders. Before sharing the survey publicly, replace both
files with licensed photos of a red fox and a European pine marten. Filenames
must match exactly. `public/species/Consent.png` is optional — drop a file
with that name to render a header image on the welcome page.

## Key design decisions

- **XLSForm as source of truth.** The Survey123 `.xlsx` is the canonical
  content definition. A build step compiles it into a typed TypeScript schema;
  edits flow from Excel, not code.
- **100-step slider replaces every 5-point Likert.** The slider distinguishes
  "not answered" (`null`) from "answered at 0" so data quality is preserved.
- **Postcode validation accepts only NI BT postcodes or Irish Eircodes.**
- **Session-scoped draft persistence.** A refresh mid-survey doesn't lose
  progress; a closed tab does, which avoids stale drafts on shared devices.
- **Idempotent submission.** Each session gets a submission id; the Apps
  Script skips duplicates so retries can't create extra rows.