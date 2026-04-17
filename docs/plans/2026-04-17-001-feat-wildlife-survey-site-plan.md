---
title: Wildlife Perception Survey Site (Foxes & Pine Martens, Ireland)
type: feat
status: completed
date: 2026-04-17
---

# Wildlife Perception Survey Site (Foxes & Pine Martens, Ireland)

## Overview

A public, shareable survey website for a PhD research project in the School of Geography and Environmental Sciences at Ulster University, studying public views and experiences of foxes and pine martens on the island of Ireland. Participants fill in a 5-stage survey via a single link; responses are appended anonymously to a Google Sheet the researcher owns. Hosted on GitHub Pages.

The content, structure, choice lists, conditional logic, and question ids are defined in `docs/form.xlsx` (an XLSForm previously used in ArcGIS Survey123). This plan re-implements that form as a web app, replacing every 5-point Likert item with a 100-step continuous slider (no numbers visible, with labelled ends), while preserving the question ids so exported data remains compatible with any analysis the researcher has already built against the Survey123 output.

## Problem Frame

The researcher has a working Survey123 prototype (the form we've imported) but wants a better-designed, web-native survey under her own control, with a more sensitive response scale for the Likert-style questions. Specific needs:

- **Response resolution.** Replace the 5-point Likert (acceptability, risk, agreement) with a 100-step continuous slider — more granular perception data for analysis, with an explicit *unset* state so "no answer" is distinguishable from "very low / very disagree".
- **Reach.** One public URL, no app install, mobile-first.
- **Ethics.** GDPR-compliant: only postcode + answers; explicit informed consent before any questions, naming Ulster University as the institution.
- **Researcher autonomy.** Responses land in a Google Sheet she can open, filter, and export to CSV.
- **Data compatibility.** Question ids (e.g., `pm_pet`, `fox_a`, `sp_local_exp_pm`) preserved from the Survey123 form so existing analysis plans continue to apply. Slider values (0–100) replace 1–5 Likert codes; this is a known, documented change the researcher has asked for.
- **Conditional logic fidelity.** The `relevant` rules in the XLSForm (especially the follow-up experience and loss detail questions) must be faithfully implemented.

## Requirements Trace

- **R1.** Public URL (GitHub Pages) loads cleanly on mobile and desktop; design appropriate for academic wildlife research.
- **R2.** 5-stage wizard matching `form.xlsx`: Welcome/Consent → Intro (species ID, confidence, seen-before) → Views & Perceptions (acceptability, risk, tolerance — split across sub-steps to avoid a wall of sliders) → Wildlife Interactions (with conditional experience and loss follow-ups) → Demographics → Thank You.
- **R3.** Every Likert item (`likert_scenario`, `likert_risk`, `likert_agree`) is rendered as a 100-step continuous slider: no visible numbers, labelled ends drawn from the choice list's extremes, explicit unset state ("—"), keyboard-accessible. The two `range`-typed confidence questions (`confidence_f`, `confidence_pm`) use the same slider component with "Not at all confident" / "Very confident" labels.
- **R4.** All `relevant` rules from the XLSForm are enforced client-side:
  - Per-interaction experience follow-ups appear only when `sp_<context>` is `pm`, `fox`, or `both` (and only the species-appropriate follow-up is shown).
  - Season, loss details, and signs-of-loss fields appear only when `sp_losses` is `pm`, `fox`, or `both`.
- **R5.** Postcode field accepts UK Northern Ireland postcodes (BT-prefix) OR Republic of Ireland Eircodes; rejects others with a helpful inline message.
- **R6.** No personally identifying data beyond the postcode and the free-text boxes (`other_interactions`, `loss_details`, `signs_losses`, `other_sp_interactions`, `comments`); the consent notice warns participants not to include identifying details in free-text.
- **R7.** Informed consent required before the first question is shown; consent content names Ulster University, purpose, data usage, retention, and right to withdraw (before submit only — submissions are anonymous).
- **R8.** Submissions append as rows to a Google Sheet via a Google Apps Script Web App. Column names match the XLSForm question `name` column (e.g., `species_f`, `pm_pet`, `sp_local_exp_fox`) so exported CSVs are directly compatible with analysis written against the original form.
- **R9.** Responses survive page refresh mid-survey (sessionStorage) and are cleared after successful submission.
- **R10.** Question content is generated from a single `survey-schema.ts` derived from `form.xlsx` — edits to question wording are file edits, not component changes. A re-generation script (`scripts/xlsform-to-schema.ts`) can re-derive the schema from `docs/form.xlsx` if the researcher updates the source.
- **R11.** Multi-select (`select_multiple`) is supported for `season` (4 season choices + "Not sure") and `hobbies` (11 choices); single-select (`select_one`) supports horizontal and vertical layouts depending on option count.
- **R12.** Free-text fields for `other_interactions`, `loss_details`, `signs_losses`, `other_sp_interactions`, and `comments` are all optional and gently encouraged rather than required.

## Scope Boundaries

**In scope:**
- Static site on GitHub Pages, single locale (English).
- Google Apps Script + Google Sheet as the data sink, with the Sheet column headers matching XLSForm `name`s.
- Postcode validation for NI (UK BT) and Republic of Ireland (Eircode).
- All 90 rows from `docs/form.xlsx` translated into the schema, including the two conditional branches (experience follow-ups keyed by `sp_*`; season/loss-detail follow-ups keyed by `sp_losses`).
- Two species identification photos rendered on Page 1 (`fox.jpg`, `pm.jpg`); the consent page optionally renders `Consent.png` if provided.

**Out of scope (non-goals):**
- Translations / multi-language.
- An admin UI on the site (the researcher uses Google Sheets directly).
- Authenticated or invite-only participation, captcha, or IP-based fraud prevention.
- Server-side postcode geocoding.
- Analytics, cookies, or any non-essential third-party script.
- Preserving the Survey123 1–5 Likert encoding for the slider questions — the researcher has explicitly asked for a 0–100 slider scale; this is a deliberate data-format change documented in R3.

## Context & Research

### Source content

- **`docs/form.xlsx`** — the XLSForm authored by the researcher for ArcGIS Survey123. This plan treats it as authoritative for:
  - Question ids (the `name` column) — preserved verbatim as keys in both the client schema and the Google Sheet columns.
  - Question wording (the `label` column) — used as-is, with minor whitespace cleanup only.
  - Hints (the `hint` column) — rendered as helper text under the question label.
  - Choice lists (the `choices` sheet) — mapped to rendered options; the first and last items of each Likert list become the slider's end labels.
  - `appearance` column — used as a hint when choosing a renderer (e.g., `horizontal-compact` → horizontal radios; `table-list` → grouped layout with shared header).
  - `relevant` column — the conditional-visibility expressions are translated into predicate functions on the answers map.
- The source file is committed to the repo; a script re-generates `src/survey/schema.generated.ts` from it so the researcher can edit `form.xlsx` in Excel/Numbers and regenerate without touching code.

### Relevant Code and Patterns

Greenfield repository — this plan establishes the patterns. Conventions:
- Survey content lives in `src/survey/schema.generated.ts` (auto-generated) and a small hand-written `src/survey/pages.ts` that groups questions into wizard pages and adds any page-level copy.
- UI primitives in `src/components/ui/`.
- Wizard pages in `src/pages/`, one file per page.
- Apps Script source in `server/apps-script/Code.gs`.
- XLSForm → TS generator in `scripts/xlsform-to-schema.ts`.

### Institutional Learnings

None — fresh repository. The XLSForm-to-TS generator and the `{ value: number | null, touched: boolean }` slider pattern are the first patterns established.

### External References

- **XLSForm specification** — `type`, `name`, `label`, `hint`, `appearance`, `relevant`, `constraint`, `choice_filter` columns; `select_one <list>`, `select_multiple <list>`, `begin_group`/`end_group`, `note`, `range`, `text`. The `relevant` expressions use a restricted expression language (`${field} = 'value'`, `and`, `or`) — simple enough to parse into a JS predicate.
- **Google Apps Script Web App** — `doPost(e)` deployed "Execute as: Me", "Who has access: Anyone"; use `ContentService.createTextOutput(JSON.stringify(...)).setMimeType(ContentService.MimeType.JSON)`; client sends `Content-Type: text/plain;charset=utf-8` to avoid a failed CORS preflight.
- **UK postcode regex (NI-scoped):** `^BT\d{1,2}\s?\d[A-Z]{2}$`.
- **Eircode regex:** `^[ACDEFHKNPRTVWXY][0-9W][0-9W]\s?[0-9ACDEFHKNPRTVWXY]{4}$`.
- **GDPR lawful basis for academic research** — consent; notice must name controller (researcher + Ulster University), purpose, retention period, and withdrawal rights. Anonymous submissions cannot be withdrawn after the fact — stated plainly.
- **Vite + React + GitHub Pages** — `vite.config.ts` `base` driven by env var; `actions/deploy-pages@v4` in the deploy workflow.

## Key Technical Decisions

- **Vite + React + TypeScript + Tailwind CSS.** Small bundle, good typing for the schema, simple GitHub Pages deploy.
- **React Hook Form + Zod.** RHF for multi-step form state with minimal re-renders; Zod for the submission payload schema, postcode validation, and a runtime sanity-check that the payload matches what Apps Script expects.
- **Hash-routed step machine.** `#/welcome`, `#/intro`, `#/acceptability`, `#/risk`, `#/tolerance`, `#/interactions`, `#/demographics`, `#/thanks`. Browser back works; no router dependency.
- **XLSForm → TS generator.** `scripts/xlsform-to-schema.ts` reads `docs/form.xlsx` and emits `src/survey/schema.generated.ts`: typed question records with their choice lists, labels, hints, and a `relevant` predicate translated from the XLSForm expression into a JS function. The hand-written `src/survey/pages.ts` groups these into wizard pages and adds per-page copy. This keeps content edits (the researcher's job) separate from code edits (ours).
- **100-step slider replaces Likert.** Every question whose type is `select_one likert_<something>` is rendered as a slider in the client schema, even though the XLSForm declares it as a select. The end labels are drawn from the choice list's first (`1`) and last (`5`) items — e.g., `likert_risk` → "Very low risk" / "Very high risk". Middle choice text is preserved in a collapsible "What do these mean?" helper panel per page, so participants can still see the qualitative anchors if they want them. The two `range`-typed confidence questions use the same slider component (0–100, "Not at all confident" / "Very confident").
- **Unset slider state encoded as `null`.** The slider emits `null` until first interaction; the "Next" button is disabled while any required slider is still `null`.
- **Question ids preserved from the XLSForm.** The Google Sheet columns, the sessionStorage payload keys, and the submission JSON all use the `name` column values. This is the researcher's contract with her prior analysis work.
- **Likert scenario scale centred on zero conceptually, but submitted as 0–100.** The submission is always 0–100 (simpler downstream). If the researcher later wants `-50` to `+50` for "acceptability", that's a spreadsheet transformation, not a schema change.
- **Session persistence, not local persistence.** sessionStorage survives refresh but not tab close — avoids draft leakage on shared devices.
- **Postcode stored verbatim (normalised case + whitespace), not geocoded.** Geocoding is a downstream research task.
- **No analytics, no cookies, no external fonts from a CDN.** The only third-party call is the POST to Apps Script. Keeps GDPR surface minimal; no cookie banner needed.
- **Free-text disclaimer.** Each free-text box has helper copy reminding the participant not to include identifying information (names, addresses, phone numbers). The submission blurb also reminds them.

## Open Questions

### Resolved During Planning

- **Storage backend** — Google Sheets via Apps Script (chosen by user).
- **Admin UI** — none; researcher uses the Google Sheet directly.
- **Tech stack** — Vite + React + TS + Tailwind.
- **Routing** — hash-based step machine.
- **Likert → slider mapping** — every `likert_*` Likert renders as a 100-step slider with end labels from the choice list; middle anchors shown in a helper panel.
- **Column names in the Sheet** — match XLSForm `name` values.
- **Content source of truth** — `docs/form.xlsx`, auto-regenerated into a typed schema.

### Deferred to Implementation (or to the researcher)

- **Species photos.** `docs/form.xlsx` references `fox.jpg` and `pm.jpg`. The researcher must provide these files; we place them in `public/species/` and commit. A placeholder warning banner ("Image not yet available") renders if a file is missing so we can ship the site for review without blocking on assets.
- **Consent image (`Consent.png`).** Optional; if provided it renders at the top of the welcome page. Otherwise text-only consent.
- **Final consent wording sign-off.** The draft reflects the `form.xlsx` consent note plus standard GDPR additions (data controller, retention, withdrawal). The researcher must sign off on institutional/ethics wording before public launch.
- **Conditional-logic edge cases in the XLSForm generator.** The `relevant` expressions in `form.xlsx` use simple `${field} = 'value'` patterns joined by `or`. The generator handles this class; if the researcher later adds more complex expressions (e.g., `and`, negation, numeric comparisons), the generator will need extension — the generator's test suite flags unsupported expressions as build errors rather than silently ignoring them.
- **Estimated completion time to show on the welcome screen.** The XLSForm has ~45 questions (before conditional expansion). A median of ~8–10 minutes is a reasonable starting claim; the researcher can refine after a few pilot completions.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

### Content pipeline

```
docs/form.xlsx   ─────▶  scripts/xlsform-to-schema.ts  ─────▶  src/survey/schema.generated.ts
 (researcher edits)       (parses rows + choices,                (typed question records,
                          translates `relevant` to JS)            predicates, choice lists)

                                                         +
                                src/survey/pages.ts  ─────▶  assembled wizard
                                (hand-written: groups          (rendered by PageRenderer)
                                 questions into pages,
                                 adds per-page copy)
```

### Survey schema shape (typed, generated)

```
type Question =
  | { id, type: 'single-choice', prompt, hint?, choices: {value,label}[], layout: 'horizontal'|'vertical', required }
  | { id, type: 'multi-choice',  prompt, hint?, choices: {value,label}[], required }
  | { id, type: 'slider',        prompt, hint?, leftLabel, rightLabel, anchors?: string[], required }
  | { id, type: 'slider-group',  prompt, hint?, items: {id,label}[], leftLabel, rightLabel, anchors?, required }
  | { id, type: 'text',          prompt, hint?, validate?: 'postcode-ie-ni', multiline?, required }
  | { id, type: 'note',          prompt }
  | { id, type: 'image',         src, alt }
  visibleIf?: (answers) => boolean

type Page = { id, title, intro?, questions: Question[] }
```

The generator collapses runs of `likert_*` Likert questions inside a `table-list` group into a single `slider-group` — matching the table rendering in the XLSForm appearance column and avoiding 10 repeated end-labels on screen.

### Wizard flow

```
  Welcome & Consent
         │ (consent required)
         ▼
      Intro          species_f, confidence_f, species_pm, confidence_pm,
                     seen_pm, seen_fox
         ▼
   Acceptability     pm_a..e + fox_a..e     (10 sliders, 1-5 → 0-100)
         ▼
   Risk              pm_pet..humans + fox_pet..humans   (10 sliders)
         ▼
   Tolerance         pm_benefits..lethal + fox_benefits..lethal   (10 sliders)
         ▼
   Interactions      sp_local, sp_property, sp_denning, sp_bins,
                     sp_damage, sp_losses  (fox/pm/both/neither)
                     → conditional per-species experience follow-ups
                     → if sp_losses: season, loss_details, signs_losses
                     + other_sp_interactions (always)
         ▼
   Demographics      age, gender, postcode (validated), job, hobbies
                     + comments (free text)
         ▼ POST
   Thank You         (sessionStorage cleared)
```

The progress bar shows 8 dots (Welcome → Thanks). We previously considered collapsing Acceptability/Risk/Tolerance into one step — thirty sliders on one page is brutal and harms completion rates, so they stay separate.

### Slider behaviour (unchanged from prior design; applied uniformly to all Likert questions)

```
value=null (unset)              value=0..100 (touched)
┌────────────────┐              ┌──●─────────────┐
│    —           │   ───▶       │                │
└────────────────┘              └────────────────┘
  Very Low         Very High
```

Required sliders track `value !== null`. "Next" is disabled until all required questions on the current, visible-under-conditions question set are answered.

### Conditional logic (verbatim from the XLSForm)

The experience follow-up group is visible only when any `sp_<context>` equals `pm`, `fox`, or `both`. Within that group, each per-species experience question is visible only when its corresponding `sp_<context>` equals that species (or `both`). The season, loss-details, and signs-of-loss fields are visible only when `sp_losses` is `pm`, `fox`, or `both`. These rules are translated by the generator into predicate functions; when a question becomes hidden, its answer is cleared from the answers map so nothing stale is submitted.

## Implementation Units

- [ ] **Unit 1: Project scaffolding and GitHub Pages deployment**

**Goal:** A deployable empty shell — committing to `main` publishes a placeholder page.

**Requirements:** R1

**Dependencies:** None

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `.github/workflows/deploy.yml`, `.github/workflows/ci.yml`
- Create: `.gitignore`, `README.md`, `.env.example` (documents `VITE_SUBMIT_URL`, `VITE_BASE_PATH`)

**Approach:**
- Vite React-TS template; Tailwind via the official recipe.
- `vite.config.ts` reads `base` from `VITE_BASE_PATH` so the same build works on `*.github.io/<repo>` and a custom domain.
- Deploy workflow: install → typecheck → `vitest run` → build → `actions/deploy-pages@v4`. Injects `VITE_SUBMIT_URL` and `VITE_BASE_PATH` from repo variables/secrets.
- Separate CI workflow on PRs runs typecheck + unit tests + generator check (see Unit 2).

**Patterns to follow:** None — establishing.

**Test scenarios:**
- Integration — happy path: clean clone + `npm ci && npm run build` produces a `dist/` with hashed assets under the configured base path.
- Integration — happy path: deploy workflow on `main` publishes and the live page renders without console errors.

**Verification:**
- Push to `main` → live GitHub Pages URL renders a placeholder page; `tsc --noEmit` passes in CI.

---

- [ ] **Unit 2: XLSForm → TypeScript schema generator**

**Goal:** A build-time script that reads `docs/form.xlsx` and emits `src/survey/schema.generated.ts` — a typed representation of every question, choice list, and `relevant` predicate.

**Requirements:** R4, R10, R11

**Dependencies:** Unit 1

**Files:**
- Create: `scripts/xlsform-to-schema.ts` (run via `tsx`)
- Create: `scripts/xlsform/parse-xlsx.ts` (reads sheets → structured rows using `exceljs`)
- Create: `scripts/xlsform/translate-relevant.ts` (XLSForm expression → JS predicate source string)
- Create: `scripts/xlsform/emit-schema.ts` (typed TS emitter)
- Create: `scripts/__tests__/xlsform.test.ts`
- Modify: `package.json` — `"generate:schema": "tsx scripts/xlsform-to-schema.ts"`; the deploy workflow runs it before build and fails if the emitted file differs from the committed copy (forces the researcher/us to commit regenerated schemas deliberately).

**Approach:**
- Grouping: the parser walks the `survey` sheet tracking `begin_group`/`end_group` nesting. A `table-list` group containing only `select_one likert_*` rows is collapsed into a single `slider-group` question (its prompt is the group label; its items are the child rows; its end labels come from the choice list).
- Type translation: `select_one <list>` → `single-choice`; `select_multiple <list>` → `multi-choice`; `range` (with `slider` appearance) → `slider`; `text` → `text`; `note` → `note`; any `select_one likert_*` outside a collapsible group → standalone `slider`.
- Choice list extraction: first and last items of each Likert list become the slider's `leftLabel` / `rightLabel`; the full list (1–5 labels) is preserved as `anchors` so the page renderer can show a "What do these mean?" panel.
- `relevant` translation: a small parser for the subset used in this form — `${field} = 'value'` expressions joined by `or`/`and`, optionally with newlines. Emits a function body like `return answers.sp_local === 'pm' || answers.sp_local === 'both'`. Unsupported tokens raise an error at generate time — better to fail the build than to silently ship a broken conditional.
- Question ids are kept verbatim (including trailing spaces that appear in a handful of XLSForm `name` values — normalised to trimmed once, but logged as warnings so we can push back on the source if it matters).
- Output is a single `schema.generated.ts` file with a banner `// Generated from docs/form.xlsx — do not edit by hand. Run \`npm run generate:schema\` to regenerate.`

**Patterns to follow:** None — establishing.

**Test scenarios:**
- Happy path: running the generator against `docs/form.xlsx` emits a file that typechecks and contains every question id from the `survey` sheet.
- Happy path: `likert_*` table-list groups collapse into a single `slider-group` with the expected items.
- Happy path: `relevant` expressions like `${sp_local} = 'pm' or ${sp_local} = 'both'` translate to a predicate returning the correct boolean for representative answer maps.
- Edge case: a question `name` with trailing whitespace emits a warning and normalises; the test asserts the normalisation is deterministic.
- Error path: an unsupported `relevant` expression (e.g., containing `number(...)`) fails the generator with a clear error naming the offending row.
- Integration: the committed `src/survey/schema.generated.ts` is byte-identical to fresh output from the generator — enforced by a CI step.

**Verification:**
- `npm run generate:schema` produces a typed schema; `tsc --noEmit` passes against it; every question id from `docs/form.xlsx` appears in the output; CI check prevents drift between source and committed output.

---

- [ ] **Unit 3: Design system foundation**

**Goal:** Tailwind tokens, typography, and a coherent visual identity. Muted forest palette, self-hosted Inter, WCAG-AA-compliant focus states.

**Requirements:** R1

**Dependencies:** Unit 1

**Files:**
- Modify: `tailwind.config.ts` (palette, fonts, spacing scale)
- Modify: `src/index.css` (base + font-face, self-hosted)
- Create: `src/components/ui/Button.tsx`, `Checkbox.tsx`, `RadioGroup.tsx`, `CheckboxGroup.tsx`, `TextInput.tsx`, `TextArea.tsx`, `ProgressBar.tsx`, `FieldLabel.tsx`, `HelperText.tsx`
- Create: `src/components/ui/__tests__/` — one smoke test per primitive
- Create: `public/fonts/` (self-hosted Inter variable)

**Approach:**
- Muted forest green primary, warm stone neutrals, restrained accent. Avoid SaaS gradients; lean academic-editorial.
- Self-hosted Inter; no Google Fonts link (no cookies).
- `RadioGroup` supports both horizontal (for `horizontal-compact` XLSForm appearance) and vertical layouts.
- `CheckboxGroup` supports `multi-choice` questions (`season`, `hobbies`).
- Focus states are high-contrast.

**Test scenarios:**
- Happy path: each primitive renders, responds to clicks/keyboard, emits the correct value.
- Edge case: disabled button does not fire; disabled input is not focusable; error state on text input has visible styling and an `aria-invalid`.
- Accessibility: each component has a visible focus ring when keyboard-focused.

**Verification:**
- A temporary gallery route (deleted before launch) shows all primitives with consistent styling across mobile and desktop widths.

---

- [ ] **Unit 4: Wizard shell, step state machine, and persistence**

**Goal:** The frame hosting the 8 wizard steps — progress bar, Back/Next, hash-based step sync, sessionStorage persistence, validation-gated navigation.

**Requirements:** R2, R9

**Dependencies:** Units 2, 3

**Files:**
- Create: `src/survey/wizard-state.ts`, `src/survey/use-wizard.ts`, `src/survey/persistence.ts`
- Create: `src/components/WizardShell.tsx`
- Create: `src/survey/__tests__/wizard-state.test.ts`, `persistence.test.ts`

**Approach:**
- State: `{ currentStep: StepId, answers: Record<QuestionId, AnswerValue>, submissionId: string, startedAt: ISOString }`. `submissionId` generated once (uuid) on first page view; used for idempotent retries.
- Hash sync: effect writes `#/<stepId>`; hash-change listener updates state. Invalid hashes are rejected and rewritten to the current valid step.
- Persistence: debounced writes to `sessionStorage` under a versioned key (`wildlife-survey:v1`); hydrate on mount; discard on version mismatch.
- When a question becomes hidden by `visibleIf`, its answer is stripped from the answers map so stale values aren't submitted.
- `canProceed(step)` walks the page's questions, evaluates `visibleIf` against current answers, and checks that every currently-visible required question has a non-null answer. Slider-groups are "complete" when every item is `!== null`.

**Test scenarios:**
- Happy path: goForward advances, goBack reverses, no-ops at boundaries.
- Happy path: answers persist to sessionStorage and hydrate on remount; `submissionId` is stable across refresh.
- Edge case: required slider at null blocks canProceed; filling it unblocks.
- Edge case: flipping a gating answer from `pm` to `neither` removes the now-hidden follow-up answers from the stored map (asserted by inspecting the map before/after).
- Edge case: a sessionStorage with stale schema version is discarded cleanly.
- Error path: sessionStorage unavailable (private mode / quota) does not throw; wizard still works without persistence.
- Integration: browser back after advancing restores the previous step and preserves answers.

**Verification:**
- A two-step stub can be navigated forward/back; answers persist across refresh; progress bar updates.

---

- [ ] **Unit 5: Risk slider component (with unset state + multi-scale labels)**

**Goal:** The bespoke slider used for every Likert-style question and the two confidence questions — 100 steps, no visible numbers, labelled ends, explicit unset state.

**Requirements:** R3

**Dependencies:** Unit 3

**Files:**
- Create: `src/components/ui/RiskSlider.tsx`
- Create: `src/components/ui/RiskSliderGroup.tsx`
- Create: `src/components/ui/__tests__/RiskSlider.test.tsx`

**Approach:**
- Backing element: native `<input type="range" min="0" max="100" step="1">`, visually hidden; custom track+thumb drawn on top. Native input buys Tab focus, arrows, Home/End, PgUp/PgDn, and sensible screen-reader behaviour for free.
- Value prop: `number | null`. While `null`, the thumb renders centre-left muted, the value indicator shows `—`, and the ARIA `aria-valuetext` is `"not answered"`. First interaction (click on track, drag, key press) commits a value; no auto-jump to 50.
- Track fill is grey while unset; primary colour once set.
- Group component: header row showing `leftLabel` and `rightLabel` (aligned to the track extents); one row per item (item label on the left, slider on the right). A collapsed "What do these mean?" toggle reveals the full 5-point anchor labels inline (for Likert groups only; hidden for the confidence questions).
- Mobile: touch dragging updates continuously and settles on release; the thumb target is ≥ 44×44 (WCAG AAA target size).

**Test scenarios:**
- Happy path: value=null renders `—` indicator and muted thumb.
- Happy path: click at ~75% of the track sets value to ~75 and emits the change.
- Happy path: ArrowRight from 42 emits 43; Home emits 0; End emits 100.
- Edge case: ArrowRight from null sets to 1 (not null → no-op).
- Edge case: ArrowLeft at 0 stays at 0.
- Edge case: touch drag on mobile updates continuously; release commits.
- Accessibility: slider is reachable via Tab; `aria-valuetext` reflects answered/unanswered state; visible focus ring.
- Integration: in a 5-item RiskSliderGroup, each slider has independent state and the group's completion check requires all five.

**Verification:**
- Gallery shows single slider + 5-item group + confidence-style variant; all interactions (mouse, touch, keyboard) behave correctly; VoiceOver announces unset vs set states distinctly.

---

- [ ] **Unit 6: Postcode validation for NI and ROI**

**Goal:** A pure validator accepting UK BT postcodes or Irish Eircodes; rejecting everything else with a tailored reason code.

**Requirements:** R5

**Dependencies:** Unit 1

**Files:**
- Create: `src/survey/validators/postcode.ts`
- Create: `src/survey/validators/__tests__/postcode.test.ts`

**Approach:**
- Normalise: trim, uppercase, collapse whitespace, insert a space before the last 3 chars (UK) or last 4 (Eircode) if missing.
- Try NI regex (`^BT\d{1,2}\s\d[A-Z]{2}$`), then Eircode regex (`^[ACDEFHKNPRTVWXY][0-9W][0-9W]\s[0-9ACDEFHKNPRTVWXY]{4}$`).
- Return `{ ok: true, normalised }` or `{ ok: false, reason }` where `reason ∈ 'empty' | 'looks-like-gb-postcode' | 'unrecognised'`.

**Test scenarios:**
- Happy path: `BT12 5AB`, `bt125ab`, ` BT12  5AB ` → `BT12 5AB`, ok.
- Happy path: `D02 X285`, `d02x285` → `D02 X285`, ok.
- Edge case: valid Eircode with `W` middle char (spec-allowed).
- Error path: empty → `empty`; `SW1A 1AA` (GB outside NI) → `looks-like-gb-postcode`; `12345` → `unrecognised`.

**Verification:**
- All scenarios pass; function is pure, no I/O.

---

- [ ] **Unit 7: Survey page renderer (from generated schema)**

**Goal:** The generic renderer that turns `Page` + `Question` records into UI; handles `visibleIf` evaluation and per-page completion checks.

**Requirements:** R2, R4, R10, R11, R12

**Dependencies:** Units 2, 3, 4, 5, 6

**Files:**
- Create: `src/survey/pages.ts` (hand-written: imports questions from `schema.generated.ts` and assembles 8 pages with per-page copy)
- Create: `src/survey/PageRenderer.tsx`, `src/survey/QuestionRenderer.tsx`
- Create: `src/survey/__tests__/PageRenderer.test.tsx`

**Approach:**
- `QuestionRenderer` uses a `switch(question.type)` with a `never` default for exhaustiveness.
- For `slider-group`, the page renderer shows the group prompt + a "What do these mean?" toggle that reveals the 5 anchor labels from the source choice list.
- For `text` with `validate: 'postcode-ie-ni'`, wires in Unit 6.
- `multi-choice` renders as a `CheckboxGroup`; `single-choice` renders as a horizontal `RadioGroup` when option count ≤ 4 and the XLSForm appearance suggests it, otherwise vertical.
- `image` renders a `<figure>` with the photo and alt text (species photos on Page 1).
- The renderer respects `visibleIf` on individual questions — not just whole groups — so within the interactions page the per-species experience questions can appear/disappear independently.
- Free-text fields render with a small "Please do not include identifying information (names, phone numbers, addresses) in your answer." helper line.

**Test scenarios:**
- Happy path: rendering each question type produces expected controls.
- Happy path: a question with `visibleIf: answers.sp_local === 'pm'` renders only when `sp_local` is `pm` (and disappears when changed).
- Edge case: `slider-group`'s "anchors" toggle reveals/hides the 5 labels.
- Edge case: `image` question with a missing `src` renders the placeholder warning rather than a broken image.
- Integration: switching a parent answer that hides a subtree also clears the hidden answers from the map.
- Error path: an unknown question type is a compile-time error (`never` exhaustiveness).

**Verification:**
- Navigating the wizard shows plausible UI on every page; the conditional experience questions appear/disappear correctly under every combination of `sp_<context>` values.

---

- [ ] **Unit 8: Welcome page with informed consent**

**Goal:** A clear, plain-language welcome + consent screen participants must explicitly opt into before any questions (R7).

**Requirements:** R2, R6, R7

**Dependencies:** Units 3, 4

**Files:**
- Create: `src/pages/WelcomePage.tsx`
- Create: `src/survey/consent-content.ts` (the consent text as structured data so it's easy for the researcher to review in a PR)
- Create: `src/pages/__tests__/WelcomePage.test.tsx`

**Approach:**
- Draft consent copy based on the XLSForm `consent` note, expanded with:
  - Plain-language summary (what, who, why, ~8–10 minutes).
  - What we collect (answers + postcode) and what we don't (name, contact details).
  - Controller: researcher name + Ulster University, School of Geography and Environmental Sciences.
  - Retention period (placeholder — researcher signs off).
  - Right to withdraw before submission only (anonymous submissions cannot be retracted).
  - Contact email for questions (placeholder).
  - A "Please do not include identifying information in free-text answers" warning.
- Required `Checkbox`: "I have read the information above and consent to taking part." The Start button is disabled until checked.
- If `public/species/Consent.png` exists it renders at the top of the page; otherwise a text-only layout.
- Copy flagged with `TODO(researcher):` in-file for the pieces the researcher must finalise (exact retention period, ethics committee reference, contact email).

**Test scenarios:**
- Happy path: checking consent enables Start; clicking advances.
- Edge case: attempting to advance without consent is blocked (button disabled, Enter is a no-op).
- Accessibility: consent checkbox has a label; Start has an accessible name.

**Verification:**
- Welcome page renders, blocks advancement without consent, passes to Intro once consented.

---

- [ ] **Unit 9: Page definitions — Intro, Acceptability, Risk, Tolerance, Interactions, Demographics**

**Goal:** Wire up the six content pages from `src/survey/pages.ts`, assigning generated-schema questions to pages and adding any per-page intro copy.

**Requirements:** R2, R4, R6, R11, R12

**Dependencies:** Units 5, 6, 7

**Files:**
- Modify: `src/survey/pages.ts` (the authoritative page grouping)
- Create: `src/pages/IntroPage.tsx`, `AcceptabilityPage.tsx`, `RiskPage.tsx`, `TolerancePage.tsx`, `InteractionsPage.tsx`, `DemographicsPage.tsx`
- Create: `public/species/.gitkeep` (awaits `fox.jpg` / `pm.jpg` from researcher)
- Create: `src/pages/__tests__/InteractionsPage.test.tsx`, `DemographicsPage.test.tsx`

**Approach:**
- Each page component is thin: renders a title, optional intro paragraph, delegates the question list to `<PageRenderer />`.
- **Intro:** `species_f`, then `confidence_f`; `species_pm`, then `confidence_pm`; two `seen_*` yes/no/unsure questions. Renders the two species photos inline with the identification questions.
- **Acceptability:** `pm_scenarios` slider-group (`pm_a` → `pm_e`), then `fox_scenarios` slider-group. A short intro paragraph explains the scale (left = completely unacceptable, right = completely acceptable).
- **Risk:** `pm_risk` slider-group, then `fox_risk` slider-group. Intro explains the scale (left = very low risk, right = very high risk).
- **Tolerance:** `pm_tolerance`, then `fox_tolerance` slider-groups. Intro explains the scale (left = strongly disagree, right = strongly agree).
- **Interactions:** the `interactions_group` (6 `sp_*` fox/pm/both/neither rows) + the always-visible `other_interactions` text. Then the experience group and loss/season/details, all gated by their `visibleIf` predicates from the generator. Final always-visible `other_sp_interactions`.
- **Demographics:** `age`, `gender`, `postcode` (with Unit 6 validator on blur + submit), `job`, `hobbies` (multi-select), `comments` (free text).
- Free-text questions use `<TextArea>` with the "no identifying info" helper.

**Test scenarios:**
- Happy path: filling required slider-groups unblocks Next on Acceptability/Risk/Tolerance pages.
- Happy path: on the Interactions page, setting `sp_local = 'pm'` reveals only the pine marten experience follow-up for `sp_local_exp_pm`; setting to `both` reveals both fox and pine marten follow-ups.
- Happy path: setting `sp_losses` to any of `pm`/`fox`/`both` reveals the season/loss-details/signs-of-loss block; setting to `neither` hides them and clears their values.
- Happy path: valid BT or Eircode passes demographics validation; Next advances.
- Error path: invalid postcode shows a `reason`-tailored message; Next stays disabled.
- Edge case: free-text fields may be left blank; Next is not blocked by empty `comments` / `loss_details` / etc.
- Integration: at the end of Demographics, the answers map contains keys only for currently-visible questions — the assertion walks every question id in the schema and checks that a hidden one is absent from the map.

**Verification:**
- End-to-end: walking through Pages 1–6 with a realistic set of answers produces a complete, consistent answers map; toggling gating answers on Interactions correctly shows/hides follow-ups and clears stale values.

---

- [ ] **Unit 10: Submission pipeline (Apps Script + client) and Thank-You page**

**Goal:** POST the completed answers map to a Google Apps Script Web App that appends one row to a Google Sheet; show loading/error/success states; render Thank You.

**Requirements:** R2, R8, R9

**Dependencies:** Unit 9

**Files:**
- Create: `src/survey/submit.ts`, `src/survey/__tests__/submit.test.ts`
- Create: `src/pages/ThankYouPage.tsx`
- Create: `server/apps-script/Code.gs`
- Create: `server/apps-script/README.md` (researcher-facing: create the Sheet, paste the script, deploy, copy the URL into GitHub repo variables)
- Create: `server/apps-script/header-row.ts` (small Node script that emits the canonical header row — question ids matching the XLSForm names — as a TSV the researcher pastes into row 1 of the Sheet)

**Approach:**
- **Payload shape.** Flat JSON: `{ surveyVersion: 1, submissionId: string, startedAt, submittedAt, answers: { <questionId>: <value>, ... } }`. Slider values are numbers 0–100 or `null` for hidden. Single-choice values are the choice `name`. Multi-choice values are arrays of `name`s. The Apps Script projects `answers` onto the header row, writing `""` for missing keys.
- **Request.** `POST` with `Content-Type: text/plain;charset=utf-8` (avoids CORS preflight); body is `JSON.stringify(payload)`. Apps Script parses `e.postData.contents`.
- **Client states.** `idle → submitting → success | error`. `submitting` disables inputs, shows spinner. `error` shows message + Retry (re-POSTs same payload, same `submissionId`). `success` transitions to Thank You and clears sessionStorage.
- **Idempotency.** Apps Script records the `submissionId` in a dedupe column; repeated submissions within 24h are ignored and return the original row's timestamp.
- **Dev fallback.** Unset `VITE_SUBMIT_URL` → `submit.ts` logs the payload to console and resolves success. Lets the researcher review locally without deploying the Apps Script.
- **Column order.** `scripts/generate-header-row.ts` reads `docs/form.xlsx` (same source as the schema) and emits the canonical header — question ids in XLSForm order — to `server/apps-script/header-row.tsv`. Researcher copies row 1 from this file into the Sheet exactly once, after creating the Sheet. Committing the TSV gives change-tracking if the form evolves.

**Test scenarios:**
- Happy path: `submit()` with mocked fetch returning 200 resolves success; payload shape matches the contract (flat `answers`, `submissionId`, timestamps); slider nulls pass through.
- Happy path: success transitions to Thank You and clears sessionStorage.
- Edge case: unset `VITE_SUBMIT_URL` takes dev-fallback path (no fetch, success).
- Error path: fetch rejects → error state with retry; retry re-POSTs same payload and same `submissionId`.
- Error path: fetch resolves non-2xx → error state with status-reflecting message.
- Integration: `Code.gs` given a well-formed payload appends one row matching the header; a duplicate `submissionId` within 24h is a no-op (verified manually against a live deployment per the README).

**Verification:**
- End-to-end: filling the survey on the deployed site results in a new row in the Google Sheet within 1–2 seconds; refreshing post-submit shows the welcome page (sessionStorage cleared).

---

- [ ] **Unit 11: Accessibility, content polish, and launch readiness**

**Goal:** Cross-cutting quality pass — WCAG AA, keyboard-only walkthrough, mobile QA (iOS / Android), content review with researcher.

**Requirements:** R1, R6, R7

**Dependencies:** Unit 10

**Files:**
- Modify: components with accessibility gaps uncovered during the pass
- Create: `docs/accessibility-checklist.md`, `docs/launch-checklist.md`
- Modify: `.github/workflows/deploy.yml` — add `@axe-core/cli` run against the built preview (non-blocking report uploaded as an artifact)

**Approach:**
- Manual keyboard-only walkthrough end-to-end.
- `axe` run against the built site; fix every critical/serious finding.
- Mobile QA at 375px and 414px; pay attention to slider touch behaviour, iOS on-screen keyboard occluding inputs, long labels wrapping in `slider-group`.
- Colour contrast audit (body 4.5:1, large 3:1).
- Screen-reader smoke test: slider state announcements, page-change announcements, form error announcements.
- Content review session with researcher:
  - Confirm consent wording.
  - Confirm `fox.jpg` / `pm.jpg` are the correct photos (attribution/licensing clear).
  - Confirm no placeholder `TODO(researcher):` tags remain.
  - Confirm the "How long does this take?" claim (~8–10 minutes) after a pilot run.
- Launch checklist filed at `docs/launch-checklist.md` covering: real photos in place, consent signed off, submit URL live, sample submission lands in the Sheet, tested on one iOS + one Android device, axe report attached to the launch PR.

**Test scenarios:**
- Happy path: full survey completable via keyboard only.
- Happy path: axe scan reports zero critical/serious violations.
- Edge case: slider operable on touch devices; on-screen keyboard doesn't hide the active input on iOS.
- Integration: at 375px no horizontal scroll on any page; slider-groups with long item labels wrap cleanly.

**Verification:**
- Accessibility and launch checklists ticked; axe report attached to launch PR; researcher signs off on content.

## System-Wide Impact

- **Interaction graph.** Wizard state is the single source of truth; every page reads/writes through `useWizard()`. The generator's `visibleIf` predicates are the only place conditional logic lives — there is no hand-coded if/else anywhere in page components, so the XLSForm remains authoritative.
- **Error propagation.** Validation errors stay local (inline). Submission errors surface on the final step with a Retry affordance; wizard state is preserved so retries reuse the same `submissionId`.
- **State lifecycle risks.** Mid-survey refresh hydrates from sessionStorage; version mismatch discards cleanly. Double-submit is prevented by `submissionId` (button disabled while submitting + server-side dedupe).
- **API surface parity.** The Apps Script URL is the only external contract. Column names match XLSForm `name`s for compatibility with any pre-existing analysis scripts the researcher has. `surveyVersion` is part of the payload so future breaking changes are explicit.
- **Integration coverage.** Unit tests cover the generator, slider, validator, wizard state, and submit function. End-to-end verification is a human walkthrough per deploy (documented in the launch checklist). No Playwright — not worth the setup cost for a small survey with infrequent deploys.
- **Unchanged invariants.** The XLSForm in `docs/form.xlsx` is the authoritative content source; nothing in the generated schema is hand-edited. If the researcher updates the form, regenerating the schema is a one-command operation.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Apps Script transient failures during a traffic spike. | Idempotent `submissionId`, client-side retry (3 attempts, exponential backoff), friendly error screen. |
| Researcher updates `docs/form.xlsx` with an expression the generator doesn't support (e.g., `and`/negation/numeric comparisons added to `relevant`). | Generator fails the build with a clear error naming the offending row. Extending the translator is a small, contained change. |
| Slider replaces 5-point Likert, but an analysis plan expected 1–5 codes. | Documented in R3 as an intentional change. Mapping 0–100 back to 1–5 buckets is a trivial spreadsheet formula if a particular analysis needs it. |
| Postcode regex rejects a legitimate Eircode or BT postcode (spec drift or human typo). | `reason: 'unrecognised'` submissions can be monitored; an escape hatch ("my postcode isn't accepted — enter anyway") can be added if real cases appear. Not pre-built. |
| GDPR consent wording not institution-approved at launch. | `TODO(researcher)` tags in `consent-content.ts`; launch checklist requires sign-off before public share. |
| Spam / junk submissions on a public endpoint. | Accept risk at launch. Honeypot + time-to-complete can be bolted on if needed. |
| Researcher pastes the wrong header row into the Sheet, breaking column alignment. | `server/apps-script/header-row.tsv` is regenerated from `docs/form.xlsx` and committed; deploy README gives exact copy-paste steps; Apps Script verifies header row on first submission and logs (but doesn't block) mismatches. |
| Species photos (`fox.jpg`, `pm.jpg`) arrive late or have licensing issues. | Site renders a placeholder warning if a photo file is missing — the site can be reviewed end-to-end without blocking on assets. Photo licensing confirmed in the launch checklist. |

## Documentation / Operational Notes

- `README.md`: local dev, build, deploy; how to swap in new content (edit `docs/form.xlsx`, run `npm run generate:schema`, commit, push).
- `server/apps-script/README.md`: step-by-step Google Sheet + Apps Script deployment.
- `docs/accessibility-checklist.md`: record of what was tested and how.
- `docs/launch-checklist.md`: pre-public-share verification steps.

## Sources & References

- `docs/form.xlsx` — authoritative XLSForm content (90 survey rows, 15 choice lists) as provided by the researcher.
- User-provided image of the ArcGIS Survey123 prototype (slider design reference for the unset state, 2026-04-17).
- User request in `/compound-engineering:ce-plan` invocation (2026-04-17), including the 5-page structure and slider preference.
- XLSForm specification (for `type`, `relevant`, group/appearance semantics) — public reference.
