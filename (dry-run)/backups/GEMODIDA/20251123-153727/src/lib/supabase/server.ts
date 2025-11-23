import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from './database.types';
import { supabaseConfig } from './config';

// Cliente para Server Components
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies });
};

// Cliente para Server Components con permisos de administrador
export const createAdminClient = () => {
  return createServerComponentClient<Database>({ cookies });
};
