# LetiSmartCoach - Supabase Schema Specification

This document outlines the final database model, security policies, and automation triggers for Phase 2.5+.

## Entity Relationship Model

### Identity & Basics (`public.profiles`)
- **Purpose**: Identity and mandatory health basics.
- **Fields**:
  - `id` (UUID, PK -> auth.users): Primary identifier.
  - `full_name` (Text): Athlete's displayed name.
  - `email` (Text): Account email (sync from auth).
  - `gender` (Text): Normalized (M/F/NB/PND).
  - `age`, `height_cm`, `weight_kg`: Mandatory for AI calculations.

### Performance & Settings (`public.athlete_profile`)
- **Purpose**: Specialized sports data and application settings.
- **Fields**:
  - `user_id` (UUID, PK -> auth.users): Links to identity.
  - `sport_focus` (Text): `cycling`, `trail`, or `both`.
  - `ftp_w` (Int): Cycling Functional Threshold Power.
  - `vo2max` (Float): Estimated aerobic capacity.
  - `thresholds_json`, `zones_power_json`, `zones_hr_json`: Detailed training zones.
  - `settings` (JSONB): Flexible catch-all for motivation, stress, availability, etc.

## Security (RLS)
- **Status**: **ENABLED** on all tables.
- **Policy**: `Owner Only`.
- **Logic**: 
  - For `profiles`: `auth.uid() = id`.
  - For others: `auth.uid() = user_id`.
- **Enforced Tables**: `profiles`, `athlete_profile`, `calendar_events`, `planned_sessions`, `training_plans`, `workouts`, `best_efforts`, `coach_messages`, `user_feedback`, `wahoo_tokens`.

## Automation Triggers
- **Signup Flow**: A Postgres function `handle_new_user()` is triggered on `auth.users` insertion.
  - Creates a row in `profiles` with metadata.
  - Creates an empty row in `athlete_profile` ready for configuration.
- **Timestamp Tracking**: `update_updated_at_column()` automatically updates the `updated_at` field on every record modification.

## Performance
Indices are implemented on `user_id` and time/date columns for:
- `planned_sessions`
- `calendar_events`
- `workouts`
- `coach_messages`
- `best_efforts`
