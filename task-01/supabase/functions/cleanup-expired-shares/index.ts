// Scheduled every minute via pg_cron (see
// supabase/migrations/0002_schedule_cleanup.sql). Deletes any `shares` row
// — and its two storage objects — older than 5 minutes.
//
// Uses the service_role key (an auto-provided secret in every Edge
// Function's environment, never shipped to the client) because deleting
// storage objects has to go through the Storage API: a raw SQL delete on
// storage.objects would remove only the metadata row and leave the actual
// file orphaned in the backing store.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const BUCKET = 'shares';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const cutoff = new Date(Date.now() - FIVE_MINUTES_MS).toISOString();

  const { data: expired, error: selectError } = await supabase
    .from('shares')
    .select('id, front_path, back_path')
    .lt('created_at', cutoff);

  if (selectError) {
    return new Response(JSON.stringify({ error: selectError.message }), { status: 500 });
  }
  if (!expired?.length) {
    return new Response(JSON.stringify({ cleaned: 0 }), { status: 200 });
  }

  const paths = expired.flatMap((row) => [row.front_path, row.back_path]);
  const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths);
  if (removeError) {
    return new Response(JSON.stringify({ error: removeError.message }), { status: 500 });
  }

  const { error: deleteError } = await supabase
    .from('shares')
    .delete()
    .in(
      'id',
      expired.map((row) => row.id)
    );
  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ cleaned: expired.length }), { status: 200 });
});
