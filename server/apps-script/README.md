# Google Sheets backend — one-time setup

This survey site posts each completed response to a Google Apps Script Web App
that appends one row to a Google Sheet you own. Responses land in the sheet
within 1–2 seconds of submit.

## 1. Create the Sheet

1. Go to https://sheets.google.com and create a new spreadsheet.
2. Name it something memorable (e.g. **Wildlife Survey Responses**).
3. Generate the header row locally:
   ```bash
   npm run generate:schema        # (ensures the schema is up to date)
   npm run generate:header-row    # writes server/apps-script/header-row.tsv
   ```
4. Open `server/apps-script/header-row.tsv` in a text editor, copy the entire
   line, and paste it into **row 1** of the Sheet. Each tab becomes a column.
   Order matters — it must match what the script expects.

## 2. Deploy the Apps Script

1. In the Sheet: **Extensions → Apps Script**. A new editor tab opens.
2. Delete any placeholder in `Code.gs` and paste the entire contents of
   `server/apps-script/Code.gs` from this repo.
3. Click **Save** (disk icon). Give the project a name if prompted.
4. Click **Deploy → New deployment**.
   - Click the gear icon, choose **Web app**.
   - Description: `Wildlife survey endpoint`.
   - **Execute as:** *Me* (your Google account).
   - **Who has access:** *Anyone*.
   - Click **Deploy**.
5. Google will ask for authorization on first deploy. Accept the permissions
   (the script only writes to this one sheet).
6. Copy the **Web app URL** that ends in `/exec`. This is what the frontend
   will POST to.

## 3. Wire the URL into the site

1. In your GitHub repo, go to **Settings → Secrets and variables → Actions →
   Variables**.
2. Click **New repository variable**.
3. Name: `VITE_SUBMIT_URL`. Value: the URL from step 2.6 above.
4. Re-run the deploy workflow (Actions tab → latest workflow → **Re-run all
   jobs**) or push any small change. The site is now connected.

## 4. Test it

1. Visit the deployed site.
2. Fill in and submit a test response.
3. Open the Sheet — the new row should appear within a few seconds.

## Maintenance

- **Changing the survey content:** edit `docs/form.xlsx`, then run
  `npm run generate:schema && npm run generate:header-row`, commit, and push.
  If new columns appeared, paste the fresh header row into row 1 of the Sheet
  (existing rows keep their values; new columns are blank for old submissions).
- **Redeploying the Apps Script:** after any edit to `Code.gs`, click
  **Deploy → Manage deployments → Edit → Version: New version → Deploy** to
  publish the change. The URL stays the same.
- **Exporting to CSV:** in the Sheet, **File → Download → Comma-separated
  values (.csv)**.

## Troubleshooting

- **Rows not appearing.** Check the Apps Script **Executions** view
  (`View → Executions` in the Apps Script editor) for errors.
- **CORS errors in the browser console.** The site posts with
  `Content-Type: text/plain;charset=utf-8` to avoid preflight; if you change
  that, you will hit CORS. Leave it as-is.
- **Duplicates.** The script dedupes by `submissionId` within the same sheet.
  Repeated network retries from the client won't create duplicate rows.
