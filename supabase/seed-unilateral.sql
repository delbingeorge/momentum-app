-- Mark unilateral (single-arm / single-leg) exercises so session volume counts
-- both sides — one logged set = the work repeated on each limb. See buildSession.
alter table public.exercises add column if not exists is_unilateral boolean not null default false;

update public.exercises set is_unilateral = true where id in (
  'bulgarian-split-squat',
  'concentration-curl',
  'cossack-squat',
  'dumbbell-lunge',
  'dumbbell-side-bend',
  'dumbbell-step-up',
  'landmine-row',
  'meadows-row',
  'pistol-squat',
  'reverse-lunge',
  'single-arm-cable-lateral-raise',
  'single-arm-cable-row',
  'single-arm-pushdown',
  'single-leg-calf-raise',
  'single-leg-hip-thrust',
  'tricep-kickback',
  'walking-lunges'
);
