-- Run once for initial setup in Supabase > SQL Editor.
-- For existing projects, apply new schema sections separately as documented.
create table episode_views(episode int primary key, views bigint not null default 0);
alter table episode_views enable row level security;
create policy "public read" on episode_views for select using (true);
create function increment_view(ep int) returns bigint language sql security definer as $$
  insert into episode_views(episode,views) values (ep,1)
  on conflict (episode) do update set views = episode_views.views + 1 returning views $$;
revoke all on function increment_view(int) from public; grant execute on function increment_view(int) to anon;

create table feedback(id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  body text not null check (char_length(body) between 3 and 600),
  approved boolean not null default true, created_at timestamptz not null default now());
alter table feedback enable row level security;
create policy "read approved" on feedback for select using (approved);
create policy "anyone can post" on feedback for insert with check (approved);
-- Moderate: Table Editor > feedback > untick "approved" or delete the row.
