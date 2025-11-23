'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X, User } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSystem } from '@/hooks/useRoleSystem';

const navigation = [
  { name: 'Panel Principal', href: '/principal-dashboard' },
  { name: 'Palabras Clave', href: '/keywords' },
  { name: 'Resultados', href: '/results' },
  { name: 'Estadísticas', href: '/analytics' },
  { name: 'Informes', href: '/reports' },
  { name: 'Encuestas', href: '/surveys' },
  { name: 'Actividades', href: '/activities' },
  { name: 'Matriz de Soporte', href: '/matriz-soporte' },
  { name: 'Administración', href: '/admin', adminOnly: true },
  { name: 'Usuarios', href: '/admin/users', adminOnly: true },
  { name: 'Roles', href: '/admin/roles', adminOnly: true },
  { name: 'Logs del Sistema', href: '/admin/logs', adminOnly: true },
  { name: 'Configuración', href: '/admin/settings', adminOnly: true },
];

interface NavigationItem {
  name: string;
  href: string;
  adminOnly?: boolean;
}

interface MainLayoutProps {
  children: React.ReactNode;
  userRole?: string;
}

export function MainLayout({ children, userRole }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const { userPermissions } = useRoleSystem();

  // Get user display name and roles from userPermissions
  const userDisplayName = userPermissions?.usuario?.nombre || user?.email || 'Usuario';
  const userDisplayRoles = userPermissions?.asignaciones
    ?.filter(a => a.esta_activa)
    .map(a => a.rol.nombre_rol) || [];
  
  // Get user's primary branch/location
  const primaryAssignment = userPermissions?.asignaciones?.find(a => a.esta_activa && a.es_principal);
  const userBranch = primaryAssignment?.sucursal?.nombre_sucursal || null;
  const userProvince = primaryAssignment?.sucursal?.provincia || null;

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/signin';
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-card border-b border-border">
          <Link href="/" className="text-xl font-bold text-primary">
            GEMODIDA
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="bg-card shadow-lg border border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* User Information - Mobile */}
              <div className="px-3 py-3 mb-2 border-b border-border">
                <div className="flex items-center mb-2">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {userDisplayName}
                    </p>
                    {userBranch && (
                      <p className="text-xs text-muted-foreground truncate">
                        {userBranch}
                        {userProvince && ` - ${userProvince}`}
                      </p>
                    )}
                  </div>
                </div>
                {userDisplayRoles.length > 0 && (
                  <div className="ml-13">
                    <div className="flex flex-wrap gap-1">
                      {userDisplayRoles.map((role, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Navigation Links */}
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-left text-destructive rounded-md hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-card lg:pb-4 lg:pt-5">
        <div className="flex items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-primary">
            GEMODIDA
          </Link>
        </div>
        <nav className="mt-6 flex-1 space-y-1 px-2">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === item.href
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-4 px-4">
          {/* User Information */}
          <div className="mb-4 pb-4 border-b border-border">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {userDisplayName}
                </p>
                {userBranch && (
                  <p className="text-xs text-muted-foreground truncate">
                    {userBranch}
                    {userProvince && ` - ${userProvince}`}
                  </p>
                )}
              </div>
            </div>
            {userDisplayRoles.length > 0 && (
              <div className="ml-11">
                <div className="flex flex-wrap gap-1">
                  {userDisplayRoles.map((role, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
