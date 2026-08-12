-- Run AFTER deploying the Edge Function:
--   supabase functions deploy cleanup-expired-shares --project-ref nulzffzwdnyspzcdtyts
--
-- Schedules it every minute. Net effect: a share's images/row live at most
-- ~5-6 minutes after upload (5 min TTL + up to 1 min until the next tick).
-- The bearer token below is the publishable/anon key (safe to embed —
-- it's the same value already shipped in the client bundle); the function
-- itself elevates internally using its own service_role secret.

select cron.schedule(
  'cleanup-expired-shares',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://nulzffzwdnyspzcdtyts.supabase.co/functions/v1/cleanup-expired-shares',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_Cs0vT4Ik-i6E61-4YqvrIA_nf5P3_In'
    )
  );
  $$
);
