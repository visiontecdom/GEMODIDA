const fs = require('fs');
const path = require('path');

(async function(){
  try {
    const env = fs.readFileSync(path.resolve(__dirname,'..','.env.local'),'utf8');
    const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
    // prefer service role key for tests (bypass RLS), fallback to anon
    const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/) || env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
    if(!urlMatch || !keyMatch) throw new Error('.env.local missing Supabase URL or anon key');
    const url = urlMatch[1].trim();
    const key = keyMatch[1].trim();

    const fetchOpts = {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_limite: 3, p_desplazamiento: 0 })
    };

    // Using global fetch (Node 18+)
    const res1 = await fetch(`${url}/rest/v1/rpc/obtener_usuarios_completos`, fetchOpts);
    console.log('obtener_usuarios_completos status:', res1.status);
    const txt1 = await res1.text();
    console.log('obtener_usuarios_completos body sample:', txt1.slice(0, 2000));

    // Call permisos RPC for test user (from diagnostic)
    const userId = 'f5073781-ed4b-41c2-8ad6-cf3c7d76f8ed';
    const res2 = await fetch(`${url}/rest/v1/rpc/obtener_permisos_usuario`, { method: 'POST', headers: fetchOpts.headers, body: JSON.stringify({ p_user_id: userId }) });
    console.log('obtener_permisos_usuario status:', res2.status);
    const txt2 = await res2.text();
    console.log('obtener_permisos_usuario body sample:', txt2.slice(0, 2000));

      // Test direct table selects
      const rr1 = await fetch(`${url}/rest/v1/usuarios_roles?select=id_rol,codigo_rol,nombre_rol,esta_activo&esta_activo=eq.true&limit=5`, { method: 'GET', headers: fetchOpts.headers });
      console.log('usuarios_roles status:', rr1.status);
      console.log('usuarios_roles sample:', (await rr1.text()).slice(0,1000));

      const rr2 = await fetch(`${url}/rest/v1/sucursales?select=id_suc,nombre_sucursal,estado&estado=eq.Activo&limit=5`, { method: 'GET', headers: fetchOpts.headers });
      console.log('sucursales status:', rr2.status);
      console.log('sucursales sample:', (await rr2.text()).slice(0,1000));

      // Test the direct users query used as fallback in UI (with nested selects)
      const uq = `${url}/rest/v1/usuarios?select=id_usuario,correo,nombre_completo,telefono,esta_activo,id_rol,id_suc,creado_en,ultimo_acceso,usuarios_roles(nombre_rol),sucursales(nombre_sucursal)&order=creado_en.desc&limit=10`;
      const ru = await fetch(uq, { method: 'GET', headers: fetchOpts.headers });
      console.log('usuarios direct query status:', ru.status);
      const utext = await ru.text();
      console.log('usuarios direct sample:', utext.slice(0,2000));

      // Check assignments for example user (f5073781...) to see if active assignments exist
      const testUser = 'f5073781-ed4b-41c2-8ad6-cf3c7d76f8ed';
      const asigUrl = `${url}/rest/v1/usuarios_asignaciones?select=*&id_usuario=eq.${testUser}`;
      const ra = await fetch(asigUrl, { method: 'GET', headers: fetchOpts.headers });
      console.log('usuarios_asignaciones status:', ra.status);
      console.log('usuarios_asignaciones sample:', (await ra.text()).slice(0,2000));

  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(1);
  }
})();