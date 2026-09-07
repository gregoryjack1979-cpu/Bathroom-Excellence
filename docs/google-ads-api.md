# Google Ads API access for Bathroom Excellence

This guide gets the Bathroom Excellence Google Ads account talking to the
scripts in `scripts/google-ads/`, which pull **lead data** (conversions, lead-form
submissions, tracked phone calls, Local Services Ads leads) and **service-area
data** (where campaigns are targeted, and which cities / ZIP codes the clicks
and leads actually come from).

Four things are needed, and only the first two involve Google's web consoles:

| # | What | Where | Ends up in |
|---|------|-------|------------|
| 1 | Developer token | Google Ads **manager** account → API Center | `GOOGLE_ADS_DEVELOPER_TOKEN` |
| 2 | OAuth client (ID + secret) | Google Cloud Console | `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET` |
| 3 | Refresh token | `npm run ads:auth` (runs locally, opens a browser) | `GOOGLE_ADS_REFRESH_TOKEN` |
| 4 | Account IDs | Google Ads UI (top-right corner) | `GOOGLE_ADS_LOGIN_CUSTOMER_ID`, `GOOGLE_ADS_CUSTOMER_ID` |

All of it lives in `.env.google-ads.local` (git-ignored; template in
`.env.google-ads.example`). Nothing here needs to be deployed with the website —
these are back-office scripts run from a laptop or a scheduled job.

> Versions: the scripts default to Google Ads API **v25** (released July 2026,
> scheduled to sunset August 2027). Override with `GOOGLE_ADS_API_VERSION` when
> Google ships v26. Google sunsets each version roughly a year after release.

---

## Step 1 — Apply for a developer token

A developer token identifies *the software* (these scripts) to Google. It is
issued to a **Google Ads manager account** (also called an MCC), never to a
regular advertiser account.

### 1a. Make sure there is a manager account

- If Bathroom Excellence's ads are already run from a manager account (an agency
  MCC or your own), use that one. The manager must have the Bathroom Excellence
  client account linked under it.
- If not, create one at <https://ads.google.com/home/tools/manager-accounts/>
  (free, a few minutes), then in the new manager account go to
  **Accounts → Sub-account settings → + → Link existing account** and enter the
  Bathroom Excellence customer ID. Someone with admin access on the Bathroom
  Excellence account accepts the invitation.
- The manager account must be a **production** account, not a test manager
  account. Tokens created from test managers can never be upgraded.

### 1b. Request the token

1. Sign in to the manager account and open the API Center:
   <https://ads.google.com/aw/apicenter> (menu path: **Admin → API Center**, or
   **Tools and settings → Setup → API Center** in the older layout).
2. Fill in the developer details form:
   - **API contact email** – a monitored inbox; Google sends access-level
     decisions and deprecation notices here.
   - **Company name / website** – Bathroom Excellence, `https://www.bathroomexcellence.com`.
   - **Company type** – *Advertiser* (you are pulling your own account's data,
     not building a product for other advertisers).
   - **Intended use** – be concrete and honest. Something like:
     > Internal reporting for our own Google Ads account. A scheduled script
     > reads conversion, lead-form-submission, call and geographic performance
     > reports (GoogleAdsService.Search) and writes CSV files for our CRM and
     > sales team. Read-only; no campaign management, no third-party access.
3. Accept the API Terms of Service and submit.

The token appears immediately in the API Center. Copy it into
`GOOGLE_ADS_DEVELOPER_TOKEN`. Its **access level** decides what it can reach:

| Access level | Production accounts? | Daily operations | How you get it |
|---|---|---|---|
| **Test Account** | No — test accounts only | 15,000 | Default for a brand-new token |
| **Explorer** | Yes (read/report/manage; no account creation, user management, planning or billing services) | 2,880 | Google may grant this automatically shortly after you sign up (introduced 2026 to shorten the queue) |
| **Basic** | Yes | 15,000 | Apply in the API Center (see 1c) |
| **Standard** | Yes | Unlimited | Apply once you exceed Basic's quota; requires a working, compliant tool |

For these scripts, **Explorer is enough** on a normal day (a full `all` run is
well under 100 operations), and Basic is comfortable. Check the current level
in the API Center; if it says *Test Account access* a day after signing up,
apply for Basic.

### 1c. Apply for Basic access (if not auto-upgraded)

In the API Center, open the drop-down next to the access level and click
**Apply for Basic Access**. The form asks for:

- **Contact and company details** (pre-filled).
- **Tool description / design document.** For a read-only, first-party
  reporting tool a page or two is plenty: purpose, which reports it runs, who
  sees the output, and that it never writes to the account. You can hand them
  this document and the `scripts/google-ads/` folder.
- **Screenshots or mock-ups** of the output – a screenshot of the terminal
  tables and a CSV opened in a spreadsheet is fine.
- **Users**: "internal – Bathroom Excellence staff only".

Google answers by email within a few business days (longer during backlogs).
Common rejection reasons: describing the tool too vaguely, applying from a
test manager account, or a manager account with no linked client accounts.

### 1d. Until the token is approved: use a test account

A token with *Test Account access* can only call **test accounts**, which are
sandbox Google Ads accounts with no real traffic. To try the scripts before
approval:

1. In a **test manager account** (create one at
   <https://ads.google.com/home/tools/manager-accounts/> while signed in
   with a Google account that has no other Ads accounts – it becomes a test
   manager when created from the API Center "Create a test manager" link),
   create a test client account.
2. Point `GOOGLE_ADS_LOGIN_CUSTOMER_ID` at the test manager,
   `GOOGLE_ADS_CUSTOMER_ID` at the test client, and keep the **production
   manager's developer token**. Test accounts contain no conversions, so the
   `leads` reports will be empty, but `accounts`, `campaigns` and
   `service-area` prove that auth works end to end.

---

## Step 2 — Create OAuth credentials in Google Cloud Console

OAuth identifies *the person* (a Google user with access to the Ads account).
Every API call carries both the developer token and that person's OAuth token.

### 2a. Project and API

1. Go to <https://console.cloud.google.com/> and sign in with the Google account
   that manages Bathroom Excellence's ads (or any Google account – the project
   only hosts the credentials).
2. **Create a project**: project selector (top bar) → **New project** → name
   `bathroom-excellence-ads` → **Create**. Select it.
3. Enable the API: **APIs & Services → Library** → search **Google Ads API** →
   **Enable**. (Direct link: <https://console.cloud.google.com/apis/library/googleads.googleapis.com>.)

### 2b. OAuth consent screen (branding + audience)

**APIs & Services → OAuth consent screen** (in newer consoles this is
**Google Auth Platform → Branding / Audience / Data access**):

1. **App name**: `Bathroom Excellence Ads Reports`. **User support email** and
   **developer contact email**: your address.
2. **Audience / User type**:
   - **Internal** if the Google account belongs to a Google Workspace
     organisation (only that organisation's users can sign in; no Google
     review ever needed). Preferred when available.
   - **External** otherwise. Then, on the **Audience** page, add the Google
     account(s) that will run `npm run ads:auth` as **Test users**.
3. **Scopes / Data access**: **Add or remove scopes** → paste
   `https://www.googleapis.com/auth/adwords` into *Manually add scopes* →
   **Add to table** → **Update** → **Save**. This is the only scope the
   scripts request.
4. **Publishing status** (External apps only): a project left in **Testing**
   issues refresh tokens that **expire after 7 days**, which means re-running
   `ads:auth` weekly. Once the flow works, click **Publish app**. For a
   first-party tool used only by your own accounts you do **not** need to
   submit for verification; Google shows an "unverified app" interstitial once
   during sign-in (click *Advanced → Go to … (unsafe)*), and refresh tokens
   then stop expiring.

### 2c. OAuth client ID

1. **APIs & Services → Credentials → + Create credentials → OAuth client ID**.
2. **Application type: Desktop app** (this matters: Desktop clients accept the
   `http://127.0.0.1:<port>` loopback redirect the auth script uses, so no
   redirect URI configuration is needed). Name it `ads-reports-cli`.
3. **Create**, then **Download JSON**. Save it *outside* the repo or as
   `client_secret*.json` in the repo root (that pattern is git-ignored).

Either copy `client_id` / `client_secret` from that file into
`GOOGLE_ADS_CLIENT_ID` / `GOOGLE_ADS_CLIENT_SECRET`, or pass the file to the
auth script with `--credentials` in the next step.

---

## Step 3 — Mint the refresh token

On a machine with a browser (your laptop; **not** a cloud shell or CI runner):

```bash
npm install                       # once
cp .env.google-ads.example .env.google-ads.local
npm run ads:auth -- --credentials ~/Downloads/client_secret_xxx.json --save
```

The script starts a listener on `127.0.0.1`, opens Google's consent page
(with PKCE), and once you approve it exchanges the code for tokens and writes
`GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET` and `GOOGLE_ADS_REFRESH_TOKEN`
into `.env.google-ads.local`. **Sign in with the Google user that has access
to the Bathroom Excellence Ads account** (or to the manager account above).

Without `--save` it prints the three lines for you to paste. Use `--no-browser`
to just print the URL (for example when the default browser is the wrong
profile) and open it by hand.

The refresh token is a long-lived credential for the Ads account: treat it
like a password. Revoke it any time at <https://myaccount.google.com/permissions>.

---

## Step 4 — Account IDs

Customer IDs are the `123-456-7890` numbers in the top-right of the Google Ads
UI. Fill in:

- `GOOGLE_ADS_LOGIN_CUSTOMER_ID` — the **manager** account that owns the
  developer token and has the Bathroom Excellence account linked. If the user
  who authorised in Step 3 accesses the Bathroom Excellence account directly
  (not through a manager), leave this empty.
- `GOOGLE_ADS_CUSTOMER_ID` — the **Bathroom Excellence** advertiser account.

Not sure which is which? Run the discovery command; it lists every account the
authorised user can reach and, for each manager, the clients underneath it:

```bash
npm run ads:pull -- accounts
```

---

## Step 5 — Pull the data

```bash
npm run ads:pull -- leads                      # last 30 days
npm run ads:pull -- service-area --days 90     # last 90 days
npm run ads:pull -- service-area --by postal_code
npm run ads:pull -- all --redact               # everything, PII masked in exports
```

Each run prints summary tables and writes CSV + JSON files to
`exports/google-ads/<customer-id>/<date>/` (git-ignored; change with `--out`,
pick `--format csv` or `json`).

### `leads` datasets

| File | What it contains | GAQL resource |
|---|---|---|
| `lead-conversions-by-action` | Conversion count and value per conversion action (website form, call, chat…) with its category, so lead-type actions (`SUBMIT_LEAD_FORM`, `PHONE_CALL_LEAD`, `REQUEST_QUOTE`, `BOOK_APPOINTMENT`, …) can be told apart from purchases or page views. | `conversion_action` |
| `lead-conversions-by-campaign` | The same conversions split by campaign. | `campaign` segmented by `conversion_action_name` |
| `lead-form-submissions` | Individual submissions from Google **lead form assets** (name, phone, email, ZIP, custom question answers), with campaign and GCLID. Google only keeps these for a limited window, so pull regularly. | `lead_form_submission_data` |
| `phone-calls` | Every tracked call from call assets / call ads: start and end time, duration, caller area code, status, campaign. | `call_view` |
| `local-services-leads` | Local Services Ads leads (message / call / booking), status, whether it was charged, consumer name and phone. Skipped automatically if the account does not run LSA. | `local_services_lead` |

The website's own estimate-request form posts to your CRM webhook
(`NEXT_PUBLIC_WEBHOOK_URL`, see the README) and is **not** part of this data:
Google only knows about it as a conversion once your CRM or the site fires a
conversion tag. The GCLID on each lead-form submission is what joins the two
worlds.

### `service-area` datasets

| File | What it contains | GAQL resource |
|---|---|---|
| `location-targets` | Every campaign's location targets and exclusions: cities/counties/ZIPs (resolved to names) and radius targets around an address, plus whether the campaign targets *presence* or *presence or interest*. | `campaign_criterion` (`LOCATION`, `PROXIMITY`) + `geo_target_constant` |
| `geo-performance-by-city` (or `-postal-code`) | Impressions, clicks, cost, conversions and calls per campaign per city (or ZIP), with the region and whether the searcher was physically there (`LOCATION_OF_PRESENCE`) or searching about the area (`AREA_OF_INTEREST`). | `geographic_view` |
| `service-area-summary-by-city` | Roll-up of the above across campaigns – a leaderboard of cities by leads, with cost per lead, and a flag for cities outside the service area listed in `config/site.ts`. | derived |

`campaigns` writes one `campaigns` dataset (status, channel, spend, leads, cost
per lead, calls) and is included in `all`.

### Scheduling

The pull is idempotent and writes to a dated folder, so it can run from cron,
a GitHub Actions schedule, or a Make.com / Zapier "run a command" step. Put the
five `GOOGLE_ADS_*` values in the runner's secret store; the scripts read them
from the environment, and `.env.google-ads.local` is only a convenience for
laptops.

---

## Troubleshooting

The scripts print Google's error code plus a hint. The usual ones:

| Error | Meaning / fix |
|---|---|
| `DEVELOPER_TOKEN_NOT_APPROVED` | Token still at *Test Account access* and you targeted a production account. Wait for Explorer/Basic, or use a test account (Step 1d). |
| `DEVELOPER_TOKEN_PROHIBITED` | The token belongs to a different manager than `GOOGLE_ADS_LOGIN_CUSTOMER_ID`. |
| `USER_PERMISSION_DENIED` | The authorised Google user cannot see that customer, or `GOOGLE_ADS_LOGIN_CUSTOMER_ID` is wrong / missing. Run `accounts`. |
| `CUSTOMER_NOT_FOUND` | Typo in a customer ID (dashes are fine, letters are not). |
| `OAuth token refresh failed … invalid_grant` | Refresh token revoked, or expired after 7 days because the OAuth app is in *Testing*. Publish the app (Step 2b) and re-run `ads:auth`. |
| `403 … Google Ads API has not been used in project …` | Enable the API in the Cloud project (Step 2a). |
| `redirect_uri_mismatch` during `ads:auth` | The OAuth client is a *Web application*. Create a *Desktop app* client. |
| `UNRECOGNIZED_FIELD` | A field was renamed in a newer API version; check `GOOGLE_ADS_API_VERSION`. |

Every failing call prints a `request-id`; include it if you contact Google Ads
API support (<https://groups.google.com/g/adwords-api>).

## Security notes

- `.env.google-ads.local`, `client_secret*.json` and `exports/` are
  git-ignored. Do not commit them; do not paste tokens into issues or chats.
- Lead exports contain personal data (names, phone numbers, emails). Store them
  where your CRM data lives, delete old export folders, and use `--redact` when
  sharing tables with people who do not need contact details.
- The scripts are read-only: they only ever call `googleAds:search` and
  `customers:listAccessibleCustomers`.
