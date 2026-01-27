---
trigger: always_on
---

# LetiSmartCoach - Project Rules

## Product (MVP)
- Mobile app (Expo / React Native). Mobile-first. No web-first.
- Backend: Supabase (RLS owner-only).
- MVP MUST include: Calendar persistente + Wahoo (IMPORT + EXPORT) + LLM (plan semanal + chat).
- Post-MVP: Nutrición, Suunto (métricas diarias), báscula inteligente.

## Data model principles
- Supabase tables must be accessed with strict RLS (USING + WITH CHECK).
- Plan vs Real:
  - planned_sessions = entrenos planificados (LLM)
  - workouts = entrenos reales importados (Wahoo)
- Export pipeline:
  - planned_sessions.export_status drives the export state machine.
  - export_refs stores provider-specific references.

## Work method
- Work in small PRs on feature branches.
- No scope creep: if it’s not in current workflow, don’t implement it.
- Every PR includes: summary, test steps, and evidence (screenshots/logs).

## MVP Definition of Done (DoD)
El MVP se considera "DONE" solo si:

1) Auth & Perfil
- Usuario puede registrarse/login.
- Perfil editable persiste en Supabase (RLS owner-only).
- `profiles` = identidad/UI (nombre/email display si aplica).
- `athlete_profile` = métricas/umbrales/zonas/settings deportivas.

2) Calendario persistente
- CRUD de eventos en Supabase (`calendar_events`) desde la app.
- Vista Semana y Mes usan datos reales (no mocks).
- Se muestran entrenos planificados (`planned_sessions`) dentro del calendario.

3) LLM (Plan semanal + chat)
- LLM genera plan semanal y escribe:
  - `training_plans` (1 registro por semana)
  - `planned_sessions` (n sesiones)
- LLM chat escribe en `coach_messages`.
- `planned_sessions.structure_json` es machine-friendly y exportable.

4) Wahoo (IMPORT + EXPORT)
- IMPORT: sync incremental desde Wahoo a `workouts` con dedupe (unique por user_id+provider+provider_activity_id).
- EXPORT: se puede exportar mínimo 1 `planned_sessions` a Wahoo.
- `export_status` funciona como state machine:
  pending → exporting → exported OR failed (con error guardado)

5) UI (Plan vs Real)
- Workouts/Calendario muestran: planificado vs real.
- Detalle de sesión permite "Enviar a Wahoo" y muestra estado + retry.
- Si Wahoo importa una actividad, se refleja como completada (sin marcar manual como fuente de verdad).

6) QA Gate PASS
- Checklists PASS/FAIL completadas con pasos reproducibles y evidencias.

## Non-goals (para evitar scope creep)
- No nutrición.
- No Suunto / báscula inteligente.
- No analytics avanzadas tipo TrainingPeaks (charts, PMC, etc.).
- No sistema avanzado de “calidad de ejecución” (queda post-MVP).