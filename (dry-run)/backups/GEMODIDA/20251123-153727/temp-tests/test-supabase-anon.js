const fs = require('fs');
const path = require('path');
(async function(){
  try{
    const env = fs.readFileSync(path.resolve(__dirname,'..','.env.local'),'utf8');
    const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
    const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
    if(!urlMatch || !keyMatch) throw new Error('.env.local missing required vars');
    const url = urlMatch[1].trim();
    const key = keyMatch[1].trim();
    const headers = {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    };

    const call = async (path, opts={})=>{
      const res = await fetch(`${url}${path}`, { headers, ...opts });
      const text = await res.text();
      console.log(path,'status',res.status);
      console.log('body sample:', text.slice(0,1000));
    }

    await call('/rest/v1/rpc/obtener_usuarios_completos',{method:'POST', body: JSON.stringify({p_limite:3,p_desplazamiento:0})});
    await call('/rest/v1/rpc/obtener_permisos_usuario',{method:'POST', body: JSON.stringify({p_user_id:'f5073781-ed4b-41c2-8ad6-cf3c7d76f8ed'})});
    await call(`/rest/v1/usuarios_roles?select=*&esta_activo=eq.true&order=nivel_acceso.desc`);
    await call(`/rest/v1/usuarios?select=id_usuario,correo,nombre_completo,id_rol,usuarios_roles(nombre_rol),sucursales(nombre_sucursal)&order=creado_en.desc&limit=10`);

  }catch(err){
    console.error('ERROR', err.message || err);
    process.exit(1);
  }
})();