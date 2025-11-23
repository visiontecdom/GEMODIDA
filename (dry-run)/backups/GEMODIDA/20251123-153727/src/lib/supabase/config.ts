// Configuración de Supabase
// Reemplaza estos valores con los de tu proyecto de Supabase
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Roles de usuario
export const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operador',
  SUPER_USER: 'super_user',
  GUEST: 'invitado',
  MANAGER: 'gerente',
  SUPERVISOR: 'supervisor',
  SURVEYOR: 'encuestador',
  DEVELOPER: 'desarrollo',
  SECURITY: 'seguridad',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
