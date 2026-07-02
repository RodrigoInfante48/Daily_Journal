-- Tabla de entradas del diario
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  gratitud_1 text,
  gratitud_2 text,
  gratitud_3 text,
  intencion text,
  estado text,
  libre text
);

create index if not exists journal_entries_user_id_idx
  on public.journal_entries (user_id);

-- Row Level Security
alter table public.journal_entries enable row level security;

-- Elimina políticas previas con el mismo nombre, por si se re-ejecuta el script
drop policy if exists "journal_entries_select_own" on public.journal_entries;
drop policy if exists "journal_entries_insert_own" on public.journal_entries;
drop policy if exists "journal_entries_update_own" on public.journal_entries;
drop policy if exists "journal_entries_delete_own" on public.journal_entries;

-- SELECT: solo puede leer sus propias filas
create policy "journal_entries_select_own"
  on public.journal_entries
  for select
  to authenticated
  using (auth.uid() = user_id);

-- INSERT: solo puede crear filas con su propio user_id
create policy "journal_entries_insert_own"
  on public.journal_entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- UPDATE: solo puede modificar sus propias filas, y no puede reasignarlas a otro usuario
create policy "journal_entries_update_own"
  on public.journal_entries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: solo puede borrar sus propias filas
create policy "journal_entries_delete_own"
  on public.journal_entries
  for delete
  to authenticated
  using (auth.uid() = user_id);
