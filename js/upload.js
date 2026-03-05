// ============================================
// upload.js — Supabase Storage upload helper
// All image uploads go through here → Supabase Storage → media table
// ============================================

async function uploadToSupabase(file, folder) {
  if (!supabase || !file) return null;
  var siteId = getSiteId();
  if (!siteId) { await getSupabaseBusiness(); siteId = getSiteId(); }
  if (!siteId) { toast('Not logged in', 'error'); return null; }

  // Build path: {site_id}/{folder}/{timestamp}-{filename}
  var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  var path = siteId + '/' + (folder || 'general') + '/' + Date.now() + '-' + safeName;

  var { data, error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) {
    console.error('Upload error:', error);
    toast('Upload failed: ' + error.message, 'error');
    return null;
  }

  // Get public URL
  var { data: urlData } = supabase.storage.from('media').getPublicUrl(data.path);
  var publicUrl = urlData.publicUrl;

  // Record in media table
  await supabase.from('media').insert({
    site_id: siteId,
    url: publicUrl,
    filename: file.name,
    file_type: file.type.startsWith('image/') ? 'image' : file.type.split('/')[0],
    file_size: file.size,
    folder: folder || 'general',
    title: file.name
  });

  return publicUrl;
}

async function deleteFromSupabase(mediaId, storagePath) {
  if (!supabase) return false;
  var siteId = getSiteId();
  if (!siteId) return false;

  // Delete from storage if path provided
  if (storagePath) {
    await supabase.storage.from('media').remove([storagePath]);
  }

  // Delete from media table
  if (mediaId) {
    await supabase.from('media').delete().eq('id', mediaId).eq('site_id', siteId);
  }

  return true;
}

// Upload multiple files, returns array of public URLs
async function uploadMultipleToSupabase(files, folder) {
  var urls = [];
  for (var i = 0; i < files.length; i++) {
    var url = await uploadToSupabase(files[i], folder);
    if (url) urls.push(url);
  }
  return urls;
}
