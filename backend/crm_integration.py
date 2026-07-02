"""
crm_integration.py — Orvannis HubSpot CRM Integration Module

Creates and updates HubSpot contacts and deals from:
  - Contact form submissions (POST /contact)
  - Twilio voicemail receipts (POST /twilio/recording) — wired in once Twilio is live

Uses HubSpot Private App token (not OAuth — simpler for solo founder).
All functions are async-safe and fail silently if CRM is not configured.

Environment variables required:
  HUBSPOT_PRIVATE_APP_TOKEN   — pat-na1-... from HubSpot Private App settings
  HUBSPOT_PIPELINE_ID         — pipeline ID from HubSpot pipeline settings URL
  HUBSPOT_STAGE_NEW_LEAD      — stage ID for the "New Lead" stage

Optional (defaults to HubSpot built-in IDs if not set):
  HUBSPOT_STAGE_DISCOVERY_SCHEDULED
"""

import httpx
import logging
import os
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

HUBSPOT_API_KEY = os.getenv("HUBSPOT_PRIVATE_APP_TOKEN")
HUBSPOT_BASE = "https://api.hubapi.com"
HUBSPOT_PIPELINE_ID = os.getenv("HUBSPOT_PIPELINE_ID", "default")

# Pipeline stage IDs — set these as environment variables after creating your pipeline.
# Fallback values use HubSpot's default deal stage internal names.
# Replace with your actual stage IDs from: GET /crm/v3/pipelines/deals/{pipeline_id}
STAGE_NEW_LEAD = os.getenv("HUBSPOT_STAGE_NEW_LEAD", "appointmentscheduled")
STAGE_DISCOVERY_SCHEDULED = os.getenv("HUBSPOT_STAGE_DISCOVERY_SCHEDULED", "qualifiedtobuy")


def _headers() -> dict:
    """Return standard HubSpot API headers using the current token."""
    return {
        "Authorization": f"Bearer {HUBSPOT_API_KEY}",
        "Content-Type": "application/json",
    }


async def upsert_contact(
    email: str,
    first_name: str,
    last_name: str = "",
    phone: Optional[str] = None,
    company: Optional[str] = None,
    industry: Optional[str] = None,
    lead_source: Optional[str] = None,
    message: Optional[str] = None,
) -> Optional[str]:
    """
    Create or update a HubSpot contact by email.

    If the email already exists in HubSpot (409 conflict), searches for the
    existing contact and updates it instead. Returns the HubSpot contact ID
    (string) on success, or None on failure or if CRM is not configured.
    """
    if not HUBSPOT_API_KEY:
        logger.info("HubSpot not configured — skipping contact upsert (set HUBSPOT_PRIVATE_APP_TOKEN)")
        return None

    properties = {
        "email": email,
        "firstname": first_name,
        "lastname": last_name,
        "lifecyclestage": "lead",
        "hs_lead_status": "NEW",
    }
    if phone:
        properties["phone"] = phone
    if company:
        properties["company"] = company
    if industry:
        properties["industry"] = industry
    if lead_source:
        properties["lead_source"] = lead_source
    if message:
        # hs_content_membership_notes is a built-in text field safe to use for notes
        properties["hs_content_membership_notes"] = message[:1000]

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Attempt to create the contact
            r = await client.post(
                f"{HUBSPOT_BASE}/crm/v3/objects/contacts",
                headers=_headers(),
                json={"properties": properties},
            )

            if r.status_code in (200, 201):
                contact_id = r.json().get("id")
                logger.info(f"HubSpot contact created: {contact_id} ({email})")
                return contact_id

            if r.status_code == 409:
                # Contact exists — extract ID from error message if present,
                # otherwise search by email
                error_body = r.json()
                error_msg = error_body.get("message", "")
                existing_id = None

                if "ID: " in error_msg:
                    # HubSpot sometimes embeds the ID directly in the 409 message
                    existing_id = error_msg.split("ID: ")[-1].strip()

                if not existing_id:
                    search_r = await client.post(
                        f"{HUBSPOT_BASE}/crm/v3/objects/contacts/search",
                        headers=_headers(),
                        json={
                            "filterGroups": [
                                {
                                    "filters": [
                                        {
                                            "propertyName": "email",
                                            "operator": "EQ",
                                            "value": email,
                                        }
                                    ]
                                }
                            ]
                        },
                    )
                    results = search_r.json().get("results", [])
                    existing_id = results[0]["id"] if results else None

                if existing_id:
                    patch_r = await client.patch(
                        f"{HUBSPOT_BASE}/crm/v3/objects/contacts/{existing_id}",
                        headers=_headers(),
                        json={"properties": properties},
                    )
                    if patch_r.status_code in (200, 201):
                        logger.info(f"HubSpot contact updated: {existing_id} ({email})")
                        return existing_id

            logger.warning(f"HubSpot contact upsert failed: {r.status_code} — {r.text[:200]}")
            return None

    except Exception as e:
        logger.error(f"HubSpot contact upsert exception: {e}")
        return None


async def create_deal(
    contact_id: str,
    deal_name: str,
    lead_source: Optional[str] = None,
    notes: Optional[str] = None,
) -> Optional[str]:
    """
    Create a new HubSpot deal in the 'New Lead' pipeline stage and
    associate it with the given contact ID.

    Returns the HubSpot deal ID (string) on success, or None on failure.
    """
    if not HUBSPOT_API_KEY or not contact_id:
        return None

    properties = {
        "dealname": deal_name,
        "pipeline": HUBSPOT_PIPELINE_ID,
        "dealstage": STAGE_NEW_LEAD,
    }
    if lead_source:
        properties["lead_source"] = lead_source
    if notes:
        properties["description"] = notes[:2000]

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Create the deal
            r = await client.post(
                f"{HUBSPOT_BASE}/crm/v3/objects/deals",
                headers=_headers(),
                json={"properties": properties},
            )

            if r.status_code not in (200, 201):
                logger.warning(f"HubSpot deal creation failed: {r.status_code} — {r.text[:200]}")
                return None

            deal_id = r.json().get("id")
            logger.info(f"HubSpot deal created: {deal_id} ({deal_name})")

            # Associate the deal with the contact
            assoc_r = await client.put(
                f"{HUBSPOT_BASE}/crm/v3/associations/deals/contacts/batch/create",
                headers=_headers(),
                json={
                    "inputs": [
                        {
                            "from": {"id": deal_id},
                            "to": {"id": contact_id},
                            "type": "deal_to_contact",
                        }
                    ]
                },
            )
            if assoc_r.status_code not in (200, 201):
                logger.warning(f"HubSpot deal-contact association failed: {assoc_r.status_code}")
            else:
                logger.info(f"HubSpot deal {deal_id} associated with contact {contact_id}")

            return deal_id

    except Exception as e:
        logger.error(f"HubSpot deal creation exception: {e}")
        return None


async def log_note(contact_id: str, note_body: str) -> None:
    """
    Create a note in HubSpot and associate it with the given contact.
    Fails silently — a missing note should never block the main request.
    """
    if not HUBSPOT_API_KEY or not contact_id:
        return

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            note_r = await client.post(
                f"{HUBSPOT_BASE}/crm/v3/objects/notes",
                headers=_headers(),
                json={
                    "properties": {
                        "hs_note_body": note_body,
                        "hs_timestamp": str(int(datetime.utcnow().timestamp() * 1000)),
                    }
                },
            )

            if note_r.status_code not in (200, 201):
                logger.warning(f"HubSpot note creation failed: {note_r.status_code}")
                return

            note_id = note_r.json().get("id")

            await client.put(
                f"{HUBSPOT_BASE}/crm/v3/associations/notes/contacts/batch/create",
                headers=_headers(),
                json={
                    "inputs": [
                        {
                            "from": {"id": note_id},
                            "to": {"id": contact_id},
                            "type": "note_to_contact",
                        }
                    ]
                },
            )
            logger.info(f"HubSpot note {note_id} logged for contact {contact_id}")

    except Exception as e:
        logger.error(f"HubSpot log_note exception: {e}")


async def create_lead_from_form_submission(submission: dict) -> dict:
    """
    Main entry point called after a successful POST /contact form submission.

    Expected keys in submission dict:
        name            (str)  full name — split into first/last
        email           (str)  required — used as HubSpot identifier
        phone           (str, optional)
        company         (str, optional)
        message         (str, optional)
        industry        (str, optional)  business industry
        lead_source     (str, optional)  defaults to "Website"
        preferred_contact (str, optional)
        best_time       (str, optional)

    Returns:
        {"contact_id": str|None, "deal_id": str|None}
    """
    name_parts = submission.get("name", "").strip().split(" ", 1)
    first = name_parts[0] if name_parts else "Unknown"
    last = name_parts[1] if len(name_parts) > 1 else ""

    email = submission.get("email", "").strip()
    if not email:
        logger.warning("CRM skipped — no email in form submission")
        return {"contact_id": None, "deal_id": None}

    contact_id = await upsert_contact(
        email=email,
        first_name=first,
        last_name=last,
        phone=submission.get("phone"),
        company=submission.get("company"),
        industry=submission.get("industry"),
        lead_source=submission.get("lead_source", "Website"),
        message=submission.get("message"),
    )

    deal_id = None
    if contact_id:
        month_str = datetime.utcnow().strftime("%b %Y")
        deal_name = f"Orvannis Discovery — {submission.get('name', 'Unknown')} ({month_str})"

        deal_id = await create_deal(
            contact_id=contact_id,
            deal_name=deal_name,
            lead_source=submission.get("lead_source", "Website"),
            notes=submission.get("message", ""),
        )

        # Build a structured note with all submission fields
        note_lines = [
            f"Website inquiry received {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
            f"Company: {submission.get('company') or 'Not specified'}",
            f"Industry: {submission.get('industry') or 'Not specified'}",
            f"Preferred contact method: {submission.get('preferred_contact') or 'Not specified'}",
            f"Best time to reach: {submission.get('best_time') or 'Not specified'}",
            f"Phone: {submission.get('phone') or 'Not provided'}",
            "",
            f"Message:",
            (submission.get("message") or "")[:500],
        ]
        await log_note(contact_id, "\n".join(note_lines))

    return {"contact_id": contact_id, "deal_id": deal_id}


async def create_lead_from_voicemail(
    caller_number: str,
    transcription: Optional[str] = None,
) -> dict:
    """
    Called from POST /twilio/recording when a voicemail is received.

    Creates a HubSpot contact using phone number as the primary identifier.
    A placeholder email is generated so HubSpot's required email field is satisfied.
    Brian can manually update the contact with a real email once he calls back.

    Returns:
        {"contact_id": str|None, "deal_id": str|None}
    """
    # Generate a deterministic placeholder email so repeat voicemails from
    # the same number don't create duplicate contacts
    safe_number = caller_number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "")
    placeholder_email = f"voicemail_{safe_number}@orvannis-lead.local"

    transcription_text = transcription or "Transcription pending — check Twilio dashboard"

    contact_id = await upsert_contact(
        email=placeholder_email,
        first_name="Phone Lead",
        last_name=caller_number,
        phone=caller_number,
        lead_source="Phone",
        message=f"Voicemail from {caller_number}. Transcription: {transcription_text}",
    )

    deal_id = None
    if contact_id:
        month_str = datetime.utcnow().strftime("%b %Y")
        deal_id = await create_deal(
            contact_id=contact_id,
            deal_name=f"Phone Lead — {caller_number} ({month_str})",
            lead_source="Phone",
            notes=f"Voicemail from {caller_number}. Transcription: {transcription_text}",
        )

        note_body = (
            f"Voicemail received {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}\n"
            f"Caller number: {caller_number}\n"
            f"Transcription: {transcription_text}\n\n"
            f"ACTION NEEDED: Call back and update this contact with real name and email."
        )
        await log_note(contact_id, note_body)

    return {"contact_id": contact_id, "deal_id": deal_id}


async def get_pipeline_summary_for_email() -> str:
    """
    Returns a plain-text pipeline summary section for the weekly briefing email.
    Pulls all open deals from HubSpot and groups them by stage.
    Called from the weekly email generator in server.py.
    """
    if not HUBSPOT_API_KEY:
        return (
            "SECTION — SALES PIPELINE\n"
            + "-" * 37 + "\n"
            "  CRM not configured.\n"
            "  Add HUBSPOT_PRIVATE_APP_TOKEN to Railway to enable pipeline reporting."
        )

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(
                f"{HUBSPOT_BASE}/crm/v3/objects/deals/search",
                headers=_headers(),
                json={
                    "filterGroups": [],
                    "properties": ["dealname", "dealstage", "amount", "createdate"],
                    "limit": 100,
                },
            )
            deals = r.json().get("results", [])

        by_stage: dict = {}
        total_value = 0.0

        for deal in deals:
            props = deal.get("properties", {})
            stage = props.get("dealstage") or "unknown"
            by_stage[stage] = by_stage.get(stage, 0) + 1
            amount_raw = props.get("amount")
            if amount_raw:
                try:
                    total_value += float(amount_raw)
                except (ValueError, TypeError):
                    pass

        lines = ["SECTION — SALES PIPELINE", "-" * 37]
        if not by_stage:
            lines.append("  No active deals in pipeline.")
        else:
            for stage, count in sorted(by_stage.items()):
                lines.append(f"  {stage}: {count} deal(s)")
        lines.append("")
        lines.append(f"  Total pipeline value: ${total_value:,.2f}")
        lines.append(f"  Total deals: {len(deals)}")
        return "\n".join(lines)

    except Exception as e:
        logger.error(f"HubSpot pipeline summary exception: {e}")
        return "SECTION — SALES PIPELINE\n  Error fetching pipeline data — check logs."
