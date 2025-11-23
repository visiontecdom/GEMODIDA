export const ROLE_PERMISSIONS = {
  admin: ['read', 'create', 'update', 'delete', 'manage_users', 'manage_roles', 'view_logs'],
  operator: ['read', 'create', 'update', 'delete'],
  analyst: ['read', 'create', 'update'],
  viewer: ['read'],
};

export function hasPermission(role: string | undefined, permission: string): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
  return permissions.includes(permission);
}

export function canDelete(role: string | undefined): boolean {
  return hasPermission(role, 'delete');
}

export function canCreate(role: string | undefined): boolean {
  return hasPermission(role, 'create');
}

export function canUpdate(role: string | undefined): boolean {
  return hasPermission(role, 'update');
}

export function canManageUsers(role: string | undefined): boolean {
  return hasPermission(role, 'manage_users');
}
