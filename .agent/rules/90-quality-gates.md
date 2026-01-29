---
trigger: always_on
---

## Gate A - DB
- Migration created and documented.
- RLS verified with 2 users (no cross-user access).
- Indices reviewed for range queries.

## Gate B - Wahoo
- Import incremental works (dedupe).
- Export works for at least 1 cycling planned_session.
- export_status transitions: pending -> exporting -> exported OR failed (+ error).

## Gate C - LLM
- Generates weekly plan and writes training_plans + planned_sessions.
- structure_json is exportable and validated.

## Gate D - UI
- Calendar persists.
- Workouts screen shows planned sessions.
- Session detail allows "Enviar a Wahoo" with status + retry.

## Gate E - QA
- Checklist PASS/FAIL with reproducible steps and evidence.

## Evidence required (obligatorio por Gate)

### Gate A - DB
Evidencia:
- Screenshot/exports de políticas RLS por tabla (USING + WITH CHECK donde aplique).
- Prueba 2 usuarios: queries que demuestren "no cross-user access".
- Migración en `supabase/migrations/` + nota de verificación (`supabase/notes/` o dentro del PR).

### Gate B - Wahoo
Evidencia:
- Import: prueba dedupe (mismo provider_activity_id no duplica).
- Export: 1 planned_session exportada con `export_refs` poblado.
- Transiciones `export_status`: logs o registros mostrando pending→exporting→exported/failed.
- Retry: al menos 1 caso fallido con `error` y posterior reintento.

### Gate C - LLM
Evidencia:
- Ejemplo real de `training_plans.plan_json` + n `planned_sessions.structure_json`.
- Validación: script o check que confirme que `structure_json` cumple contrato (campos mínimos).

### Gate D - UI
Evidencia:
- Screenshots o vídeo corto: Calendar (Semana/Mes) + Workouts + Detail.
- Se ve estado de export + retry.
- Se ve diferencia plan vs real.

### Gate E - QA
Evidencia:
- Checklists PASS/FAIL actualizadas en `qa/` con pasos reproducibles y links a evidencias (capturas/logs).
- Bloqueo de merge si Gate FAIL.


## Operating Model (How we use agents)

- The PM-Orchestrator produces "Task Packets" only (no code changes).
- Implementation happens in small batches:
  1) DB migration (if needed)
  2) Service layer
  3) UI wiring
  4) QA checklist PASS/FAIL with evidence
- Only one phase at a time (Phase 3 → Phase 4 → Phase 5).
- Each agent must return:
  - Files changed
  - How to test (steps)
  - Evidence to capture (screenshots/logs)
- If a task touches DB migrations: DO NOT apply without user confirmation.
- If a phase fails QA: stop and fix before starting the next phase.
