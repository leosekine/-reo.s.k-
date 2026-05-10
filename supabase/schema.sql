-- ============================================
-- 勤怠管理アプリ: 5テーブル作成 + RLS設定
-- Supabase SQL Editorにコピペして実行
-- ============================================

-- 1. profiles テーブル
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '',
  role text not null default 'member' check (role in ('admin', 'member')),
  department text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 新規ユーザー登録時に自動でprofileを作成するトリガー
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. attendances テーブル
create table if not exists public.attendances (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  clock_in timestamptz,
  clock_out timestamptz,
  break_minutes int not null default 60,
  type text not null default 'normal' check (type in ('normal', 'late', 'early_leave', 'paid_leave')),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.attendances enable row level security;

create policy "Users can read own attendances"
  on public.attendances for select
  using (auth.uid() = user_id);

create policy "Users can insert own attendances"
  on public.attendances for insert
  with check (auth.uid() = user_id);

create policy "Users can update own attendances"
  on public.attendances for update
  using (auth.uid() = user_id);

create policy "Users can delete own attendances"
  on public.attendances for delete
  using (auth.uid() = user_id);

-- 3. shifts テーブル
create table if not exists public.shifts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  shift_type text not null default 'normal' check (shift_type in ('normal', 'early', 'late', 'night', 'holiday')),
  start_time time not null,
  end_time time not null,
  reason text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approver text,
  comment text,
  created_at timestamptz not null default now()
);

alter table public.shifts enable row level security;

create policy "Users can read own shifts"
  on public.shifts for select
  using (auth.uid() = user_id);

create policy "Users can insert own shifts"
  on public.shifts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own shifts"
  on public.shifts for update
  using (auth.uid() = user_id);

create policy "Users can delete own shifts"
  on public.shifts for delete
  using (auth.uid() = user_id);

-- 4. daily_reports テーブル
create table if not exists public.daily_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.daily_reports enable row level security;

create policy "Users can read own reports"
  on public.daily_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own reports"
  on public.daily_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reports"
  on public.daily_reports for update
  using (auth.uid() = user_id);

create policy "Users can delete own reports"
  on public.daily_reports for delete
  using (auth.uid() = user_id);

-- 5. action_logs テーブル
create table if not exists public.action_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  action text not null,
  target_type text not null,
  target_id uuid,
  detail jsonb,
  created_at timestamptz not null default now()
);

alter table public.action_logs enable row level security;

create policy "Users can read own logs"
  on public.action_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on public.action_logs for insert
  with check (auth.uid() = user_id);
