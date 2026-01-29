# Phase 3 – LLM Plan/Chat QA Checklist

## Objective
Validate the LLM‑driven weekly‑plan generation and chat‑coach feature end‑to‑end, ensuring:
- Row‑Level Security (RLS) isolates plan data between **at least two users**.
- The plan generation pipeline (profile + calendar + LLM) produces a deterministic JSON structure.
- Chat endpoint returns appropriate responses and respects authentication.
- Failure handling (LLM timeout, API error) triggers graceful fallback and retry.
- UI displays the plan and chat correctly for the authenticated user only.

## Prerequisites
1. **Supabase CLI** installed (`npm i -g supabase`).
2. Access to the **LetiSmartCoach** Supabase project (env vars `SUPABASE_URL`, `SUPABASE_ANON_KEY`).
3. Two test user accounts (same as previous phases):
   - `qa_user_a@example.com`
   - `qa_user_b@example.com`
4. OpenAI (or compatible) API key stored in `.env` as `OPENAI_API_KEY`.
5. Node 18+ environment.
6. Local dev server running (`npm run dev`).

## Reproducible Steps
| Step | Action | Expected Result | Evidence |
|------|--------|----------------|----------|
| 1 | **Create test users** (if not already). | Users appear in Auth dashboard. | Screenshot of Auth list. |
| 2 | **Verify RLS policies** for `weekly_plans` and `chat_sessions` tables (`policy_weekly_plans_user`, `policy_chat_sessions_user`). | Policies listed in `supabase/migrations/*.sql`. | `grep` output of policy definitions. |
| 3 | **Login as User A** (`supabase login` with email/password). | Auth token stored locally. | `supabase status` shows user A. |
| 4 | **Trigger plan generation** via backend endpoint (`POST /api/generate-plan`). Payload includes user profile ID. | Backend creates a row in `weekly_plans` with `status='pending'`. | DB row screenshot. |
| 5 | **Run background worker** (`npm run worker:plan`). | Worker calls LLM, updates `status` to `completed` and stores `plan_json`. | Log line `Plan generated for user A`. |
| 6 | **Fetch generated plan** as User A (`GET /rest/v1/weekly_plans`). | Only User A's plan returned, JSON matches expected schema. | Response JSON + schema validation output. |
| 7 | **Login as User B** and repeat steps 4‑6. Ensure isolation. | User B sees only its own plan. | API response JSON showing only B's plan. |
| 8 | **Cross‑user read test**: while logged in as A, request plan ID belonging to B. | `403 Forbidden` (RLS block). | Error response screenshot. |
| 9 | **Chat endpoint test** (`POST /api/chat` with message). | Returns `{ reply: "...", session_id: <id> }` and creates a row in `chat_sessions`. | API response JSON + DB row screenshot. |
|10| **Validate chat RLS**: as User A, request a `chat_sessions` row belonging to B. | `403 Forbidden`. | Error response screenshot. |
|11| **Simulate LLM failure** (e.g., mock OpenAI API to return 500). | Worker sets `status='failed'` and records `error_message`. | Log line `Plan generation failed`. |
|12| **Verify retry logic**: worker automatically retries up to 2 times, then leaves `status='failed'`. | After retries, status remains `failed`. | Log excerpt showing retry attempts. |
|13| **Manual retry UI** (`npm run test:plan-retry`). | Clicking *Retry* resets `status='pending'` and clears error. | UI screenshot before/after retry. |
|14| **Run UI integration test suite** (`npm run test:plan-chat`). | All tests pass, UI shows plan cards and chat bubbles correctly. | CI test log excerpt. |
|15| **Check CI pipeline** – ensure the QA checklist is part of the merge guard. | Pipeline fails if any step above fails. | CI badge/status image. |

## Blocking Merge
- Add a **GitHub Actions** job `llm-plan-chat-qa` that executes the steps above.
- Configure branch protection to require `llm-plan-chat-qa` to pass before merging.
- The job exits with a non‑zero status on any failure, automatically blocking the merge.

## Evidence Collection
- Store screenshots in `qa/evidence/llm/`.
- Keep API and worker logs in `qa/logs/llm/`.
- Commit the `qa/` folder alongside the checklist.

---
*Generated on 2026‑01‑27 by QA/Release assistant.*
