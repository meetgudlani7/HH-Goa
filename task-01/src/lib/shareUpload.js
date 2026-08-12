import { supabase } from './supabaseClient';

const BUCKET = 'shares';

/**
 * Uploads front/back card blobs to Supabase Storage as a short-lived backup
 * so a desktop user can pick up the native multi-image X share on their
 * phone instead of manually attaching downloaded files. Objects and their
 * `shares` row are deleted a few minutes later by a scheduled cleanup job —
 * this is never meant to be permanent storage.
 */
export async function uploadShareImages(frontBlob, backBlob) {
  // This UUID only names the storage folder — it is NOT the `shares` row's
  // own primary key, which is a DB-assigned bigint. Keeping them separate
  // means we never have to read the row back (or know its bigint id) to
  // build the public URLs below or the /share/:id link.
  const folderId = crypto.randomUUID();
  const frontPath = `${folderId}/front.png`;
  const backPath = `${folderId}/back.png`;

  const [frontResult, backResult] = await Promise.all([
    supabase.storage
      .from(BUCKET)
      .upload(frontPath, frontBlob, { contentType: 'image/png', upsert: false }),
    supabase.storage
      .from(BUCKET)
      .upload(backPath, backBlob, { contentType: 'image/png', upsert: false }),
  ]);
  if (frontResult.error) throw frontResult.error;
  if (backResult.error) throw backResult.error;

  const { error: insertError } = await supabase
    .from('shares')
    .insert({ front_path: frontPath, back_path: backPath });
  if (insertError) throw insertError;

  return { id: folderId };
}

export function getShareImageUrls(id) {
  const {
    data: { publicUrl: frontUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(`${id}/front.png`);
  const {
    data: { publicUrl: backUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(`${id}/back.png`);
  return { frontUrl, backUrl };
}
