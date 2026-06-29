# Orvannis Website Task Handoff

Start here. This package contains everything the website-building task needs.

---

## Priority Read Order

1. **`context/orvannis-chat-summary.md`** — Full technical spec for the backend:
   contact form endpoint, request/response shape, CORS origins, database schema,
   environment variables, and a ready-to-paste JavaScript fetch function.
   Read this first.

2. **`brand-assets/orvannis-brand-sheet.md`** — Single source of truth for brand:
   color palette (copper #B87333 / basalt #33302B / paper #F5F2EC), typography,
   taglines, voice, and module naming.

3. **`brand-assets/orvannis-logo-brief.md`** — Logo direction: the continuous-loop O
   in copper, wordmark in basalt, do/don't rules, deliverables checklist.

4. **`brand-assets/orvannis-social-tracker.md`** — Social links block for the website
   footer/contact page. Fill in actual URLs as accounts are claimed.

---

## Backend Integration (quick reference)

**Contact form endpoint:**
```
POST https://YOUR_BACKEND_URL/contact
Content-Type: application/json

{ "name": "...", "email": "...", "company": "...", "message": "..." }
```

**Success response:**
```json
{ "success": true, "message": "Thank you — your message has been received..." }
```

**Health check:** `GET https://YOUR_BACKEND_URL/health`

The backend URL will be known once Brian deploys to Railway or Render.
Use an environment variable in the website build (e.g. `VITE_API_URL` or `NEXT_PUBLIC_API_URL`).

---

## Folder Structure

```
orvannis-handoff/
├── README.md                          ← you are here
├── context/
│   ├── orvannis-chat-summary.md       ← full backend spec + integration guide
│   └── chat-handoff-prompts.md        ← prior session context for reference
├── brand-assets/
│   ├── orvannis-brand-sheet.md        ← colors, typography, voice, taglines
│   ├── orvannis-logo-brief.md         ← logo design direction
│   ├── orvannis-social-setup.md       ← social handle setup sheet
│   └── orvannis-social-tracker.md     ← social links for footer
└── backend/
    ├── server.py                      ← FastAPI app (699 lines, production-ready)
    ├── requirements.txt
    ├── Dockerfile
    ├── railway.toml
    ├── render.yaml
    ├── .env.example                   ← all 7 env vars listed with descriptions
    └── GRAPH_SETUP.md                 ← Azure App Registration walkthrough
```

---

## Outstanding Items Before Launch

| # | Item | Owner |
|---|------|-------|
| 1 | Deploy backend to Railway or Render | Brian |
| 2 | Complete Azure App Registration (follow backend/GRAPH_SETUP.md) | Brian |
| 3 | Generate ADMIN_TOKEN and add to deployment | Brian |
| 4 | Share deployed backend URL so weekly monitor activates | Brian → agent |
| 5 | Wire website contact form to deployed backend URL | Website task |
