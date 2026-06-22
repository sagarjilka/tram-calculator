# TRAM Calculator — Development Context

## Project Overview
A web app version of **TRAM** (Transition Readiness and Appropriateness Measure), a clinical mental health assessment tool used by the **MILESTONE project, University of Warwick**, to assess young people transitioning from child to adult mental health services (CAMHS → AMHS).

The original tool was a manually-completed Excel workbook (`TRAM Feedback Report V5 (English).xlsm`) where a clinician filled in data from three respondents and got back a 3-page PDF report (plots, score tables, guidance). This project rebuilds that exact workflow as a web app so a clinician can send links instead of emailing spreadsheets around.

**Owner:** Sagar Jilka (sagarjilka@gmail.com), academic researcher, University of Warwick / MILESTONE project.
**No long-term maintenance plan assumed** — built to demonstrate the concept; Sagar is currently the sole developer (via Claude Code).
**Scope decisions:** English only. No NHS-grade security required. No login/password system — identity is via emailed, tokenised URLs only.

**Live URL:** https://tram.sagarjilka.com
**GitHub:** https://github.com/sagarjilka/tram-calculator (public repo, main branch only)

---

## The clinical instrument — how scoring actually works

This is the most important section if you need to verify or extend the app. All scoring logic was reverse-engineered from the original Excel (`TRAM Feedback Report V5 (English).xlsm`, sheets: `DATA`, `PlotSheet`, `ClinicianGuidance`, `ScoreSheet`) and confirmed to match exactly (see audit below for the one caveat found).

### Three respondents
- **Clinician (CL)** — completes all 8 domains, including the clinician-only Domain 6.
- **Young Person (YP)** — completes domains 1–5, 7, 8 (no Domain 6).
- **Parent/Carer (P/C)** — completes domains 1–5, 7, 8 (no Domain 6).

Domain 8 (Other Life Changes) is YP + Parent/Carer **only** — the clinician does not complete it.

### The 8 domains, their scales, and their formulas

**1. Symptoms** (11 items: Depression, Mania, Anxiety, Post-traumatic stress, Psychosis, Borderline personality, Antisocial behaviour, Attention deficit, Social communication difficulties, Eating difficulties, Other mental health conditions)
- Type: `freq_sev` — two sub-questions per item.
- **Frequency**: 0–5 (0 = Not experienced, 1 = Rarely, 2 = Sometimes, 3 = Often, 4 = Most of the time, 5 = All of the time)
- **Severity**: 1–5 (1 = Very mild, 2 = Mild, 3 = Moderate, 4 = Severe, 5 = Very severe) — only asked if frequency > 0
- **Combined score** = `frequency + severity` (max 10). **If frequency = 0, score = 0** (severity is not asked/counted).
- Highlight threshold: score **≥ 5** ("moderate or above" — roughly freq≥2 AND sev≥3).

**2. Overall Illness** (1 item)
- Type: `scale_0_5`, single rating, no freq/sev split.
- 0 = Recovered, no treatment needed · 1 = Recovered, as long as on treatment · 2 = Mildly ill · 3 = Moderately ill · 4 = Severely ill · 5 = Very severely ill.
- Score = raw value.
- Highlight threshold: score **≥ 3** (Moderately ill or above).

**3. Overall Disruption** (10 items: Self care, Sleep, Household chores, Community, Social, Responsibility, Relationships with family, Relationships with friends/partner, Relationships with peers/colleagues, Education/work performance)
- Type: `scale_0_4`, single rating per item.
- 0 = No disruption · 1 = Some · 2 = Moderate · 3 = Significant · 4 = Total disruption.
- Score = raw value.
- Highlight threshold: score **≥ 2** (Moderate disruption or above).
- **Aggregate summary**: "Total areas affected" = count of items scoring ≥ 1, computed separately per respondent (this is the Excel's `COUNTIFS(range,"1")+COUNTIFS(range,"2")+COUNTIFS(range,"3")+COUNTIFS(range,"4")`).

**4. Risk** (6 items: Stress, Risk taking behaviour, Self-harming behaviours (no suicidal intent), Suicidal thoughts/behaviours, Risk to others, Risk from others)
- Type: `freq_sev`, identical mechanics to Domain 1 (freq 0–5, sev 1–5, combined max 10, 0 if freq=0).
- Highlight threshold: score **≥ 5**.

**5. Factors Affecting Symptoms** (8 items: Service use in times of crisis, Frequency of crisis service use, Inpatient hospital stays, Relapse, Ongoing treatment, Drug and alcohol misuse, Medical comorbidity, Side effects)
- 7 items are `binary` (0 = Not present, 1 = Present).
- 1 item ("Frequency of crisis service use") is `crisis_freq`, a count 0–4 (not binary — excluded from the "factors present" tally below, matching the Excel).
- Highlight threshold: score **≥ 1** (present = highlight).
- **Aggregate summary**: "Total factors present" = count of the 7 binary items equal to 1, per respondent (Excel: `COUNTIFS(range,"1")`).

**6. Health System Factors** (5 items, **clinician only**: Negative financial implications of transition, Poor CAMHS-AMHS links, Lack of appropriate local available services, Poor extent of alternative services available, GP not familiar with treating young person's condition)
- Type: `scale_0_4`.
- 0 = No problem · 1 = Very mild problem · 2 = Mild problem · 3 = Moderate problem · 4 = Significant problem.
- Score = raw value.
- Highlight threshold: score **≥ 3**.
- ⚠️ **Known Excel quirk, NOT replicated in the web app (intentionally):** the original Excel's `PlotSheet` formulas for this domain add `+2` to the raw `DATA` sheet value (e.g. `=DATA!D29+2`). This was traced to a legacy artifact of how the original HealthTracker data-entry form stored these particular values internally — it is **not** part of the TRAM scoring definition (the 0–4 scale and its labels are unambiguous and match what's used everywhere else in the instrument). The web app correctly stores and displays the raw 0–4 value with no offset. If anyone ever cross-checks against the live Excel file and sees numbers that look "off by 2" for this domain only, that's the explanation — the web app is correct, the Excel display had a data-entry-tool-specific offset baked into its chart formula.

**7. Barriers to Functioning** (9 items: Inability to act independently, Poor condition understanding, Poor service access knowledge, Poor motivation, Poor medication adherence, Poor social support, Not wanting carers involved, Difficulty forming team relations, Difficulty repeating history)
- Type: `scale_0_3`.
- 0 = No barrier · 1 = Minor barrier · 2 = Moderate barrier · 3 = Severe barrier.
- Score = raw value.
- Highlight threshold: score **≥ 2** (Moderate or above).
- **Aggregate summary**: "Moderate or severe barriers" = count of items scoring ≥ 2, per respondent (Excel: `COUNTIFS(range,"2")+COUNTIFS(range,"3")`).

**8. Other Life Changes** (8 items, **YP + Parent/Carer only, no clinician**: Family relationships, Relationships with friends and partner, Moving house, School/college/work, Illness/death, Police involvement, Pregnancy, Other)
- Type: `life_change`, three-point scale: **−1** = Positive change, **0** = No change/no impact, **+1** = Negative change.
- Highlight rule: highlighted if value === **+1** (negative change) for either YP or Parent/Carer.
- **Aggregate summary**: "Positive (−1) / Negative (+1) changes" = count of each, per respondent (Excel: `COUNTIF(range,"-1")` and `COUNTIF(range,"1")`).

### Where this logic lives in code
- **`lib/questions.ts`** — full question bank: every item's id, label, type, which respondents answer it, and which domain it belongs to. Also defines all the response-option label sets (`FREQ_OPTIONS`, `SEV_OPTIONS`, `ILLNESS_OPTIONS`, `DISRUPTION_OPTIONS`, `BARRIER_OPTIONS`, `HEALTH_SYSTEM_OPTIONS`, `LIFE_CHANGE_OPTIONS`, `BINARY_OPTIONS`, `CRISIS_FREQ_OPTIONS`).
- **`lib/scoring.ts`** — `getFreqSevScore()` (freq+sev combine logic), `getScore()` (raw passthrough), `isHighlighted(domainId, score)` (the per-domain threshold table above), and the four `build*Chart()` functions that prepare Recharts data for Plots 1–4.
- **`app/report/[id]/page.tsx`** — the report page. Contains `buildFreqSevRows()`, `buildSimpleRows()`, `buildClinicianOnlyRows()`, `buildLifeChangeRows()` (score table row builders) plus the aggregate-count helpers `countAreasAffected()`, `countModerateOrAbove()`, `countFactorsPresent()`, `countLifeChanges()` that reproduce the Excel's `COUNTIFS`/`COUNTIF` summary rows.

### Chart display rules (matches Excel `ClinicianGuidance` sheet exactly)
- Charts are horizontal grouped bar charts (Clinician / Young Person / Parent-Carer as three bars per item).
- Colours: CL = `#1e3a5f` (dark navy), YP = `#2e86ab` (blue), P/C = `#a23b72` (purple).
- Items scoring 0 across all three respondents are filtered out of the chart (not shown).
- Item order is **reversed** before rendering — this is deliberate: Recharts' vertical bar layout puts the first array item at the top, and the Excel source displays "Other mental health" at top / "Depression" at bottom for Symptoms (and equivalent reversed orderings for Risk, Disruption, Barriers). Reversing the natural top-down question order reproduces this.
- Axis maxes: Symptoms/Risk = 10, Disruption = 4, Barriers = 3.

---

## Three-respondent flow architecture

```
1. Clinician → tram.sagarjilka.com → enters email → POST /api/assessments
     → Supabase INSERT into `assessments` (generates assessment id + 3 UUID tokens:
       yp_token, parent_token, report_token)
     → Resend sends clinician an email with 3 links:
         /assess/[id]/clinician          (no token needed, they're already "in")
         /assess/[id]/yp?token=...
         /assess/[id]/parent?token=...

2. Clinician fills in their own form first (Domain 6 only they can see).
     → POST /api/responses { assessment_id, respondent_type: 'clinician', data }
     → Supabase UPSERT into `responses`, sets assessments.clinician_submitted = true

3. Clinician forwards the YP and Parent/Carer links (manually, by whatever
   channel they use — text, email, in person). Each respondent opens their
   link in their own browser/session, fills in their version, submits.
     → Same POST /api/responses flow, token validated against the DB row
       before the response is accepted.
     → After each submission, the API checks if all 3 are now submitted.
       If yes: Resend sends the clinician a "Report Ready" email containing
       /report/[id]?token=report_token

4. Clinician opens the report link.
     → GET /api/report?id=...&token=... validates report_token, returns 202
       (not ready) until all three submitted flags are true, then returns the
       full JSON: { clinician_email, created_at, responses: { clinician, yp, parent } }
     → All scoring/chart-building/highlighting happens CLIENT-SIDE in the
       browser from this point — no server-side computation. See "scoring" above.

5. Clinician clicks "Download / Print PDF" → window.print() → browser's
   native print-to-PDF, with a print stylesheet that hides the nav bar.
```

**No login system anywhere.** Identity = possession of the URL + matching token, validated server-side against the Supabase row. This was a deliberate scope decision (see Project History) — acceptable because this is a demo/non-NHS-grade build, not because it's recommended practice for a production clinical tool.

---

## Tech stack & what each service does

| Service | Role | Notes |
|---|---|---|
| **Next.js 16** (App Router, TypeScript) | The whole app — pages, API routes | `app/` directory structure |
| **Tailwind CSS** | All styling | utility classes inline, no separate stylesheet beyond `globals.css` |
| **Supabase** (Postgres) | Database — stores assessments + responses | Same Supabase account as the user's other project (SmartPaper); usage is additive/shared free-tier quota, doesn't "clash" with SmartPaper's tables since it's a separate project |
| **Resend** | Transactional email (clinician link-share email, report-ready email) | Uses `tram@sagarjilka.com` as sender. Domain `sagarjilka.com` was already verified in Resend from the SmartPaper project — no new DNS records were needed |
| **Recharts** | The 4 horizontal bar chart plots | Pure client-side render from the report's JSON data |
| **Vercel** | Hosting + auto-deploy from GitHub | Every push to `main` auto-deploys. Custom domain `tram.sagarjilka.com` configured via CNAME |
| **GitHub** (`sagarjilka/tram-calculator`) | Source control | Public repo, same GitHub account as the user's other projects |
| **WordPress.com (Automattic)** | DNS registrar for `sagarjilka.com` | Confirmed via `whois`/`dig NS` lookup — added the CNAME for the `tram` subdomain pointing at Vercel |
| `window.print()` | PDF export | No PDF library used — deliberately simple; browser print-to-PDF preserves chart quality and avoids jsPDF complexity |

### Environment variables (`.env.local`, gitignored, never committed)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
NEXT_PUBLIC_BASE_URL=https://tram.sagarjilka.com
```
The same four vars must be set in **Vercel → Project Settings → Environment Variables** (Production + Preview) for the live site to work. `RESEND_API_KEY` was initially a placeholder during setup — confirm a real key is in Vercel, not just local.

---

## Database schema (`lib/schema.sql`)

```sql
assessments
  id                  uuid (PK, default gen_random_uuid())
  clinician_email     text
  yp_token            uuid (default gen_random_uuid())
  parent_token        uuid (default gen_random_uuid())
  report_token        uuid (default gen_random_uuid())
  clinician_submitted boolean default false
  yp_submitted        boolean default false
  parent_submitted    boolean default false
  created_at          timestamptz default now()

responses
  id              uuid (PK)
  assessment_id   uuid (FK -> assessments.id)
  respondent_type text (check: 'clinician' | 'yp' | 'parent')
  data            jsonb   -- { question_id: numeric_value, ... }
  submitted_at    timestamptz default now()
  UNIQUE (assessment_id, respondent_type)
```
RLS is enabled on both tables with permissive "allow all" policies — there is no Supabase Auth user session involved; all access control is done in the Next.js API routes by checking tokens against the row, not via RLS predicates. This was an accepted tradeoff for the no-login, no-NHS-grade-security scope.

---

## File map

```
app/
  page.tsx                          Home page — clinician enters email, starts assessment
  layout.tsx                        Root layout, page metadata/title
  api/assessments/route.ts          POST: create assessment, email clinician their 3 links
  api/responses/route.ts            POST: validate token, upsert response, check all-3-done, email report link
  api/report/route.ts               GET: validate report_token, return full assessment + all 3 responses as JSON
  assess/[id]/clinician/page.tsx    Clinician questionnaire (no token check — they create the assessment)
  assess/[id]/yp/page.tsx           YP questionnaire (?token=... required)
  assess/[id]/parent/page.tsx       Parent/Carer questionnaire (?token=... required)
  report/[id]/page.tsx              The report: charts, score tables, guidance, print/PDF button

components/
  QuestionnaireForm.tsx             Shared form, used by all 3 respondent pages, filters questions
                                    by respondent via getQuestionsForRespondent()

lib/
  questions.ts                      All 8 domains' question definitions + response option labels
  scoring.ts                        getFreqSevScore, getScore, isHighlighted, buildXChart functions
  supabase.ts                       Supabase client init
  schema.sql                        DB schema (run manually in Supabase SQL editor — not auto-migrated)
```

---

## Project history / decisions made (so you don't re-ask these)

1. **Why no login system** — user explicitly chose "simpler option of no account, just email-based identity" over building real auth. Tokenised URLs are the access control.
2. **Why Resend needed no new DNS work** — `sagarjilka.com` was already verified in Resend from the user's other project (SmartPaper); confirmed via screenshot, just reused the same verified domain with a new sender address (`tram@sagarjilka.com`).
3. **Why Supabase/GitHub are shared with the SmartPaper project** — user decided reusing the same accounts is fine; it's a separate Supabase *project* (different DB), so usage/quota is additive but doesn't entangle the two apps' data.
4. **Why `window.print()` instead of a PDF library** — avoids jsPDF/Puppeteer complexity, decent quality output, good enough for a demo-stage tool.
5. **Security note acted on:** the user pasted live Supabase keys into chat during setup. They were flagged that the keys should be rotated since the chat may be logged. **If picking this project back up, check whether those original keys were ever rotated — if not, consider rotating them now** (Supabase → Settings → API).
6. **The Excel audit (cross-check against the source spreadsheet)** was done item-by-item by reading the `.xlsm`'s raw XML (DATA/PlotSheet/ClinicianGuidance sheets) to extract every cell formula and confirm the web app's logic matches exactly. Result: full match on all 8 domains, all highlight thresholds, all chart orderings — except the Health System Factors `+2` Excel quirk noted above, which was deliberately *not* replicated (it's a legacy data-entry artifact, not part of the TRAM definition).
7. **Aggregate summary counts were added after the audit** — the Excel's score sheet showed per-respondent totals (areas affected, factors present, barriers ≥ moderate, life changes ±) that the first web app build omitted. These were added as blue summary rows at the top of the relevant score table sections (Domains 3, 5, 7, 8) to match the Excel exactly.
8. **Em dashes (—) were replaced with regular hyphens (-)** throughout all UI text (home page, clinician success screen, questionnaire form instructions, full report) per explicit user preference — purely a typographic/stylistic choice, not a logic change.

---

## How to verify / test the live site

1. Visit https://tram.sagarjilka.com — should load the TRAM home page (confirmed via `curl` returning HTTP 200 + correct page title).
2. Enter any email (e.g. your own) → starts a new assessment → fills the clinician form.
3. Check the inbox for the `tram@sagarjilka.com` email containing the YP and Parent/Carer links.
4. Open each link (can be the same browser, doesn't matter — they're independent token-based sessions) and complete each questionnaire.
5. Once all 3 submitted, a second email arrives with the report link — open it to see the charts, score tables (with the blue aggregate-count summary rows and yellow highlighted moderate-or-above rows), and guidance text.
6. Use the "Download / Print PDF" button to confirm the print stylesheet hides the nav bar and the charts render cleanly in the PDF.

---

## Build / deploy

- **No CI pipeline** — Vercel auto-builds and deploys on every push to `main` (typically live within ~60 seconds).
- Local build check before pushing: `cd tram-calculator && node_modules/.bin/next build` (use the absolute path to the local binary — running `npx next build` or `npx tsc` from this shell tends to have its cwd reset to a different project directory; the local `node_modules/.bin/` binaries avoid that issue).
- **DB schema changes**: `lib/schema.sql` is NOT auto-applied — any change to it must be run manually in the Supabase SQL editor.
- **Never commit `.env.local`** — already gitignored via the `.env*` rule. Update Vercel's environment variables directly via its dashboard, not via a committed file.

## Contacts
- **Owner:** Sagar Jilka (sagarjilka@gmail.com)
- **GitHub:** sagarjilka/tram-calculator
- **Live:** tram.sagarjilka.com
