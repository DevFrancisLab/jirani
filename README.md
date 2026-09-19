# Jirani

Jirani is a WhatsApp-first community participation platform for Team Urbana. Residents can ask about nearby developments, share concerns, and contribute evidence for planning conversations. The first deployment focus is Kilimani, Nairobi.

The product loop is:

`Development → resident participation → community concerns → AI-assisted classification → potential spatial patterns → planning evidence`

## Repository layout

| Path | Purpose |
| --- | --- |
| `src/` | Vite, React, TypeScript dashboard with map, development, concern, insight, report, and settings views. |
| `backend/` | Django application for WhatsApp, AI interpretation, domain records, aggregation, and dashboard APIs. |
| `backend/jirani_core/` | Domain models, views, integrations, services, migrations, and tests. |
| `backend/.env.example` | Safe configuration template; contains no credentials. |

## Architecture

```text
Meta WhatsApp Cloud API
          │
          ▼
Django webhook / conversation context
          │
          ├── Development lookup (database is the source of truth)
          ├── Cerebras chat-completions AI adapter
          ▼
Validated structured result
          │
          ▼
Resident → Conversation → Message → CommunityConcern → PotentialHotspot
          │
          ▼
Authenticated dashboard APIs → React dashboard / map
```

The language model interprets untrusted resident language only. Django validates categories, controls persistence, scopes dashboard data to an organization, and never treats an emerging pattern as proof of causation.

## Key capabilities

- Meta webhook verification and optional `X-Hub-Signature-256` validation.
- Idempotent inbound WhatsApp processing using Meta message IDs.
- Text-message handling, resident and conversation creation, outbound response recording, and image metadata storage.
- Explicit image fallback: image understanding is not claimed until a compatible multimodal integration is configured.
- Structured AI result validation for `TRAFFIC`, `WATER_SEWER`, `DRAINAGE`, `ENVIRONMENT`, and `OTHER`.
- Development context retained on conversations.
- Conservative related-concern aggregation into `PotentialHotspot` records after a configurable threshold.
- Organization-scoped dashboard endpoints that do not expose resident identities.

## Prerequisites

- Node.js and a package manager compatible with the lockfile (Bun is used by the repository).
- Python 3.11+ and pip.
- A Meta WhatsApp Cloud API app for live delivery and incoming webhooks.
- A Cerebras API key authorized for the model in `CEREBRAS_MODEL` if AI interpretation is required.

## Frontend setup

```bash
bun install
bun run dev
```

Other frontend commands:

```bash
bun run build
bun run lint
bun run preview
```

The current dashboard uses mock data through `src/services/dashboardService.ts`. Its shapes are designed to map cleanly to the backend endpoints below; connecting it to live HTTP APIs remains a frontend integration task.

## Backend setup

```bash
cd backend
python -m pip install -r requirements.txt
```

Copy the template before adding local values:

```bash
Copy-Item .env.example .env
```

Then migrate, test, and run:

```bash
python manage.py migrate
python manage.py test
python manage.py runserver
```

`backend/.env` is ignored by Git. Never commit or paste API keys, access tokens, database URLs, or webhook secrets.

## Environment configuration

Configure these values in `backend/.env`:

| Variable | Required for | Notes |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | production Django | Use a unique secret. |
| `DJANGO_DEBUG` | Django behavior | Use `false` outside local development. |
| `DATABASE_URL` | production database | Configure Django's production database settings for PostgreSQL before enabling it. |
| `CEREBRAS_API_KEY` | AI | Must be active and authorized. |
| `CEREBRAS_MODEL` | AI | Current template value: `gpt-oss-120b`. |
| `WHATSAPP_ACCESS_TOKEN` | Meta outbound messages | Meta Cloud API access token. |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta outbound messages | Numeric Meta identifier, not a phone number. |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | tenant webhook routing | Optional for single-organization development. |
| `WHATSAPP_VERIFY_TOKEN` | webhook GET verification | Shared secret supplied to Meta. |
| `WHATSAPP_API_VERSION` | Meta request URL | Template uses `v21.0`. |
| `WHATSAPP_APP_SECRET` | webhook signature checking | Enable in production. |
| `JIRANI_HOTSPOT_MIN_CONCERNS` | aggregation | Conservative minimum related-report threshold. |

## WhatsApp webhook

Configure Meta to send webhooks to:

```text
https://<public-host>/webhooks/whatsapp/
```

The endpoint supports:

1. `GET` verification using `hub.mode`, `hub.verify_token`, and `hub.challenge`.
2. `POST` handling of text and image message events.
3. Signature validation when `WHATSAPP_APP_SECRET` is configured.

For local webhook testing, expose the Django server through a trusted HTTPS tunnel and subscribe to WhatsApp `messages` events in Meta. Development/test apps can send only to Meta-allowed test recipients.

## Dashboard API

All `/api/` routes require an authenticated Django user who belongs to an `Organization`.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/overview/` | Active development, response, hotspot, and category metrics. |
| `GET /api/developments/?search=` | Organization-scoped development list and search. |
| `GET /api/developments/<id>/` | Development detail and concern breakdown. |
| `GET /api/concerns/?category=&status=&development_id=` | Filtered, privacy-safe concern records. |
| `GET /api/map/` | Developments and potential hotspots with coordinates. |
| `GET /api/insights/` | Category counts and emerging-pattern data. |

Responses intentionally omit resident identity and private conversation data.

## Domain model

```text
Organization
 ├── Residents
 │    └── Conversations
 │         ├── Messages
 │         └── Community concerns
 ├── Developments
 └── Potential hotspots
```

`PotentialHotspot` means a related-report pattern has crossed the configured threshold. It is not a confirmed infrastructure failure and does not establish that a development caused an issue.

## AI behavior and safeguards

The AI adapter asks for JSON containing intent, a controlled concern category, concern text, clarification state, and a concise resident response. The backend rejects malformed output or categories outside the controlled list. If the provider is unavailable or rejects a request, no concern is created and the resident receives a safe fallback.

Do not use AI output as official planning advice, a decision to approve/reject development, evidence of causation, or a source of development facts not present in the database.

## Testing

Run backend tests from `backend/`:

```bash
python manage.py test
python manage.py check
```

Tests mock external AI and WhatsApp interactions; they do not consume API credits or send real messages. Coverage includes webhook verification, inbound text flow, duplicate-message idempotency, resident/conversation/message creation, and AI category validation.

## Current integration status

- Local Django checks and automated tests pass.
- Meta WhatsApp outbound delivery has been accepted using configured credentials.
- Live Cerebras calls currently require an API key/account authorized for the selected model. A provider `403` causes the intentional fallback rather than corrupting records.

## Deployment notes

- Use PostgreSQL in production and configure `DATABASES` accordingly.
- Run behind HTTPS, set production `ALLOWED_HOSTS`, and disable Django debug mode.
- Keep `.env` in the deployment secret store, not source control.
- Configure a background worker if throughput requires asynchronous AI/webhook processing; domain services are kept separate so this can be added without rewriting the webhook flow.
- Add database backups, application monitoring, and restricted organization/user provisioning before production use.
