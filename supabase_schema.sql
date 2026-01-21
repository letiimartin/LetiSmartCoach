-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: athlete_profile
create table if not exists public.athlete_profile (
    user_id uuid references auth.users not null primary key,
    age int,
    height_cm float,
    weight_kg float,
    sport_focus text check (sport_focus in ('cycling', 'trail_running', 'both')),
    ftp_w int,
    vo2max float,
    thresholds_json jsonb default '{}'::jsonb,
    zones_power_json jsonb default '{}'::jsonb,
    zones_hr_json jsonb default '{}'::jsonb,
    settings jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: calendar_events
create table if not exists public.calendar_events (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    type text not null check (type in ('race', 'social', 'health', 'personal')),
    title text not null,
    start_dt timestamp with time zone not null,
    end_dt timestamp with time zone,
    details_json jsonb default '{}'::jsonb,
    priority text check (priority in ('A', 'B', 'C')),
    constraints_json jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: wahoo_tokens
create table if not exists public.wahoo_tokens (
    user_id uuid references auth.users not null primary key,
    access_token_enc text not null,
    refresh_token_enc text not null,
    expires_at timestamp with time zone not null,
    scope text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: workouts
create table if not exists public.workouts (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    provider text default 'wahoo',
    provider_activity_id text not null,
    sport text,
    start_dt timestamp with time zone not null,
    duration_s int,
    distance_m float,
    elevation_m float,
    avg_hr float,
    avg_power float,
    file_ref text,
    metrics_json jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, provider, provider_activity_id)
);

-- Table: best_efforts
create table if not exists public.best_efforts (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    sport text not null,
    window text not null, -- e.g., '5s', '1m', '20m', '1km'
    value float not null,
    unit text not null,
    recorded_at timestamp with time zone not null,
    workout_id uuid references public.workouts(id) on delete cascade
);

-- Table: training_plans
create table if not exists public.training_plans (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    week_start date not null,
    week_end date not null,
    goal_event_id uuid references public.calendar_events(id),
    status text default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
    plan_json jsonb not null,
    rationale text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: planned_sessions
create table if not exists public.planned_sessions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    plan_id uuid references public.training_plans(id) on delete cascade,
    date date not null,
    sport text not null,
    structure_json jsonb not null,
    targets_json jsonb default '{}'::jsonb,
    duration_s int,
    export_status text default 'pending',
    export_refs jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: coach_messages
create table if not exists public.coach_messages (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    role text not null check (role in ('athlete', 'coach', 'system')),
    content text not null,
    metadata_json jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: user_feedback
create table if not exists public.user_feedback (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    date date not null,
    rpe int check (rpe between 1 and 10),
    fatigue int check (fatigue between 1 and 5),
    sleep_hours float,
    soreness int check (soreness between 1 and 5),
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, date)
);

-- Set up Row Level Security (RLS)
alter table public.athlete_profile enable row level security;
alter table public.calendar_events enable row level security;
alter table public.wahoo_tokens enable row level security;
alter table public.workouts enable row level security;
alter table public.best_efforts enable row level security;
alter table public.training_plans enable row level security;
alter table public.planned_sessions enable row level security;
alter table public.coach_messages enable row level security;
alter table public.user_feedback enable row level security;

-- Policies
create policy "Users can only access their own profile" on public.athlete_profile for all using (auth.uid() = user_id);
create policy "Users can only access their own events" on public.calendar_events for all using (auth.uid() = user_id);
create policy "Users can only access their own tokens" on public.wahoo_tokens for all using (auth.uid() = user_id);
create policy "Users can only access their own workouts" on public.workouts for all using (auth.uid() = user_id);
create policy "Users can only access their own efforts" on public.best_efforts for all using (auth.uid() = user_id);
create policy "Users can only access their own plans" on public.training_plans for all using (auth.uid() = user_id);
create policy "Users can only access their own sessions" on public.planned_sessions for all using (auth.uid() = user_id);
create policy "Users can only access their own messages" on public.coach_messages for all using (auth.uid() = user_id);
create policy "Users can only access their own feedback" on public.user_feedback for all using (auth.uid() = user_id);
