---
description: MVP Phase 4 - Wahoo IMPORT + EXPORT pipeline (DB + connector + UI hooks)
---

Goal: Import real workouts from Wahoo and export planned sessions to Wahoo devices.

Steps:
1) DB (mvp/db):
   - planned_sessions.export_status check: pending/exporting/exported/failed
   - planned_sessions.export_last_error (text, null)
   - planned_sessions.exported_at (timestamptz, null)
   - wahoo_tokens updated_at + trigger
   - Strict RLS policies on wahoo_tokens, workouts, planned_sessions.

2) Wahoo Connector (mvp/wahoo):
   - OAuth/refresh handled safely.
   - Import incremental activities -> workouts (dedupe by unique(user_id, provider, provider_activity_id)).
   - Export function:
     - set export_status=exporting
     - build Wahoo workout payload from structure_json
     - create/upload workout to Wahoo + schedule if supported
     - save export_refs + exported_at + status=exported
     - on error: status=failed + export_last_error

3) UI (mvp/ui):
   - Session detail shows export_status badge
   - Button "Enviar a Wahoo" (disabled if exporting/exported)
   - If failed -> show error + Retry

4) QA (mvp/qa):
   - Import works for a test user
   - Export 1 cycling session works end-to-end
   - Retry works after a simulated failure
   - Checklist PASS/FAIL

Exit criteria:
- Gate A (DB) PASS
- Gate B (Wahoo) PASS
- Gate D (UI) PASS
- Gate E (QA) PASS