const fs = require('fs');
const path = require('path');
(async ()=>{
  const env = fs.readFileSync(path.resolve(__dirname,'..','.env.local'),'utf8');
  const url = (env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)||[])[1].trim();
  const anon = (env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)||[])[1].trim();
  const svc = (env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)||[])[1].trim();

  async function call(key){
    const headers = { apikey:key, Authorization:`Bearer ${key}`, 'Content-Type':'application/json' };
    const res = await fetch(`${url}/rest/v1/rpc/obtener_estadisticas_departamentos`,{ method:'POST', headers, body: JSON.stringify({}) });
    const txt = await res.text();
    console.log(`key=${key===anon?'anon':'service'} status=${res.status}`);
    console.log(txt.slice(0,2000));
  }

  await call(anon);
  await call(svc);
})();