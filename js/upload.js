// ============================================
// upload.js — Supabase Storage upload helper
// All image uploads go through here → Supabase Storage → media table
// ============================================

// Per-folder resize settings.
// gallery + media = no resize (upload original for full quality).
// Other folders resize only if image exceeds max dimension.
var _folderResizeConfig = {
  gallery:  null,                              // skip — upload original
  media:    null,                              // skip — upload original
  hero:     { maxW: 2400, maxH: 2400, q: 0.95 },
  boat:     { maxW: 2400, maxH: 2400, q: 0.95 },
  dock:     { maxW: 2400, maxH: 2400, q: 0.95 },
  addon:    { maxW: 2400, maxH: 2400, q: 0.95 },
  steps:    { maxW: 2400, maxH: 2400, q: 0.95 },
  step:     { maxW: 2400, maxH: 2400, q: 0.95 },
  feature:  { maxW: 2000, maxH: 2000, q: 0.95 },
  location: { maxW: 2400, maxH: 2400, q: 0.95 },
  about:    { maxW: 2400, maxH: 2400, q: 0.95 },
  logo:      { maxW: 400,  maxH: 400,  q: 0.95 },
  customers: { maxW: 400,  maxH: 400,  q: 0.92 }
};
var _defaultResizeConfig = { maxW: 2400, maxH: 2400, q: 0.95 };

function resizeImageFile(file, folder) {
  // Skip non-images or GIFs (preserve animation)
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return Promise.resolve(file);
  }
  // gallery and media: upload original — no canvas processing
  var cfg = _folderResizeConfig.hasOwnProperty(folder) ? _folderResizeConfig[folder] : _defaultResizeConfig;
  if (!cfg) return Promise.resolve(file);

  var maxW = cfg.maxW, maxH = cfg.maxH, quality = cfg.q;
  return new Promise(function(resolve) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var w = img.naturalWidth;
        var h = img.naturalHeight;
        // Only scale down if image exceeds max dimension
        if (w <= maxW && h <= maxH) { resolve(file); return; }
        var scale = Math.min(maxW / w, maxH / h);
        var canvas = document.createElement('canvas');
        canvas.width  = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        var outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(function(blob) {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name, { type: outType, lastModified: Date.now() }));
        }, outType, quality);
      };
      img.onerror = function() { resolve(file); };
      img.src = e.target.result;
    };
    reader.onerror = function() { resolve(file); };
    reader.readAsDataURL(file);
  });
}

async function uploadToSupabase(file, folder) {
  // Block HEIC/HEIF — Chrome can't display them and Safari canvas produces black images
  if (file.type === 'image/heic' || file.type === 'image/heif' ||
      /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name)) {
    toast('HEIC photos not supported. On iPhone: Settings → Camera → Formats → Most Compatible to shoot in JPEG.', 'error');
    return null;
  }

  // Resize before upload (gallery/media skip resize entirely — original quality)
  file = await resizeImageFile(file, folder);
  if (!file) return null;

  // Files flow through gcr-api-clean — the browser never writes to storage
  // directly. The server scopes the path/row to the caller's site.
  var fd = new FormData();
  fd.append('file', file, file.name);
  fd.append('folder', folder || 'general');
  try {
    var res = await fetch(_uploadApiBase() + '/api/dashboard/media/upload', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + _uploadToken() },
      body: fd
    });
    var out = null;
    try { out = await res.json(); } catch (e) {}
    if (!res.ok || !out || out.error) {
      console.error('Upload error:', out && out.error);
      toast('Upload failed: ' + ((out && out.error) || ('HTTP ' + res.status)), 'error');
      return null;
    }
    return out.url;
  } catch (e) {
    console.error('Upload error:', e);
    toast('Upload failed: ' + e.message, 'error');
    return null;
  }
}

function _uploadApiBase() {
  return window.CC_API_BASE || 'https://gcr-api-clean.vercel.app';
}
function _uploadToken() {
  return localStorage.getItem('cc_token') || sessionStorage.getItem('cc_token') || '';
}

async function deleteFromSupabase(mediaId, storagePath) {
  try {
    var res = await fetch(_uploadApiBase() + '/api/dashboard/media/file', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _uploadToken() },
      body: JSON.stringify({ media_id: mediaId || null, storage_path: storagePath || null })
    });
    return res.ok;
  } catch (e) {
    console.warn('Media delete failed:', e);
    return false;
  }
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
