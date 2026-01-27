---
description: MVP Phase 5 - LLM generates weekly plan + chat coach (writes to Supabase)
---

Goal: LLM produces a weekly plan using profile + calendar + recent workouts and stores it in Supabase.

Steps:
1) LLM Output Contract:
   - planned_sessions.structure_json = array of steps:
     { type, duration_s, target_type, target_min, target_max, notes }
   - targets_json includes total_duration_s, main_goal, zones, estimated_tss (optional)

2) Plan generation:
   - Create training_plans row for week range
   - Insert planned_sessions for each day
   - Store rationale text (short coach explanation)

3) Chat coach:
   - Store messages in coach_messages
   - Allow "replan week" action to overwrite/update planned_sessions (MVP: replace all sessions for that week)

4) UI hooks:
   - Button "Generar semana" calls LLM plan generation
   - Workouts screen shows planned_sessions
   - Calendar shows planned_sessions markers (blue)

5) QA:
   - Generate week -> sessions appear
   - structure_json validates and can be exported to Wahoo
   - Chat persists

Exit criteria:
- Gate C (LLM) PASS
- Gate D (UI) PASS
- Gate E (QA) PASS