"""
Orvannis Backend — FastAPI Contact Form Handler
Receives form submissions, stores to SQLite, sends branded auto-reply
and internal notification via Resend (brian@orvannis.com).

Includes /admin/report endpoint for weekly automated monitoring.
"""

import os
import secrets
import sqlite3
import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orvannis")

# ---------------------------------------------------------------------------
# Config — pulled from environment variables
# ---------------------------------------------------------------------------
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL   = os.environ.get("SENDER_EMAIL", "brian@orvannis.com")
NOTIFY_EMAILS  = os.environ.get("NOTIFY_EMAILS", "brian@orvannis.com,boc_173@yahoo.com").split(",")
DB_PATH        = os.environ.get("DB_PATH", "/data/orvannis.db")
# A static secret token to protect the /admin/report endpoint.
# Set ADMIN_TOKEN in your deployment env vars to any long random string.
ADMIN_TOKEN    = os.environ.get("ADMIN_TOKEN", "")

RESEND_SEND_URL = "https://api.resend.com/emails"


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
def get_db() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    # Contact form submissions
    conn.execute("""
        CREATE TABLE IF NOT EXISTS submissions (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            name         TEXT NOT NULL,
            email        TEXT NOT NULL,
            phone        TEXT,
            company      TEXT,
            message      TEXT NOT NULL,
            industry           TEXT,
            lead_source        TEXT,
            best_time          TEXT,
            preferred_contact  TEXT,
            submitted_at TEXT NOT NULL
        )
    """)
    # Email send audit log — one row per attempted send
    conn.execute("""
        CREATE TABLE IF NOT EXISTS email_log (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            submission_id  INTEGER NOT NULL,
            recipient      TEXT NOT NULL,
            email_type     TEXT NOT NULL,  -- 'auto_reply' or 'notification'
            status         TEXT NOT NULL,  -- 'sent' or 'failed'
            http_status    INTEGER,        -- Graph API HTTP status code
            error_detail   TEXT,           -- error message if failed
            attempted_at   TEXT NOT NULL,
            FOREIGN KEY(submission_id) REFERENCES submissions(id)
        )
    """)
    conn.commit()
    conn.close()
    logger.info("Database initialised at %s", DB_PATH)


# ---------------------------------------------------------------------------
# App lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Orvannis Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://orvannis.com",
        "https://www.orvannis.com",
        "https://*.pplx.app",
        "http://localhost:*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    company: str | None = None
    message: str
    industry: str | None = None
    lead_source: str | None = None
    best_time: str | None = None
    preferred_contact: str | None = "Email"


# ---------------------------------------------------------------------------
# Admin auth dependency
# ---------------------------------------------------------------------------
bearer_scheme = HTTPBearer(auto_error=False)

def require_admin(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Admin endpoint not configured (ADMIN_TOKEN not set)")
    if not credentials or not secrets.compare_digest(credentials.credentials, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return True


# ---------------------------------------------------------------------------
# Resend email sending
# ---------------------------------------------------------------------------


def build_auto_reply_html(name: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9f6f0;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:#f9f6f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:4px;overflow:hidden;
                    box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1e2a35;padding:32px 40px;text-align:center;">
            <span style="font-family:'Georgia',serif;font-size:28px;
                         letter-spacing:0.12em;color:#B87333;font-weight:700;">
              ORVANNIS
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;color:#2c2c2c;line-height:1.7;">
            <p style="margin:0 0 16px;font-size:16px;">Hi {name},</p>
            <p style="margin:0 0 16px;font-size:16px;">
              Thank you for reaching out. Your message has been received and I will
              be back with you within one business day.
            </p>
            <p style="margin:0 0 16px;font-size:16px;">
              In the meantime, feel free to explore what we are building at
              <a href="https://orvannis.com"
                 style="color:#B87333;text-decoration:none;">orvannis.com</a>
              — everything you see is shaped by real conversations like this one.
            </p>
            <p style="margin:0 0 8px;font-size:16px;">
              — Brian O'Connor<br>
              <span style="color:#B87333;font-style:italic;">Founder, Orvannis</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#1e2a35;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#8a9baa;letter-spacing:0.06em;">
              ORVANNIS &nbsp;|&nbsp; brian@orvannis.com
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def build_notification_html(form: ContactForm, submitted_at: str) -> str:
    phone_row = (
        f"<tr><td style='padding:4px 0;color:#666;width:80px;'>Phone</td>"
        f"<td style='padding:4px 0 4px 16px;'>{form.phone}</td></tr>"
        if form.phone else ""
    )
    company_row = (
        f"<tr><td style='padding:4px 0;color:#666;width:80px;'>Company</td>"
        f"<td style='padding:4px 0 4px 16px;'>{form.company}</td></tr>"
        if form.company else ""
    )
    extra_row = (
        f"<tr><td style='padding:4px 0;color:#666;width:80px;'>Industry</td>"
        f"<td style='padding:4px 0 4px 16px;'>{form.industry}</td></tr>"
        if form.industry else ""
    )
    extra_row += (
        f"<tr><td style='padding:4px 0;color:#666;width:80px;'>Best time</td>"
        f"<td style='padding:4px 0 4px 16px;'>{form.best_time}</td></tr>"
        if form.best_time else ""
    )
    extra_row += (
        f"<tr><td style='padding:4px 0;color:#666;width:80px;'>Heard via</td>"
        f"<td style='padding:4px 0 4px 16px;'>{form.lead_source}</td></tr>"
        if form.lead_source else ""
    )
    extra_row += (
        f"<tr><td style='padding:4px 0;color:#666;width:80px;'>Prefers</td>"
        f"<td style='padding:4px 0 4px 16px;'>{form.preferred_contact}</td></tr>"
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px;">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:4px;
              padding:32px;border-left:4px solid #B87333;">
    <h2 style="margin:0 0 16px;color:#1e2a35;">
      New Discovery Call Request — Orvannis
    </h2>
    <table cellpadding="0" cellspacing="0" style="font-size:15px;color:#2c2c2c;">
      <tr><td style="padding:4px 0;color:#666;width:80px;">Name</td>
          <td style="padding:4px 0 4px 16px;">{form.name}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Email</td>
          <td style="padding:4px 0 4px 16px;">
            <a href="mailto:{form.email}" style="color:#B87333;">{form.email}</a>
          </td></tr>
      {phone_row}
      {company_row}
      {extra_row}
      <tr><td style="padding:12px 0 4px;color:#666;vertical-align:top;">Message</td>
          <td style="padding:12px 0 4px 16px;">{form.message}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Received</td>
          <td style="padding:4px 0 4px 16px;color:#999;font-size:13px;">{submitted_at}</td></tr>
    </table>
  </div>
</body>
</html>"""


def build_weekly_report_html(report: dict) -> str:
    """Branded HTML for the Monday morning email digest."""
    week_label = report["week_covered"]
    total = report["total_submissions"]
    fully_sent = report["fully_delivered"]
    partial = report["partial_failures"]
    full_fail = report["full_failures"]
    no_attempt = report["no_email_attempted"]

    status_color = "#2e7d32" if full_fail == 0 and partial == 0 and no_attempt == 0 else "#b71c1c"
    status_label = "All systems healthy" if status_color == "#2e7d32" else "Action required"

    failure_rows = ""
    for f in report.get("failure_details", []):
        failure_rows += f"""
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #f0e8dc;">{f['submitted_at']}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f0e8dc;">{f['name']}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f0e8dc;">{f['email']}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f0e8dc;color:#b71c1c;">{f['issue']}</td>
        </tr>"""

    failure_section = ""
    if failure_rows:
        failure_section = f"""
        <h3 style="margin:24px 0 8px;color:#1e2a35;font-size:15px;">Submissions Requiring Attention</h3>
        <table width="100%" cellpadding="0" cellspacing="0"
               style="font-size:13px;border-collapse:collapse;">
          <tr style="background:#f0e8dc;">
            <th style="padding:6px 8px;text-align:left;">Received</th>
            <th style="padding:6px 8px;text-align:left;">Name</th>
            <th style="padding:6px 8px;text-align:left;">Email</th>
            <th style="padding:6px 8px;text-align:left;">Issue</th>
          </tr>
          {failure_rows}
        </table>"""

    daily_rows = ""
    for d in report.get("daily_breakdown", []):
        row_color = "#fff" if d["failures"] == 0 else "#fff8f5"
        fail_cell = (
            f"<td style='padding:5px 8px;color:#b71c1c;'>{d['failures']}</td>"
            if d["failures"] > 0
            else f"<td style='padding:5px 8px;color:#2e7d32;'>0</td>"
        )
        daily_rows += f"""
        <tr style="background:{row_color};border-bottom:1px solid #f0e8dc;">
          <td style="padding:5px 8px;">{d['date']}</td>
          <td style="padding:5px 8px;">{d['submissions']}</td>
          <td style="padding:5px 8px;">{d['emails_sent']}</td>
          {fail_cell}
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9f6f0;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:#f9f6f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:4px;overflow:hidden;
                    box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:#1e2a35;padding:28px 40px;">
            <span style="font-family:'Georgia',serif;font-size:22px;
                         letter-spacing:0.12em;color:#B87333;font-weight:700;">
              ORVANNIS
            </span>
            <span style="float:right;font-size:12px;color:#8a9baa;
                         line-height:2.2;letter-spacing:0.06em;">
              WEEKLY BACKEND REPORT
            </span>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 40px 8px;">
            <p style="margin:0 0 4px;font-size:13px;color:#8a9baa;letter-spacing:0.06em;">
              WEEK COVERED
            </p>
            <p style="margin:0 0 20px;font-size:17px;color:#1e2a35;">{week_label}</p>

            <div style="display:flex;gap:16px;">

              <!-- Stat cards row -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="25%" style="padding:0 6px 0 0;">
                    <div style="background:#f9f6f0;border-radius:4px;padding:16px;text-align:center;">
                      <div style="font-size:28px;font-weight:700;color:#1e2a35;">{total}</div>
                      <div style="font-size:11px;color:#8a9baa;letter-spacing:0.06em;margin-top:4px;">SUBMISSIONS</div>
                    </div>
                  </td>
                  <td width="25%" style="padding:0 6px;">
                    <div style="background:#f9f6f0;border-radius:4px;padding:16px;text-align:center;">
                      <div style="font-size:28px;font-weight:700;color:#2e7d32;">{fully_sent}</div>
                      <div style="font-size:11px;color:#8a9baa;letter-spacing:0.06em;margin-top:4px;">DELIVERED</div>
                    </div>
                  </td>
                  <td width="25%" style="padding:0 6px;">
                    <div style="background:#f9f6f0;border-radius:4px;padding:16px;text-align:center;">
                      <div style="font-size:28px;font-weight:700;color:#e65100;">{partial}</div>
                      <div style="font-size:11px;color:#8a9baa;letter-spacing:0.06em;margin-top:4px;">PARTIAL</div>
                    </div>
                  </td>
                  <td width="25%" style="padding:0 0 0 6px;">
                    <div style="background:#f9f6f0;border-radius:4px;padding:16px;text-align:center;">
                      <div style="font-size:28px;font-weight:700;color:#b71c1c;">{full_fail + no_attempt}</div>
                      <div style="font-size:11px;color:#8a9baa;letter-spacing:0.06em;margin-top:4px;">FAILED</div>
                    </div>
                  </td>
                </tr>
              </table>

            </div>

            <!-- Status badge -->
            <div style="margin:20px 0;padding:12px 16px;border-radius:4px;
                        background:{status_color}18;border-left:3px solid {status_color};">
              <span style="color:{status_color};font-size:13px;font-weight:600;">
                {status_label}
              </span>
            </div>

            <!-- Daily breakdown -->
            <h3 style="margin:20px 0 8px;color:#1e2a35;font-size:15px;">Daily Breakdown</h3>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="font-size:13px;border-collapse:collapse;">
              <tr style="background:#1e2a35;color:#ffffff;">
                <th style="padding:6px 8px;text-align:left;">Date</th>
                <th style="padding:6px 8px;text-align:left;">Submissions</th>
                <th style="padding:6px 8px;text-align:left;">Emails Sent</th>
                <th style="padding:6px 8px;text-align:left;">Failures</th>
              </tr>
              {daily_rows}
            </table>

            {failure_section}

          </td>
        </tr>

        <tr>
          <td style="background:#1e2a35;padding:20px 40px;text-align:center;margin-top:32px;">
            <p style="margin:0;font-size:12px;color:#8a9baa;letter-spacing:0.06em;">
              ORVANNIS &nbsp;|&nbsp; brian@orvannis.com &nbsp;|&nbsp; Automated weekly report
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


async def send_email_via_resend(to_address: str, subject: str, html_body: str):
    payload = {
        "from": f"Brian O'Connor <{SENDER_EMAIL}>",
        "to": [to_address],
        "subject": subject,
        "html": html_body,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            RESEND_SEND_URL,
            json=payload,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type":  "application/json",
            },
        )
        if resp.status_code not in (200, 201):
            logger.error("Resend error %s: %s", resp.status_code, resp.text)
            resp.raise_for_status()


def log_email_attempt(
    conn: sqlite3.Connection,
    submission_id: int,
    recipient: str,
    email_type: str,
    status: str,
    http_status: int | None = None,
    error_detail: str | None = None,
):
    conn.execute(
        """INSERT INTO email_log
           (submission_id, recipient, email_type, status, http_status, error_detail, attempted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (
            submission_id,
            recipient,
            email_type,
            status,
            http_status,
            error_detail,
            datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        ),
    )
    conn.commit()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
async def health():
    return {"status": "ok", "service": "orvannis-backend"}


@app.post("/contact")
async def contact(form: ContactForm):
    submitted_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    # 1. Persist submission
    conn = get_db()
    try:
        cursor = conn.execute(
            "INSERT INTO submissions "
            "(name, email, phone, company, message, industry, lead_source, best_time, preferred_contact, submitted_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (form.name, form.email, form.phone, form.company, form.message,
             form.industry, form.lead_source, form.best_time, form.preferred_contact, submitted_at),
        )
        submission_id = cursor.lastrowid
        conn.commit()
        logger.info("Stored submission #%d from %s <%s>", submission_id, form.name, form.email)
    finally:
        conn.close()

    # 2. Send emails via Resend
    if RESEND_API_KEY:
        email_error = False

        # Auto-reply
        conn = get_db()
        try:
            await send_email_via_resend(
                form.email,
                "Thanks for reaching out — Orvannis",
                build_auto_reply_html(form.name),
            )
            log_email_attempt(conn, submission_id, form.email, "auto_reply", "sent", http_status=200)
        except httpx.HTTPStatusError as exc:
            email_error = True
            log_email_attempt(conn, submission_id, form.email, "auto_reply", "failed",
                              http_status=exc.response.status_code,
                              error_detail=exc.response.text[:500])
            logger.error("Auto-reply failed for #%d: %s", submission_id, exc)
        except Exception as exc:
            email_error = True
            log_email_attempt(conn, submission_id, form.email, "auto_reply", "failed",
                              error_detail=str(exc)[:500])
            logger.error("Auto-reply error for #%d: %s", submission_id, exc)
        finally:
            conn.close()

        # Internal notifications
        for notify_email in NOTIFY_EMAILS:
            notify_email = notify_email.strip()
            if not notify_email:
                continue
            conn = get_db()
            try:
                await send_email_via_resend(
                    notify_email,
                    f"New consultation request from {form.name}",
                    build_notification_html(form, submitted_at),
                )
                log_email_attempt(conn, submission_id, notify_email, "notification", "sent", http_status=200)
            except httpx.HTTPStatusError as exc:
                email_error = True
                log_email_attempt(conn, submission_id, notify_email, "notification", "failed",
                                  http_status=exc.response.status_code,
                                  error_detail=exc.response.text[:500])
                logger.error("Notification failed to %s for #%d: %s", notify_email, submission_id, exc)
            except Exception as exc:
                email_error = True
                log_email_attempt(conn, submission_id, notify_email, "notification", "failed",
                                  error_detail=str(exc)[:500])
            finally:
                conn.close()

        if email_error:
            return {
                "success": True,
                "message": "Your message was received. "
                           "Email notification encountered an issue — Brian will follow up manually.",
            }

        logger.info("All emails sent for submission #%d", submission_id)
    else:
        logger.warning("RESEND_API_KEY not configured — skipping email send")

    return {
        "success": True,
        "message": "Thank you — your message has been received. "
                   "You will hear from us within one business day.",
    }


@app.get("/admin/report")
async def admin_report(
    days: int = 7,
    _: bool = Depends(require_admin),
):
    """
    Returns a structured weekly health report.
    Protected by Bearer token (ADMIN_TOKEN env var).
    Query param: ?days=7 (default) covers the past 7 days.
    """
    conn = get_db()
    try:
        from datetime import timedelta
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d %H:%M:%S UTC")

        # Total submissions in window
        total = conn.execute(
            "SELECT COUNT(*) FROM submissions WHERE submitted_at >= ?", (cutoff,)
        ).fetchone()[0]

        # Email log summary per submission
        rows = conn.execute("""
            SELECT
                s.id,
                s.name,
                s.email,
                s.submitted_at,
                COUNT(CASE WHEN el.status = 'sent' THEN 1 END)   AS sent_count,
                COUNT(CASE WHEN el.status = 'failed' THEN 1 END) AS fail_count,
                COUNT(el.id)                                       AS total_attempts,
                GROUP_CONCAT(
                    CASE WHEN el.status = 'failed'
                    THEN el.email_type || ':' || el.recipient || ' HTTP=' ||
                         COALESCE(CAST(el.http_status AS TEXT), 'n/a') ||
                         ' — ' || COALESCE(el.error_detail, 'unknown error')
                    END, ' | '
                ) AS failure_summary
            FROM submissions s
            LEFT JOIN email_log el ON el.submission_id = s.id
            WHERE s.submitted_at >= ?
            GROUP BY s.id
            ORDER BY s.submitted_at DESC
        """, (cutoff,)).fetchall()

        # Categorise each submission
        fully_delivered = 0
        partial_failures = 0
        full_failures = 0
        no_email_attempted = 0
        failure_details = []

        for r in rows:
            if r["total_attempts"] == 0:
                no_email_attempted += 1
                failure_details.append({
                    "submitted_at": r["submitted_at"],
                    "name": r["name"],
                    "email": r["email"],
                    "issue": "No email send attempted (check Graph credentials)",
                })
            elif r["fail_count"] == 0:
                fully_delivered += 1
            elif r["sent_count"] > 0:
                partial_failures += 1
                failure_details.append({
                    "submitted_at": r["submitted_at"],
                    "name": r["name"],
                    "email": r["email"],
                    "issue": f"Partial failure — {r['failure_summary']}",
                })
            else:
                full_failures += 1
                failure_details.append({
                    "submitted_at": r["submitted_at"],
                    "name": r["name"],
                    "email": r["email"],
                    "issue": f"Complete failure — {r['failure_summary']}",
                })

        # Daily breakdown
        daily_rows = conn.execute("""
            SELECT
                DATE(s.submitted_at) AS date,
                COUNT(DISTINCT s.id) AS submissions,
                COUNT(CASE WHEN el.status = 'sent' THEN 1 END)   AS emails_sent,
                COUNT(CASE WHEN el.status = 'failed' THEN 1 END) AS failures
            FROM submissions s
            LEFT JOIN email_log el ON el.submission_id = s.id
            WHERE s.submitted_at >= ?
            GROUP BY DATE(s.submitted_at)
            ORDER BY date DESC
        """, (cutoff,)).fetchall()

        # Recent Graph errors
        graph_errors = conn.execute("""
            SELECT el.*, s.name, s.email AS submitter_email
            FROM email_log el
            JOIN submissions s ON s.id = el.submission_id
            WHERE el.status = 'failed'
              AND el.attempted_at >= ?
            ORDER BY el.attempted_at DESC
            LIMIT 20
        """, (cutoff,)).fetchall()

        report = {
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "week_covered": f"Past {days} days (since {cutoff[:10]})",
            "total_submissions": total,
            "fully_delivered": fully_delivered,
            "partial_failures": partial_failures,
            "full_failures": full_failures,
            "no_email_attempted": no_email_attempted,
            "failure_details": failure_details,
            "daily_breakdown": [dict(r) for r in daily_rows],
            "graph_errors": [
                {
                    "attempted_at": r["attempted_at"],
                    "submission_id": r["submission_id"],
                    "submitter_name": r["name"],
                    "submitter_email": r["submitter_email"],
                    "email_type": r["email_type"],
                    "recipient": r["recipient"],
                    "http_status": r["http_status"],
                    "error_detail": r["error_detail"],
                }
                for r in graph_errors
            ],
        }

    finally:
        conn.close()

    return report
