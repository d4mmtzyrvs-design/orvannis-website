# Microsoft Graph Setup — Microsoft 365 Business Account
## Send from brian@orvannis.com via Outlook (app-only, no sign-in required)

This uses the **client credentials** flow — the most production-grade option.
Your app authenticates with a secret, fetches a token, and sends email entirely
server-side. No browser sign-in, no refresh tokens, no expiry surprises.

Total time: ~10 minutes, done once.

---

## Step 1 — Sign in to Azure Portal

1. Go to **[portal.azure.com](https://portal.azure.com)**
2. Sign in with the Microsoft 365 account linked to **brian@orvannis.com**

---

## Step 2 — Register the App

1. In the top search bar, type **"App registrations"** and click it
2. Click **"+ New registration"**
3. Fill in:
   - **Name:** `Orvannis Contact Form`
   - **Supported account types:** _Accounts in this organizational directory only (Single tenant)_
   - **Redirect URI:** leave blank
4. Click **Register**

---

## Step 3 — Copy the two IDs you need

On the app Overview page, copy both values — you'll need them for your environment variables:

| Value | Where |
|---|---|
| **Application (client) ID** | Overview → "Application (client) ID" |
| **Directory (tenant) ID** | Overview → "Directory (tenant) ID" |

---

## Step 4 — Create a Client Secret

1. Left sidebar → **Certificates & secrets**
2. Click **+ New client secret**
3. Description: `orvannis-backend`
4. Expires: **24 months** (set a calendar reminder to rotate it at month 22)
5. Click **Add**
6. **Copy the "Value" column immediately** — it is only shown once and cannot be retrieved again

---

## Step 5 — Grant Mail.Send permission

1. Left sidebar → **API permissions**
2. Click **+ Add a permission → Microsoft Graph → Application permissions**
   (Application, not Delegated — this is the key distinction for app-only flow)
3. Search **Mail.Send**, check the box, click **Add permissions**
4. Click **"Grant admin consent for [your org]"** and confirm

> As the Microsoft 365 account owner/admin you can grant this yourself.
> The button turns green with a checkmark when it's done.

---

## Step 6 — Set environment variables in your deployment

Add these five variables to Railway or Render:

| Variable | Value |
|---|---|
| `AZURE_TENANT_ID` | Directory (tenant) ID from Step 3 |
| `AZURE_CLIENT_ID` | Application (client) ID from Step 3 |
| `AZURE_CLIENT_SECRET` | Secret value from Step 4 |
| `SENDER_EMAIL` | `brian@orvannis.com` |
| `NOTIFY_EMAILS` | `brian@orvannis.com,boc_173@yahoo.com` |
| `DB_PATH` | `/data/orvannis.db` |

**On Railway:** Project → Variables → add each key/value pair  
**On Render:** Service → Environment → add each key/value pair

Redeploy after adding variables — the server picks them up at startup.

---

## How it works at runtime

Every time someone submits the contact form:
1. The server calls Azure with your client ID + secret → gets a short-lived access token
2. Uses that token to call `graph.microsoft.com/v1.0/users/brian@orvannis.com/sendMail`
3. Sends the branded auto-reply to the submitter
4. Sends the internal notification to both your inboxes
5. The token is discarded — a fresh one is fetched next time

No tokens are stored anywhere. No rotation needed beyond the annual client secret renewal.

---

## Maintenance reminder

Set a calendar event for **June 2028** (22 months from now) to rotate the client secret:
1. Azure Portal → App registrations → Orvannis Contact Form → Certificates & secrets
2. Add a new secret, copy the value, update `AZURE_CLIENT_SECRET` in your deployment
3. Delete the old secret

---

## Troubleshooting

| Error | Likely cause |
|---|---|
| `401 Unauthorized` | Wrong client ID or secret, or secret expired |
| `403 Forbidden` | Mail.Send permission not granted, or admin consent not clicked |
| `400 Bad Request` | Tenant ID is wrong |
| Email not arriving | Check spam; also verify `SENDER_EMAIL` exactly matches the M365 account |
| `InvalidAuthenticationToken` | Using wrong tenant endpoint — must be the single-tenant URL |
