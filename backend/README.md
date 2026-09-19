# Jirani backend

Django backend for the Jirani WhatsApp flow. It is intentionally separate from the existing Vite dashboard and exposes authenticated dashboard endpoints under `/api/` plus Meta's webhook at `/webhooks/whatsapp/`.

## Local setup

Copy `.env.example` to `.env` and set configuration externally. Install `requirements.txt`, then run `python manage.py migrate`, `python manage.py test`, and `python manage.py runserver`.

The local default database is SQLite. Configure the production `DATABASES` setting for the project's PostgreSQL deployment; no credentials belong in source control.

## Design

`Organization → Resident → Conversation → Message`, with `Development`, `CommunityConcern`, and conservative `PotentialHotspot` aggregation. The LLM only interprets language; application code validates categories and controls all writes. Image messages are stored as media metadata and receive an explicit fallback until a multimodal provider is configured.

The webhook deduplicates on Meta message IDs and validates `X-Hub-Signature-256` when `WHATSAPP_APP_SECRET` is configured. Dashboard queries are scoped to the signed-in user's organization.
