// =====================================================================
//  Code.gs — Google Apps Script receiver for the jsPsych experiment.
//  Writes each session's CSV into a Drive folder you own.
//
//  Setup (once, ~5 minutes):
//   1. Create a folder in Google Drive for the data. Open it; the folder ID
//      is the long string at the end of the URL. Paste it into FOLDER_ID.
//   2. Go to https://script.google.com → New project. Replace the default
//      code with this file. Save.
//   3. Deploy → New deployment → type "Web app".
//        Execute as:      Me
//        Who has access:  Anyone
//      Authorise when prompted. Copy the Web app URL (ends in /exec).
//   4. Paste that URL into GDRIVE_URL in index.html.
//   5. Test: open index.html?pid=TEST&session=1, click through, and
//      check that TEST_s1.csv appears in the folder.
//
//  After ANY edit to this script you must Deploy → Manage deployments →
//  edit → "New version", or the old code keeps running.
//
//  Security: the URL is unguessable but public; anyone with it can write
//  files to this folder. Keep it out of the public repo if that matters
//  (e.g. load it from a small separate config.js that is .gitignored).
// =====================================================================

const FOLDER_ID = "https://drive.google.com/drive/folders/1mTTuyeCNNvfo4k1chhj6e4zMBKyDXwDV";
const LOG_SHEET_NAME = "submissions";   // a log sheet is created in the same folder

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const pid = String(payload.pid || "unknown").replace(/[^\w\-]/g, "_");
    const session = String(payload.session || "0").replace(/[^\d]/g, "");
    let filename = String(payload.filename || (pid + "_s" + session + ".csv")).replace(/[^\w\-\.]/g, "_");
    const csv = String(payload.csv || "");
    if (!csv) return respond({ ok: false, error: "empty csv" });

    const folder = DriveApp.getFolderById(FOLDER_ID);

    // never overwrite: if the name exists, add a timestamp
    if (folder.getFilesByName(filename).hasNext()) {
      const stamp = Utilities.formatDate(new Date(), "UTC", "yyyyMMdd-HHmmss");
      filename = filename.replace(/\.csv$/, "") + "_" + stamp + ".csv";
    }
    folder.createFile(filename, csv, MimeType.CSV);
    logSubmission(folder, pid, session, filename, csv.length);
    return respond({ ok: true, filename: filename });
  } catch (err) {
    return respond({ ok: false, error: String(err) });
  }
}

// GET is handy for checking the deployment is alive
function doGet() {
  return respond({ ok: true, message: "experiment receiver is running" });
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function logSubmission(folder, pid, session, filename, bytes) {
  let ss;
  const it = folder.getFilesByName(LOG_SHEET_NAME);
  if (it.hasNext()) {
    ss = SpreadsheetApp.openById(it.next().getId());
  } else {
    ss = SpreadsheetApp.create(LOG_SHEET_NAME);
    DriveApp.getFileById(ss.getId()).moveTo(folder);
    ss.getSheets()[0].appendRow(["received_utc", "pid", "session", "filename", "bytes"]);
  }
  ss.getSheets()[0].appendRow([new Date().toISOString(), pid, session, filename, bytes]);
}
