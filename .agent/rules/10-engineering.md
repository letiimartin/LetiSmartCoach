---
trigger: always_on
---

## Branching
- Use branches: mvp/<area> (db, wahoo, llm, ui, qa)
- Avoid mixing unrelated changes.

## Supabase
- All schema changes via migrations in supabase/migrations/.
- RLS policies must include:
  - SELECT: USING
  - INSERT: WITH CHECK
  - UPDATE: USING + WITH CHECK
  - DELETE: USING

## JSON shapes
- LLM output must be machine-friendly (no ambiguous text):
  - planned_sessions.structure_json must include steps with quantified targets.

## Logging
- Wahoo sync/export must log: user_id, action, status, provider ids.

## Single Source of Truth (DB)
- `profiles`: datos de identidad/UI (display name, email si aplica, etc.)
- `athlete_profile`: métricas deportivas, umbrales, zonas y settings (jsonb)

## Ownership boundaries (No-scope por rol)
- DB Engineer: SOLO schema/migrations/RLS/index/constraints. No UI. No conectores.
- Wahoo Connector: SOLO OAuth/refresh, import/export, sync/dedupe, logs. No UI salvo wiring mínimo (services).
- LLM Coach Engineer: SOLO generación de plan + chat persistente. No UI (salvo endpoints/helpers).
- Mobile UI Engineer: SOLO screens/components/services en app. No tocar schema salvo coordinar con DB.
- QA/Release: SOLO checklists + evidencias + gates. No implementa features.

## Logging & Observability (mínimo obligatorio)
Toda operación Wahoo import/export debe dejar trazabilidad:
- timestamp, user_id, op(import/export), entity(planned_session/workout), provider_id, status, error(optional)

## LLM Output Contract (hard requirement)
El output del plan semanal debe ser machine-friendly:
- Nada de texto ambiguo en pasos
- `structure_json.steps[]` con targets cuantificados (duración_s, zone, %FTP o HR range, repeticiones)
- `targets_json` con totales y metadata (duración total, objetivo, zonas principales)
