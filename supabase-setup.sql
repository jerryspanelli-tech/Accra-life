-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Before running: Authentication -> Providers -> enable "Anonymous sign-ins".

create table if not exists players (
  id uuid primary key,                                   -- equals the signed-in user id
  name text not null default 'Citizen',
  cash bigint not null default 200 check (cash >= 0),
  savings bigint not null default 0 check (savings >= 0),
  created_at timestamptz default now()
);

create table if not exists transactions (
  id text primary key,                                   -- unique id made by the game: duplicates are refused
  player_id uuid references players(id),
  amount bigint not null,
  reason text,
  created_at timestamptz default now()
);

alter table players enable row level security;
alter table transactions enable row level security;

-- a player can read only their own row; nobody can change rows directly
drop policy if exists "read own player" on players;
create policy "read own player" on players for select using (auth.uid() = id);

-- create the player row the first time (only for the signed-in user)
create or replace function create_player(p_name text)
returns json language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); p players;
begin
  if uid is null then raise exception 'not signed in'; end if;
  insert into players(id, name) values (uid, left(coalesce(nullif(p_name,''), 'Citizen'), 16))
    on conflict (id) do nothing;
  select * into p from players where id = uid;
  return json_build_object('name', p.name, 'cash', p.cash, 'savings', p.savings);
end $$;

-- the only way money changes: checked, and refused if the id was used before or cash would go below 0
create or replace function apply_transaction(p_tx text, p_amount bigint, p_reason text)
returns json language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); newcash bigint;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if exists (select 1 from transactions where id = p_tx) then
    return json_build_object('ok', false, 'reason', 'duplicate');
  end if;
  update players set cash = cash + p_amount
    where id = uid and cash + p_amount >= 0
    returning cash into newcash;
  if newcash is null then
    return json_build_object('ok', false, 'reason', 'not enough cash');
  end if;
  insert into transactions(id, player_id, amount, reason) values (p_tx, uid, p_amount, p_reason);
  return json_build_object('ok', true, 'cash', newcash);
end $$;
