/* ============================================================
   CYBERCHECK APP REGISTRY — LOADER
   ============================================================
   There is NO catalog in this file. Every app is a fully
   standalone manifest file in /apps/ — its own file, its own
   data table (dataKey), its own place. This loader just reads
   apps/index.json and loads each app file.

   To add an app: drop <your-app>.json into /apps/ and add its
   filename to apps/index.json. That's the entire process.
   (Or publish/upload through the App Studio at runtime — those
   apps live in the shared registry, not here.)

   Manifest shape (pure JSON):
   { "id", "name", "icon", "cat", "type"?, "price", "desc",
     "author"?, "version"?,
     "block"?:  {"title","sub"},              // public page section
     "setup"?:  [{key,label,type,options?,def?,ph?,showIf?}],
     "dataKey"?, "fields"?,                   // its OWN data table
     "automation"?: {"trigger","action","template"} }
   ============================================================ */
window.CC_SEED_APPS = [];
window.CC_APP_CATS  = [];
window.CC_PRESETS   = [];

window.CC_REGISTRY_READY = (function(){
  function j(u){
    return fetch(u).then(function(r){
      if(!r.ok) throw new Error('registry: could not load '+u);
      return r.json();
    });
  }
  /* FAULT ISOLATION: every app file loads independently.
     A broken or missing app is skipped and logged — it can NEVER
     take down the store, the dashboard, or any other app. */
  return j('apps/index.json')
    .catch(function(e){ console.error('App registry index failed:', e.message); return []; })
    .then(function(index){
      return Promise.all(index.map(function(f){
        return j('apps/'+f).then(function(a){
          if(!a || !a.id || !a.name){ console.error('App skipped (bad manifest):', f); return null; }
          return a;
        }).catch(function(e){
          console.error('App skipped (failed to load):', f, e.message);
          return null;
        });
      }));
    })
    .then(function(apps){
      window.CC_SEED_APPS = apps.filter(Boolean);
      return Promise.all([
        j('apps/_categories.json').catch(function(){ return []; }),
        j('apps/_presets.json').catch(function(){ return []; })
      ]);
    })
    .then(function(res){
      window.CC_APP_CATS = res[0];
      window.CC_PRESETS  = res[1];
    });
})();
