-- Admin role: coarse, read-only cross-user access for internal
-- support/testing tooling. Deliberately narrow — no write access, and no
-- admin UI in this app, just the role column, RLS, and the two
-- requireAdmin-gated routes in backend/src/routes/admin.ts.
alter table profiles
  add column role text not null default 'user' check (role in ('user', 'admin'));

-- security definer so this can be referenced from an RLS policy on
-- `profiles` itself without the subquery recursing back through that same
-- policy (a plain `exists (select 1 from profiles where ...)` inline in
-- the policy would do exactly that).
create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = uid and role = 'admin'
  );
$$;

-- Admin read policies. The backend uses the service_role key (bypasses
-- RLS) for its own admin routes — see requireAdmin.ts — so these matter
-- only if a client ever queries Supabase directly, same rationale as the
-- per-user policies in 0001_init.sql.
create policy "admin can select all profiles" on profiles
  for select using (is_admin(auth.uid()));

create policy "admin can select all scan_history" on scan_history
  for select using (is_admin(auth.uid()));

create policy "admin can select all meal_logs" on meal_logs
  for select using (is_admin(auth.uid()));

create policy "admin can select all favorite_recipes" on favorite_recipes
  for select using (is_admin(auth.uid()));
