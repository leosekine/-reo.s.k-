-- ============================================
-- シフト承認ワークフロー: admin/member RLS拡張
-- Supabase SQL Editor にコピペして実行
-- ============================================

-- 1. is_admin() ヘルパー関数（SECURITY DEFINER でRLS再帰回避）
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2. profiles: 管理者は全プロフィール閲覧可
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- 3. shifts: 既存の更新ポリシーを「pending のみ」に置き換え
--    一度承認/却下されたら本人も編集できない
drop policy if exists "Users can update own shifts" on public.shifts;
create policy "Users can update own pending shifts"
  on public.shifts for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own shifts" on public.shifts;
create policy "Users can delete own pending shifts"
  on public.shifts for delete
  using (auth.uid() = user_id and status = 'pending');

-- 4. shifts: 管理者は全員のシフトを閲覧可
drop policy if exists "Admins can read all shifts" on public.shifts;
create policy "Admins can read all shifts"
  on public.shifts for select
  using (public.is_admin());

-- 5. shifts: 管理者は pending のシフトのみ承認/却下可（再変更ロック）
drop policy if exists "Admins can update pending shifts" on public.shifts;
create policy "Admins can update pending shifts"
  on public.shifts for update
  using (public.is_admin() and status = 'pending')
  with check (public.is_admin());

-- 6. attendances/daily_reports: 管理者は全員閲覧可（ダッシュボード用）
drop policy if exists "Admins can read all attendances" on public.attendances;
create policy "Admins can read all attendances"
  on public.attendances for select
  using (public.is_admin());

drop policy if exists "Admins can read all reports" on public.daily_reports;
create policy "Admins can read all reports"
  on public.daily_reports for select
  using (public.is_admin());
