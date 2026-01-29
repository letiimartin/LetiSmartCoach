---
description: MVP Phase 3 - Calendario persistente (Supabase CRUD + UI + QA gate)
---

Goal: Calendar is the single source of context and persists in Supabase.

Steps:
1) DB (mvp/db):
   - Ensure calendar_events has index (user_id, start_dt).
   - Ensure constraint: end_dt >= start_dt (when end_dt not null).
   - Ensure strict RLS policies (USING + WITH CHECK).
   - Consider updated_at trigger if table has updated_at.

2) Services (mvp/services):
   - calendarService: list(rangeStart, rangeEnd), create, update, delete.
   - Range queries only (no full-table fetch).

3) UI (mvp/ui):
   - Week view + Month view from Supabase (no mock).
   - Month dots by type (race/social/health/personal).
   - Add/Edit event form with conditional fields.

4) QA (mvp/qa):
   - Create/edit/delete event persists.
   - RLS: user1 cannot access user2 events.
   - Checklist PASS/FAIL.

Exit criteria:
- Gate A (DB) PASS
- Gate D (UI) PASS
- Gate E (QA) PASS