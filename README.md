# ComplyScope Kenya

Compliance tracker for Kenyan businesses: national obligations (KRA, NSSF, SHIF, Housing Levy, NITA, ODPC, BRS, DOSH, NEMA) and county permits for all 47 counties, with deadlines, reminders, documents, team access and an audit-ready dossier.

Stack: Next.js 15 (standalone output) · MySQL/MariaDB · Node 24. No native modules, so it runs on shared hosting (DirectAdmin "Setup Node.js App" / Passenger) or a VPS.

## Run locally

```bash
cp .env.example .env.local   # set DATABASE_URL at minimum
npm install
npm run dev
```

Tables are created automatically on first request.

## Configuration

All settings are environment variables (see `.env.example`). Never commit real values; this repository is public.

| Variable | Needed | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | `mysql://user:pass@host:3306/db` |
| `APP_URL` | yes | Public URL, e.g. `https://complyscope.pentarchsystemssolutions.co.ke` |
| `CRON_SECRET` | no | Optional key to force a reminder run more than once a day |
| `SUPERADMIN_EMAILS` | yes | Comma-separated emails that get the admin console |
| `UPLOAD_DIR` | no | Defaults to `../complyscope_uploads` (outside the web root) |
| `SMTP_*`, `MAIL_FROM` | later | Email. Until set, sign-ups auto-verify and invite links are shown on screen |
| `MPESA_*` | later | Daraja STK push. Until set, billing shows "pending" |
| `AT_*` | later | Africa's Talking SMS. Until set, reminders go by email only |

## Deploying to DirectAdmin (shared hosting)

1. Create the subdomain and enable SSL.
2. Create a MySQL database and user.
3. **Setup Node.js App**: Node 24, application root e.g. `complyscope_app`, startup file `app.js`, application URL = the subdomain. Add the environment variables above. Do not run "NPM install"; the bundle ships its own `node_modules`.
4. Create an FTP account limited to the application root.
5. In GitHub → Settings → Secrets and variables → Actions add `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_DIR` (e.g. `/`).
6. Push to `main`. The workflow builds `.next/standalone` and uploads it; `tmp/restart.txt` changes on every build so Passenger restarts the app.
7. Cron job (daily, e.g. 06:00): `curl -fsS "https://<your-domain>/api/cron" > /dev/null`

## County data

`lib/counties.js` holds the permit name, portal, USSD, validity rule, notes and sources for each county. Fields that could not be confirmed are left empty rather than guessed. The public guide is at `/counties`.

## Disclaimer

ComplyScope is a tracking tool, not legal or tax advice. Rates and deadlines are checked against official sources but can change; confirm with the authority or a professional before filing.
