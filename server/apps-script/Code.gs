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
    var payload = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");

    // Resolve the spreadsheet robustly:
    // 1) If a script property `SPREADSHEET_ID` is set, open by id (works for
    //    standalone deployments and container-bound scripts).
    // 2) Fall back to the active spreadsheet (works when the script is
    //    container-bound in the Sheet editor).
    function getSpreadsheet() {
      try {
        var sid = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
        if (sid) return SpreadsheetApp.openById(sid);
      } catch (err) {
        Logger.log("Failed to open by SPREADSHEET_ID: %s", String(err));
      }
      try {
        return SpreadsheetApp.getActiveSpreadsheet();
      } catch (err) {
        Logger.log("getActiveSpreadsheet failed: %s", String(err));
      }
      return null;
    }

    var ss = getSpreadsheet();
    if (!ss) {
      var msg = "No spreadsheet available. Set SPREADSHEET_ID script property or run as a container-bound script.";
      Logger.log(msg);
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: msg })).setMimeType(ContentService.MimeType.JSON);
    }

    function getWriteSheet(workbook) {
      var sheet = workbook.getSheetByName("Sheet1");
      if (sheet) return sheet;
      sheet = workbook.getSheetByName("Responses");
      if (sheet) return sheet;
      var sheets = workbook.getSheets();
      if (sheets.length > 0) return sheets[0];
      return workbook.insertSheet("Sheet1");
    }

    function backupSubmission(workbook, payload, errorMessage) {
      try {
        var backup = workbook.getSheetByName("SubmissionBackup");
        if (!backup) {
          backup = workbook.insertSheet("SubmissionBackup");
          backup.appendRow(["recordedAt", "error", "payload"]);
        }
        backup.appendRow([new Date().toISOString(), errorMessage || "", JSON.stringify(payload || {})]);
      } catch (backupError) {
        Logger.log("Backup write failed: %s", String(backupError));
      }
    }

    var sheet = getWriteSheet(ss);
    if (!sheet) {
      var msg = "Unable to resolve a writable sheet in the spreadsheet.";
      Logger.log(msg);
      backupSubmission(ss, payload, msg);
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: msg })).setMimeType(ContentService.MimeType.JSON);
    }

    var lastColumn = sheet.getLastColumn();
    if (lastColumn === 0) {
      var msg = "Target sheet has no header row. Please paste header-row.tsv into row 1.";
      Logger.log(msg);
      backupSubmission(ss, payload, msg);
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: msg })).setMimeType(ContentService.MimeType.JSON);
    }

    var header = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

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

    try {
      sheet.appendRow(row);
    } catch (writeError) {
      var msg = "Write failed: " + String(writeError);
      Logger.log(msg);
      backupSubmission(ss, payload, msg);
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: msg })).setMimeType(ContentService.MimeType.JSON);
    }

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