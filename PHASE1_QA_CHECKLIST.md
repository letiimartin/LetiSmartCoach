# Phase 1 – Calendar QA Checklist

## Objective
Validate the Calendar feature end‑to‑end, ensuring:
- Row‑Level Security (RLS) correctly isolates data between **at least two users**.
- All CRUD operations on `calendar_events` respect the policies.
- UI reflects only the authenticated user's events.
- No regression in related services (WorkoutsContext, EventCard).

## Prerequisites
1. **Supabase CLI** installed (`npm i -g supabase`).
2. Access to the **LetiSmartCoach** Supabase project (project ID stored in `.env` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`).
3. Two test user accounts:
   - `qa_user_a@example.com` (role: `member`)
   - `qa_user_b@example.com` (role: `member`)
4. Node 18+ environment.

## Reproducible Steps
| Step | Action | Expected Result | Evidence |
|------|--------|----------------|----------|
| 1 | **Create test users** via Supabase Auth UI or CLI. | Users appear in Auth dashboard. | Screenshot of Auth list. |
| 2 | **Assign RLS policies** (already in migration). Verify `policy_calendar_events_user` exists. | Policy listed in `supabase/migrations/*.sql`. | `grep` output of policy definition. |
| 3 | **Login as User A** (`supabase login` with email/password). | Auth token stored locally. | `supabase status` shows user A. |
| 4 | **Insert a calendar event** for User A via API (`POST /rest/v1/calendar_events`). | Event row created with `user_id = A`. | API response JSON + DB row screenshot. |
| 5 | **Login as User B** and repeat insertion. | Separate row with `user_id = B`. | Same as above. |
| 6 | **Fetch events** as User A (`GET /rest/v1/calendar_events`). | Only User A's row returned. | Response JSON showing only A's event. |
| 7 | **Fetch events** as User B. | Only User B's row returned. | Response JSON showing only B's event. |
| 8 | **Attempt cross‑user read**: while logged in as A, request an event ID belonging to B. | `403 Forbidden` (RLS block). | Error response screenshot. |
| 9 | **Run UI integration test** (`npm run test:calendar`). | Test suite passes, UI shows correct events. | CI test log excerpt. |
| 10 | **Check CI pipeline** – ensure the QA checklist is part of the merge guard. | Pipeline fails if any step above fails. | CI badge/status image. |

## Blocking Merge
- Add a **GitHub Actions** job `calendar-qa` that runs the above steps.
- Configure `branch-protection` to require `calendar-qa` to pass before merging.
- If any step fails, the job exits with non‑zero status, automatically blocking the merge.

## Evidence Collection
- Store screenshots in `qa/evidence/calendar/`.
- Keep API logs in `qa/logs/calendar/`.
- Commit the `qa/` folder alongside the checklist.

---
*Generated on 2026‑01‑27 by QA/Release assistant.*
