# Orvannis Backend Setup — Handoff Document

**Prepared:** June 27, 2026  
**For:** Website-building agent  
**Status:** Backend built and ready for deployment; website integration pending

---

## Quick Reference

The most critical facts for wiring the website contact form.

### Contact Form Endpoint

```
POST https://YOUR_BACKEND_URL/contact
Content-Type: application/json
```

**Request body (exact shape required):**
```json
{
  "name": "First Last",
  "email": "visitor@example.com",
  "company": "Optional Company Name",
  "message": "Their message text"
}
```
- `name` — required, string
- `email` — required, valid email format (server-side validated)
- `company` — optional, string (omit or pass `null`)
- `message` — required, string

**Success response (HTTP 200):**
```json
{
  "success": true,
  "message": "Thank you — your message has been received. You will hear from us within one business day."
}
```

**Error response (e.g. validation failure, HTTP 422):**
```json
{
  "detail": [...]
}
```

### CORS Origins (already configured in backend)
- `https://orvannis.com`
- `https://www.orvannis.com`
- `https://*.pplx.app` (any Perplexity preview URL)
- `http://localhost:*` (any port, for local development)

No CORS configuration needed on the website side — the backend handles it.

### Backend URLs (known after deployment)
| Platform | URL pattern |
|---|---|
| Railway.app | `https://orvannis-backend.up.railway.app` |
| Render.com | `https://orvannis-backend.onrender.com` |

Brian will confirm the exact deployed URL. The website fetch call must be updated to use it.

---

## 1. What Was Built

### 1.1 FastAPI Backend (`orvannis-backend/server.py`)

A production-ready Python FastAPI server (~699 lines). All routes are documented below.

#### Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Liveness probe |
| `POST` | `/contact` | None | Contact form handler |
| `GET` | `/admin/report` | Bearer token | Weekly health report |

**`GET /health`**  
Returns: `{"status": "ok", "service": "orvannis-backend"}`  
Use for uptime monitoring. No auth required.

**`POST /contact`**  
Accepts the JSON body described in Quick Reference. On success:
1. Saves submission to SQLite `submissions` table
2. Sends a branded HTML auto-reply to the submitter via Microsoft Graph
3. Sends an internal notification email to `brian@orvannis.com` AND `boc_173@yahoo.com`
4. Logs all send attempts (success or failure) to `email_log` table

If email delivery fails, the submission is still saved and a graceful response is returned. Email failure does not cause the endpoint to return an error to the user.

Returns: `{"success": true, "message": "..."}` on success.

**`GET /admin/report?days=7`**  
Protected by `Authorization: Bearer <ADMIN_TOKEN>` header.  
Cross-references the `submissions` table against the `email_log` table and returns a weekly health summary. If failures are present, includes HTTP status codes and suggested remediation actions:
- 401 → rotate the Azure client secret
- 403 → re-grant admin consent in Azure portal

### 1.2 Email Design

The auto-reply email uses the Orvannis brand palette:
- Header background: dark navy `#1e2a35`
- Accent color: copper `#B87333`
- Body background: warm off-white (Paper `#F5F2EC`)
- Font: Georgia serif
- Signed by: **Brian O'Connor, Founder**

This matches the brand palette defined in `orvannis-brand-sheet.md` (copper/stone system).

### 1.3 SQLite Database

Located at `/data/orvannis.db` (path set via `DB_PATH` env var).

**`submissions` table:**
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key, auto-increment |
| `name` | TEXT | Submitter name |
| `email` | TEXT | Submitter email |
| `company` | TEXT | Optional |
| `message` | TEXT | Full message body |
| `submitted_at` | DATETIME | UTC timestamp |

**`email_log` table:**
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key, auto-increment |
| `submission_id` | INTEGER | FK → submissions.id |
| `recipient` | TEXT | Email address sent to |
| `email_type` | TEXT | `auto_reply` or `notification` |
| `status` | TEXT | `sent` or `failed` |
| `http_status` | INTEGER | HTTP status from Graph API |
| `error_detail` | TEXT | Raw error body if failed |
| `attempted_at` | DATETIME | UTC timestamp |

### 1.4 Microsoft Graph Email (M365 Client Credentials Flow)

- **Auth method:** Azure AD app registration, client credentials (no user sign-in ever required)
- **Permission:** Application-level `Mail.Send`
- **Sends from:** `brian@orvannis.com`
- **Auth flow:** Backend requests a token from `https://login.microsoftonline.com/{AZURE_TENANT_ID}/oauth2/v2.0/token` using client ID + secret, then calls Microsoft Graph to send mail

### 1.5 Deployment Configs

| File | Purpose |
|---|---|
| `Dockerfile` | Container build config |
| `railway.toml` | Railway.app deployment config |
| `render.yaml` | Render.com deployment config (includes 1 GB persistent disk for SQLite) |
| `requirements.txt` | Python dependencies |
| `.env.example` | Template for all required env vars |
| `GRAPH_SETUP.md` | Step-by-step Azure App Registration guide |

### 1.6 Weekly Monitoring

A recurring task runs every **Monday at 7:00 AM EDT**. It:
1. Calls `GET /admin/report?days=7`
2. Cross-references submissions vs. email delivery records
3. Emails Brian a summary
4. If failures are found, includes raw error codes and remediation steps

This activates once the deployed backend URL is shared.

---

## 2. Environment Variables

All 7 variables are required. The backend will fail to start if any are missing.

| Variable | Description | How to get it |
|---|---|---|
| `AZURE_TENANT_ID` | Azure AD tenant ID | Azure App Registration → Overview |
| `AZURE_CLIENT_ID` | Azure AD application (client) ID | Azure App Registration → Overview |
| `AZURE_CLIENT_SECRET` | Client secret value | Azure App Registration → Certificates & secrets |
| `SENDER_EMAIL` | `brian@orvannis.com` | Hard-coded value, enter as-is |
| `NOTIFY_EMAILS` | `brian@orvannis.com,boc_173@yahoo.com` | Comma-separated, no spaces |
| `DB_PATH` | `/data/orvannis.db` | Set to this path on Railway/Render persistent disk |
| `ADMIN_TOKEN` | Random hex string | Generate: `python3 -c "import secrets; print(secrets.token_hex(32))"` |

---

## 3. Azure App Registration Setup Summary

Full instructions are in `orvannis-backend/GRAPH_SETUP.md`. Key steps (~10 minutes):

1. Go to **Azure Portal → Azure Active Directory → App registrations → New registration**
2. Set the app as **Single-tenant**
3. In **API permissions**, add `Mail.Send` as an **Application permission** (not delegated)
4. Click **Grant admin consent** (required — delegated flow will not work)
5. Go to **Certificates & secrets → New client secret**, set expiry to **24 months**
6. Copy the **Tenant ID**, **Client ID**, and **secret value** into deployment env vars

The secret expires in 24 months. The `/admin/report` response will surface a 401 error code when it needs rotation.

---

## 4. Python Dependencies (`requirements.txt`)

```
fastapi
uvicorn
httpx
pydantic[email]
python-dotenv
```

---

## 5. Website Contact Form Integration

### JavaScript Fetch Pattern

```javascript
async function submitContactForm({ name, email, company, message }) {
  try {
    const res = await fetch('https://YOUR_BACKEND_URL/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, company, message })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    if (data.success) {
      // Show success message to user
      showMessage("Thank you — your message has been received. You will hear from us within one business day.");
    } else {
      throw new Error('Unexpected response');
    }
  } catch (err) {
    // Show fallback message on any network or server error
    showMessage("Something went wrong — please email brian@orvannis.com directly.");
  }
}
```

### UX Guidance

| State | User-facing message |
|---|---|
| Success (`data.success === true`) | "Thank you — your message has been received. You will hear from us within one business day." |
| Any fetch error or non-200 response | "Something went wrong — please email brian@orvannis.com directly." |
| Form validation (client-side) | Standard required-field and email-format validation before submitting |

### Form Fields to Build

| Field | Input type | Required | Notes |
|---|---|---|---|
| Name | `text` | Yes | Maps to `name` in JSON |
| Email | `email` | Yes | Maps to `email` in JSON |
| Company | `text` | No | Maps to `company` in JSON; omit from body if empty or pass `null` |
| Message | `textarea` | Yes | Maps to `message` in JSON |

### Important: No Auth Required

The `/contact` endpoint is public — no API key, token, or auth header needed from the website. Just `Content-Type: application/json`.

### CORS Already Handled

The backend is pre-configured to accept requests from `orvannis.com`, `www.orvannis.com`, all `*.pplx.app` preview URLs, and localhost. The website does not need to configure anything for CORS.

---

## 6. Health Check Integration

```
GET https://YOUR_BACKEND_URL/health
```

Returns `{"status": "ok", "service": "orvannis-backend"}` with HTTP 200 when the server is running. Use this for:
- Uptime monitoring services (UptimeRobot, Better Uptime, etc.)
- Website status page
- Pre-flight check before enabling the contact form

---

## 7. Brand Context (Relevant to Website)

Pulled from `orvannis-brand-sheet.md` in the Orvannis Space.

### Color Palette

| Name | Hex | Use |
|---|---|---|
| Copper | `#B87333` | Primary accent, links, highlights, O loop |
| Polished copper | `#CD8B52` | Gradient top, hover states |
| Antique copper | `#9C5A2C` | Gradient base, pressed states |
| Basalt | `#33302B` | Primary text, wordmark |
| Warm stone | `#8A8178` | Secondary text, lines, icons |
| Limestone | `#E7E1D8` | Surfaces, cards, dividers |
| Paper | `#F5F2EC` | Backgrounds |

Avoid pure `#000000` and `#FFFFFF` — use Basalt and Paper for the warmer, crafted feel.

### Typography

- **Wordmark/headlines:** Refined geometric sans — Inter, Geist, or premium: Söhne, Neue Haas Grotesk, GT America
- **Body/UI:** Clean neutral sans — Inter, Söhne, or system UI
- **Rule:** Maximum two typefaces across the entire brand

### Voice

Grounded, intelligent, plain-spoken, confident. Never hype. Short sentences, active voice, benefit-led.

### Email Sender Identity

Auto-replies are signed by: **Brian O'Connor, Founder**  
Sent from: `brian@orvannis.com`

---

## 8. File Reference

All backend files live in the `orvannis-backend/` directory:

| File | Description |
|---|---|
| `server.py` | Main FastAPI application (~699 lines) |
| `requirements.txt` | Python dependencies |
| `Dockerfile` | Container build config |
| `railway.toml` | Railway.app deployment config |
| `render.yaml` | Render.com deployment config (includes persistent disk) |
| `.env.example` | Template showing all 7 required env vars |
| `GRAPH_SETUP.md` | Azure App Registration step-by-step guide |

---

## 9. Outstanding Items

These must be completed before the contact form can go live.

| # | Task | Owner | Notes |
|---|---|---|---|
| 1 | **Complete Azure App Registration** | Brian | Follow `GRAPH_SETUP.md` (~10 min). Get tenant ID, client ID, client secret. |
| 2 | **Generate ADMIN_TOKEN** | Brian | Run: `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| 3 | **Deploy backend to Railway or Render** | Brian | Push `orvannis-backend/` directory, add all 7 env vars in the platform dashboard. |
| 4 | **Share deployed backend URL** | Brian → website agent | Needed to activate the weekly monitor and to wire the website contact form. |
| 5 | **Wire website contact form** | Website agent | Update the fetch URL to the deployed backend URL once Brian shares it. |

---

## 10. Deployment Checklist (for Brian)

```
[ ] Register Azure app, grant Mail.Send Application permission, grant admin consent
[ ] Create client secret (24-month expiry), copy value immediately
[ ] Generate ADMIN_TOKEN
[ ] Push orvannis-backend/ to Railway or Render
[ ] Set all 7 env vars in deployment dashboard:
    AZURE_TENANT_ID
    AZURE_CLIENT_ID
    AZURE_CLIENT_SECRET
    SENDER_EMAIL=brian@orvannis.com
    NOTIFY_EMAILS=brian@orvannis.com,boc_173@yahoo.com
    DB_PATH=/data/orvannis.db
    ADMIN_TOKEN=<generated>
[ ] Hit GET /health and confirm {"status":"ok"}
[ ] Submit a test contact form and verify:
    - Auto-reply arrives at test email
    - Notification arrives at brian@orvannis.com and boc_173@yahoo.com
[ ] Share deployed URL with website agent to wire the contact form
```

---

*Document generated from the Orvannis backend setup session. Backend code is in `orvannis-backend/` directory. Brand assets are in the Orvannis Space files.*
