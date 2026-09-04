-- profiles: 1:1 with Supabase auth.users, app-specific goal settings
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  daily_calorie_goal int not null default 2000,
  daily_protein_goal_g int not null default 100,
  daily_carbs_goal_g int not null default 250,
  daily_fat_goal_g int not null default 65,
  created_at timestamptz not null default now()
);

-- scan_history: every AI analysis call, meal or fridge, whether or not the
-- user later saved/acted on it. raw_ai_result is the unedited AI output.
create table scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_type text not null check (scan_type in ('meal', 'fridge')),
  photo_path text not null,
  raw_ai_result jsonb not null,
  ai_provider text not null,
  created_at timestamptz not null default now()
);
create index scan_history_user_created_idx on scan_history (user_id, created_at desc);

-- meal_logs: one row per confirmed/saved meal. food_items is the
-- user-edited/confirmed version (may differ from scan_history.raw_ai_result).
create table meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_path text not null,
  food_items jsonb not null,
  total_calories numeric not null,
  total_protein_g numeric not null,
  total_carbs_g numeric not null,
  total_fat_g numeric not null,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  scan_history_id uuid references scan_history(id)
);
create index meal_logs_user_logged_idx on meal_logs (user_id, logged_at desc);

-- favorite_recipes: recipe jsonb frozen at favorite-time (generated recipes
-- are otherwise ephemeral, living only in scan_history.raw_ai_result).
create table favorite_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_scan_id uuid references scan_history(id),
  recipe jsonb not null,
  title text not null,
  created_at timestamptz not null default now()
);
create index favorite_recipes_user_created_idx on favorite_recipes (user_id, created_at desc);

-- Row-Level Security: per-user isolation, second line of defense behind
-- the backend's own explicit userId filtering (backend uses service_role,
-- which bypasses RLS, so this matters chiefly if a client ever queries
-- Supabase directly in a future offline-cache feature).
alter table profiles enable row level security;
alter table scan_history enable row level security;
alter table meal_logs enable row level security;
alter table favorite_recipes enable row level security;

create policy "select own profile" on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "select own scan_history" on scan_history for select using (auth.uid() = user_id);
create policy "insert own scan_history" on scan_history for insert with check (auth.uid() = user_id);

create policy "select own meal_logs" on meal_logs for select using (auth.uid() = user_id);
create policy "insert own meal_logs" on meal_logs for insert with check (auth.uid() = user_id);
create policy "update own meal_logs" on meal_logs for update using (auth.uid() = user_id);
create policy "delete own meal_logs" on meal_logs for delete using (auth.uid() = user_id);

create policy "select own favorite_recipes" on favorite_recipes for select using (auth.uid() = user_id);
create policy "insert own favorite_recipes" on favorite_recipes for insert with check (auth.uid() = user_id);
create policy "delete own favorite_recipes" on favorite_recipes for delete using (auth.uid() = user_id);

-- Storage bucket for meal/fridge photos, path-prefixed by user id.
insert into storage.buckets (id, name, public) values ('meal-photos', 'meal-photos', false);

create policy "select own photos" on storage.objects for select
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "insert own photos" on storage.objects for insert
  with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
