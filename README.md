# ComplyScope Kenya

Compliance tracker for Kenyan businesses. It covers:

- **National obligations:** KRA, NSSF, SHIF, Housing Levy, NITA, ODPC, BRS and DOSH.
- **Sector licences:** TRA and the tourism levy, PPB, KMPDC, NCA, the KEBS standards levy, PCPB, NEMA and liquor.
- **County permits** for all 47 counties.

It also provides deadlines, reminders, documents, team access, billing and an audit-ready dossier.

Stack: Next.js 15 (standalone output), MySQL/MariaDB and Node 24. There are no native modules, so it runs on shared hosting (DirectAdmin "Setup Node.js App" / Passenger) or on a VPS.

## Run locally

```bash
cp .env.example .env.local   # set DATABASE_URL at minimum
npm install
npm run dev
```

Tables are created automatically on the first request, and schema upgrades run on start.

## Configuration

Core settings are environment variables (see `.env.example`). Never commit real values: this repository is public.

| Variable | Needed | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | `mysql://user:pass@host:3306/db` |
| `APP_URL` | yes | Public URL, e.g. `https://complyscope.pentarchsystemssolutions.co.ke` |
| `SUPERADMIN_EMAILS` | yes | Comma-separated emails that get the admin console |
| `CRON_SECRET` | no | Optional key (`/api/cron?key=…`) to force a reminder run more than once a day |
| `UPLOAD_DIR` | no | Defaults to `../complyscope_uploads` (outside the web root) |
| `CONFIG_KEY` | recommended | Key used to encrypt integration secrets. If unset it is derived from `DATABASE_URL`, so changing the database password means re-entering integration secrets |

### Integrations (admin console)

Email (SMTP), M-Pesa (Daraja STK push), SMS (Africa's Talking) and manual payment instructions are set up under **Admin → Integrations & billing**. Each one stays switched off until its details are entered and "Switched on" is ticked. Every integration has a test button. Secrets are stored encrypted (AES-256-GCM). The older `SMTP_*`, `MPESA_*` and `AT_*` environment variables still work as a fallback.

Until email is switched on:

- sign-ups are verified automatically;
- invite links are shown on screen;
- reminder emails wait in the outbox.

### Billing

- **Pilot mode (default):** everything is free.
- **Paid mode:**
  - new businesses get a free trial, and existing pilot businesses get at least 30 days;
  - owners are emailed when paid mode starts;
  - a business whose plan has ended becomes read-only until it renews (it can still pay and export).

Payments come in by M-Pesa STK push, which is confirmed with Daraja, or manually by transaction code. Manual payments need an admin to approve them under **Admin → Payments**.

### Backups

Two layers protect the data:

- **Admin download:** **Admin → Overview → Download data backup** downloads a JSON export of all business data. It leaves out sessions and one-time tokens; integration secrets stay encrypted.
- **Server backups:** keep the host's own database and file backups switched on. Uploaded documents live in `UPLOAD_DIR` and are not inside the JSON export.

## Deploying to DirectAdmin (shared hosting)

1. Create the subdomain and enable SSL.
2. Create a MySQL database and user.
3. Set up the app under **Setup Node.js App**:
   - Node 24;
   - application root, e.g. `complyscope_app`;
   - startup file `app.js`;
   - application URL = the subdomain.

   Add the environment variables above. Do not run "NPM install": the bundle ships its own `node_modules`.
4. Create an FTP account limited to the application root.
5. In GitHub, go to **Settings → Secrets and variables → Actions** and add `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` and `FTP_DIR` (e.g. `/`).
6. Push to `main`. The workflow then:
   - builds `.next/standalone` and uploads it over FTPS;
   - uploads `deployed.txt` last. `app.js` watches that file and restarts the app, so the new build is live within about 20 seconds.

   `/api/health` shows the running build (commit id).
7. Add a daily cron job (e.g. 07:05): `curl -fsSL "https://<your-domain>/api/cron" > /dev/null 2>&1`. Without a key it runs at most once every 20 hours, and reminders are de-duplicated.

## Rules engine and data

- **`lib/engine.js`:** the obligation catalogue. Each obligation records:
  - when it applies;
  - its due-date rule;
  - why it applies, what to do and the penalty;
  - an official source link.

  The same file runs in the browser (live workspace and landing demo) and on the server (reminders, exports, calendar feed and dossier).
- **`lib/counties.js`:** the permit name, portal, USSD code, validity rule, renewal deadline, notes and sources for every county. Anything that could not be confirmed is left out rather than guessed. The public guide is at `/counties`.

### Yearly maintenance checklist

Rates and dates change. Review these at least once a year and whenever a Finance Act or county Finance Act passes:

1. **Gazetted holidays:** add Idd-ul-Fitr, Eid-ul-Adha and any one-off holidays to `GAZETTED` in `lib/engine.js`. Future years are entered provisionally on the earlier likely date.
2. **Finance Act changes:**
   - PAYE, VAT, TOT, instalment tax and the filing deadlines. From the 2026 income year, individual returns are due 30 April under the Finance Act 2026.
   - Penalties and eTIMS rules.
   - Monthly Rental Income (MRI) rate and band; KRA's draft 2026 rental income regulations may change registration rules.
   - The KRA amnesty notice in `components/workspace/ws.js` switches itself off after 31 December 2026; remove it, or update it if the amnesty is extended.
3. **Payroll:** NSSF earnings limits (these change each February), SHIF, Housing Levy and NITA.
4. **Sector bodies:** TRA, KMPDC, PPB and EARB renewal notices; the KEBS levy cap; NTSA vehicle inspection rules.
5. **Counties:** new portals and revenue systems (the National Treasury is rolling out a standard county revenue system, ICRMS), renewal deadlines and bundled permits.

Mark the professional review as complete in the admin console once an accountant or lawyer has signed off.

## Tests

The scripts used during development are not part of the deployed bundle:

- an end-to-end browser run (signup → workspace → filings → exports);
- billing and integrations checks;
- a randomised engine check (100,000+ obligations: no invalid dates, no due dates on weekends or holidays, valid statuses);
- an axe-core WCAG 2.1 AA audit of every page at desktop and phone widths.

## Disclaimer

ComplyScope is a tracking tool, not legal or tax advice. Rates and deadlines are checked against official sources but can change. Confirm with the authority or a professional before filing.
