-- Clear all data from Momentum tables. Keeps schema, RLS, policies.
-- Run in Supabase SQL editor (or psql). Does NOT touch auth.users.
truncate table
  public.profiles,
  public.workout_sessions,
  public.exercise_history,
  public.bodyweight_logs
restart identity cascade;
