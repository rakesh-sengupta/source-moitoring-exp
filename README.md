# Source-monitoring experiment (cue availability at encoding)

jsPsych 7.3 experiment, the follow-up to Manvi Yadav's pilot on source memory for AI-generated text.
Participants read sentences in three blocks (marked / unmarked-informed / co-produced), then answer
recognition, source, confidence and belief questions; a second session retests after 48 h.

```
index.html                     the experiment
stimuli.js                     sentence sets A/B/C, foils, content questions (PLACEHOLDERS: replace)
gdrive/Code.gs                 Google Apps Script that saves each CSV into a Drive folder
analysis/analyze_source_monitoring.py   analysis of the downloaded CSVs
.github/workflows/pages.yml    publishes the site to GitHub Pages
.nojekyll                      tells Pages not to run Jekyll
```

## Links for participants

```
https://<owner>.github.io/<repo>/?pid=001              session 1
https://<owner>.github.io/<repo>/?pid=001&session=2    48-h follow-up (shown at the end of session 1)
```

Use numeric, sequential PIDs (001, 002, ...). PIDs 001-018 cover all 18 combinations of block
order (6) x sentence-set rotation (3), so N = 54 or 72 balances exactly. To set them by hand
instead, add `&order=0..5&rot=0..2`.

## Setting up GitHub Pages (once)

1. The repository must be **public** (Pages on a private repo needs a paid plan).
2. **Settings -> Pages -> Build and deployment -> Source: "GitHub Actions"**.
   (Not "Deploy from a branch".)
3. **Settings -> Actions -> General**: "Allow all actions and reusable workflows" is selected.
4. Push to `main`, or go to **Actions -> "Deploy experiment to GitHub Pages" -> Run workflow**.
   When the run is green, the site URL appears in the run summary and under Settings -> Pages.

### If the deployment still does not run

| Symptom | Cause / fix |
|---|---|
| No workflow appears in the Actions tab | The `.github` folder was not uploaded. Drag-and-drop in the GitHub web page skips hidden folders (names starting with a dot). Either push with git / GitHub Desktop, or in GitHub click **Add file -> Create new file**, type the name `.github/workflows/pages.yml` and paste the file's contents. Do the same for `.nojekyll` (an empty file). |
| Workflow exists but never starts | The default branch is not called `main` (check the branch dropdown). Rename it to `main`, or change `branches: [main]` in `pages.yml`. Also check that Actions are enabled (step 3). |
| Run fails at "deploy" with "Branch not allowed to deploy" | **Settings -> Environments -> github-pages -> Deployment branches**: allow `main`. |
| Run fails at "configure-pages" / "Get Pages site failed" | Pages is not enabled or the Source is not "GitHub Actions" (step 2). |
| Site loads but is blank | Open the browser console (F12). Usually `stimuli.js` is missing or has a syntax error (a missing comma after editing stimuli is the commonest). |
| Old version still showing | Hard-reload (Ctrl+Shift+R); Pages can take 1-2 minutes after a green run. |

## Saving data to Google Drive (once)

1. Make a Drive folder for the data. Its ID is the part of the URL after `/folders/`.
2. https://script.google.com -> New project -> paste `gdrive/Code.gs`. Put the folder **ID**
   (not the whole URL) in `FOLDER_ID`. Save.
3. Deploy -> New deployment -> Web app. Execute as: **Me**. Who has access: **Anyone**. Authorise.
4. Copy the URL ending in `/exec` into `GDRIVE_URL` near the top of `index.html`.
5. Open that `/exec` URL in a browser. It should show `"ok":true` and your folder's name.
   If it shows an error, fix the folder ID or re-authorise.
6. Test: open the experiment with `?pid=TEST`, click through, and check that `TEST_s1.csv`
   appears in the folder.

After any edit to `Code.gs`: Deploy -> Manage deployments -> edit -> Version: **New version**,
or the old code keeps running. If Drive saving fails, the participant's browser downloads the
CSV instead and asks them to send it to the experimenter. **Do not rename those files.**

## Before collecting real data

- Replace the placeholder sentences in `stimuli.js`: 3 sets x 20 (10 human from real sources,
  10 AI), 10 + 10 foils, 15-20 content questions. Keep the field names.
- Screening: keep an AI sentence only if >= 4 of 5 raters call it human; drop a human sentence if
  >= 2 of 5 raters call it AI.
- Replace `[INSERT IRB-APPROVED CONSENT TEXT BEFORE RUNNING.]` in `index.html`.

## Analysis

Put all the CSVs in one folder and run:

```
python analysis/analyze_source_monitoring.py <data_folder>
```

It prints data-quality checks, item and source memory by condition, source-memory SDT,
confidence-accuracy, belief by attributed source and item-level screening tables, and writes
`tidy_test_items.csv`. Needs pandas, numpy, scipy.
