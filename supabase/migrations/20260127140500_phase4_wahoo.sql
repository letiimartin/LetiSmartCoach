-- Enable moddatetime extension if not already enabled
create extension if not exists moddatetime schema extensions;

-- 1. WAHOO TOKENS
create table public.wahoo_tokens (
    user_id uuid not null references auth.users(id) on delete cascade,
    access_token text not null,
    refresh_token text not null,
    expires_at timestamptz not null,
    scope text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    primary key (user_id)
);

alter table public.wahoo_tokens enable row level security;

create policy "Users can only access their own tokens"
    on public.wahoo_tokens
    for all
    using (auth.uid() = user_id);

create trigger handle_updated_at before update on public.wahoo_tokens
    for each row execute procedure moddatetime (updated_at);

-- 2. WORKOUTS (Real / Completed)
create table public.workouts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    external_id text not null, -- Unique ID from provider (e.g. Wahoo ID)
    provider text not null check (provider in ('wahoo', 'manual')),
    sport text not null check (sport in ('ciclismo', 'running', 'fuerza', 'otro')),
    title text,
    start_dt timestamptz not null,
    duration_s integer, -- Duration in seconds
    summary_json jsonb default '{}'::jsonb, -- Store distance, avg_hr, normalized_power, etc.
    created_at timestamptz default now(),
    
    unique(user_id, provider, external_id) -- Deduplication constraint
);

alter table public.workouts enable row level security;

create policy "Users can CRUD their own workouts"
    on public.workouts
    for all
    using (auth.uid() = user_id);

-- 3. PLANNED SESSIONS (The Plan)
create table public.planned_sessions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    date date not null,
    sport text not null check (sport in ('ciclismo', 'running', 'fuerza', 'otro')),
    title text not null,
    description text,
    
    -- Structured data for export (Intervals, Targets)
    structure_json jsonb default '{}'::jsonb, 
    
    -- Export Status State Machine
    export_status text not null default 'pending' check (export_status in ('pending', 'exporting', 'exported', 'failed')),
    exported_at timestamptz,
    export_last_error text,
    export_refs jsonb default '{}'::jsonb, -- Store external IDs of exported files (e.g. { wahoo_id: "123" })

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.planned_sessions enable row level security;

create policy "Users can CRUD their own planned sessions"
    on public.planned_sessions
    for all
    using (auth.uid() = user_id);

create trigger handle_updated_at before update on public.planned_sessions
    for each row execute procedure moddatetime (updated_at);

-- Indexes for performance
create index idx_workouts_user_date on public.workouts(user_id, start_dt);
create index idx_planned_user_date on public.planned_sessions(user_id, date);
