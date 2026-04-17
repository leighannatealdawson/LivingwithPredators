/**
 * Google Apps Script endpoint for the Wildlife Perception Survey.
 *
 * Deployment (one-time):
 *   1. Create a new Google Sheet. Call it something like "Wildlife Survey Responses".
 *   2. Paste the contents of `server/apps-script/header-row.tsv` into row 1
 *      of the first sheet. These are the column names that map to the
 *      submission payload.
 *   3. In the Sheet, Extensions -> Apps Script. Paste this entire file into
 *      `Code.gs`. Save.
 *   4. Deploy -> New deployment -> type "Web app".
 *         - Execute as: Me
 *         - Who has access: Anyone
 *      Click "Deploy" and copy the Web App URL.
 *   5. Set that URL as the repo variable / secret `VITE_SUBMIT_URL` in GitHub
 *      (Settings -> Secrets and variables -> Actions -> Variables).
 *   6. Re-run the deploy workflow. The public site will now POST to this
 *      endpoint on submit.
 *
 * Updating after a schema change:
 *   - Regenerate header-row.tsv (`npm run generate:header-row`) and paste row 1
 *     into the Sheet. New columns appear on the right; existing rows keep
 *     their values.
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || "{}");
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Dedupe: skip if this submissionId already exists (idempotent retries).
    var submissionId = payload.submissionId || "";
    if (submissionId) {
      var idCol = header.indexOf("submissionId");
      if (idCol >= 0 && sheet.getLastRow() > 1) {
        var existing = sheet
          .getRange(2, idCol + 1, sheet.getLastRow() - 1, 1)
          .getValues()
          .flat()
          .map(String);
        if (existing.indexOf(submissionId) >= 0) {
          return ContentService.createTextOutput(
            JSON.stringify({ ok: true, duplicate: true })
          ).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Build the row in header order.
    var row = header.map(function (col) {
      if (col === "submissionId") return payload.submissionId || "";
      if (col === "submittedAt") return payload.submittedAt || "";
      if (col === "startedAt") return payload.startedAt || "";
      if (col === "surveyVersion") return payload.surveyVersion || "";
      if (col === "userAgent") return payload.userAgent || "";
      var value = payload.answers ? payload.answers[col] : null;
      if (value === null || typeof value === "undefined") return "";
      return value;
    });

    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, service: "wildlife-survey" })
  ).setMimeType(ContentService.MimeType.JSON);
}
