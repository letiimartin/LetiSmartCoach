# Phase 2 – Wahoo Import/Export QA Checklist

## Objective
Validate the Wahoo connector end‑to‑end, ensuring:
- Row‑Level Security (RLS) isolates data between **at least two users**.
- OAuth2 flow (authorization, token refresh) works securely.
- `export_status` column transitions correctly (`pending → processing → completed` or `failed`).
- Automatic retry logic is triggered on transient failures.
- UI reflects correct export state and allows manual retry.

## Prerequisites
1. **Supabase CLI** installed (`npm i -g supabase`).
2. Access to the **LetiSmartCoach** Supabase project (env vars `SUPABASE_URL`, `SUPABASE_ANON_KEY`).
3. Two test user accounts (same as Phase 1):
   - `qa_user_a@example.com`
   - `qa_user_b@example.com`
4. Wahoo sandbox credentials (client_id, client_secret) stored in `.env` as `WAHOO_CLIENT_ID` / `WAHOO_CLIENT_SECRET`.
5. Node 18+ environment.

## Reproducible Steps
| Step | Action | Expected Result | Evidence |
|------|--------|----------------|----------|
| 1 | **Create test users** (if not already). | Users appear in Auth dashboard. | Screenshot of Auth list. |
| 2 | **Assign RLS policies** for `wahoo_exports` table (policy `policy_wahoo_exports_user`). Verify via migration. | Policy present. | `grep` output of policy definition. |
| 3 | **Login as User A** and obtain OAuth token via backend endpoint (`POST /auth/wahoo`). | Access token stored, refresh token saved. | API response JSON. |
| 4 | **Trigger an export** for User A (`POST /rest/v1/wahoo_exports` with `status='pending'`). | Row created with `user_id = A` and `status='pending'`. | DB row screenshot. |
| 5 | **Run background worker** (e.g., `npm run worker:wahoo`). | Worker picks up pending row, updates `status` to `processing`. | Log line `Processing export ID …`. |
| 6 | **Simulate successful export** (mock Wahoo API returns 200). | Row updates to `status='completed'` and `export_url` populated. | DB row screenshot showing `completed`. |
| 7 | **Login as User B**, repeat steps 3‑6. Ensure rows are isolated. | User B only sees its own rows. | API `GET /rest/v1/wahoo_exports` response JSON. |
| 8 | **Cross‑user read test**: while logged in as A, request export ID belonging to B. | `403 Forbidden` (RLS block). | Error response screenshot. |
| 9 | **Force a failure**: mock Wahoo API to return 500 for a pending export of User A. | Worker sets `status='failed'` and increments `retry_count`. | Log line `Export failed, retry_count=1`. |
|10| **Verify retry logic**: worker automatically retries up to 3 times, then sets `status='failed'` if still error. | After 3 attempts, status remains `failed`. | Log excerpt showing retries. |
|11| **Manual retry UI** (`npm run test:wahoo-retry`). | Clicking *Retry* sets `status='pending'` and resets `retry_count`. | UI screenshot before/after retry. |
|12| **Run UI integration test** (`npm run test:wahoo`). | All tests pass, UI reflects correct status badges. | CI test log excerpt. |
|13| **Check CI pipeline** – ensure the QA checklist is part of the merge guard. | Pipeline fails if any step above fails. | CI badge/status image. |

## Blocking Merge
- Add a **GitHub Actions** job `wahoo-qa` that runs the above steps.
- Configure `branch-protection` to require `wahoo-qa` to pass before merging.
- The job exits with a non‑zero status on any failure, automatically blocking the merge.

## Evidence Collection
- Store screenshots in `qa/evidence/wahoo/`.
- Keep API logs in `qa/logs/wahoo/`.
- Commit the `qa/` folder alongside the checklist.

---
*Generated on 2026‑01‑27 by QA/Release assistant.*
