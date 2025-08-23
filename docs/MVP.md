# MVP — myfreeslots

## Summary
A read-only, professional availability viewer. Candidates configure "green" availability windows and connect calendars. Recruiters open a shareable link and see when the candidate is generally free overlaid with busy times — no booking flow.

- Dashboard (private app): `app.myfreeslots.me`
- Public link: `myfreeslots.me/[slug]`, slug: `^[a-z0-9-]{4,10}$` (unique)

## User Stories

### Public (Recruiter)
- As a recruiter, I can open `myfreeslots.me/[slug]` and see a clean calendar (week default, month toggle).
- I see **green** default availability and **red/grey** busy overlays from connected calendars.
- When I hover on a green block, I see a tooltip: "Hey, I'm free here 🙂".
- The page is read-only; I'll propose a time via my own calendar system.

### Private (Candidate Dashboard)
- As a user, I set default availability rules (e.g., weekdays 09–12 & 15–18).
- I add exceptions (one-off additions/removals).
- I connect Google/Microsoft/Apple calendars and choose which to include as busy overlays.
- I select my unique slug and can also generate a **one-time link** for next 7 days (or custom range).
- I copy a **polite text helper** (Professional/Casual/Short) that includes my link.
- I can see basic analytics: total views, views this week, last viewed.

## Acceptance Criteria
- Public link renders accurate availability with busy overlays in user's timezone.
- Hover on green shows tooltip copy exactly.
- Slug validation & uniqueness enforced server-side.
- At least one provider connects (Google/Microsoft/Apple via ICS for Apple).
- One-time link limited to a date range; can expire.
- Analytics visible for each link.
- Sync freshness: push near-real-time; polling ≤ 15 minutes; Apple ICS polling ~10 minutes.
- DST correctness across transitions.

## Non-Goals (MVP)
- No booking, reminders, invites, conferencing links, or payment features.
- No event details storage beyond busy/free time windows.

## Data Model (initial)
- users(id, email, name, timezone, created_at)
- profiles(user_id, slug, is_active)
- availability_rules(user_id, weekday, start_time_local, end_time_local)
- availability_exceptions(user_id, start_at_utc, end_at_utc, type add|remove)
- calendar_connections(user_id, provider, tokens_encrypted, status)
- connected_calendars(connection_id, provider_calendar_id, included)
- events_cache(user_id, provider, ext_event_id, start_at_utc, end_at_utc, all_day, visibility)
- links(user_id, slug, type primary|one_time, starts_at_utc, ends_at_utc, is_active)
- link_views(link_id, viewed_at_utc, ip_hash, ua_hash)

## API Sketch
- GET /public/:slug/availability?range=YYYY-MM-DD..YYYY-MM-DD
- POST /auth/:provider/callback (OAuth)
- GET/POST /me/availability-rules
- GET/POST /me/exceptions
- GET/POST /me/links (primary + one-time)
- GET /me/analytics/links
- Webhooks: /webhooks/google, /webhooks/microsoft
- Workers: sync:poll, sync:renew-subscriptions, cache:rebuild-availability

## Security/Privacy
- Read-only calendar scopes; encrypt tokens at rest.
- Cache only time ranges (no event descriptions/attendees).
- Rate limit public endpoints; hash analytics data.
