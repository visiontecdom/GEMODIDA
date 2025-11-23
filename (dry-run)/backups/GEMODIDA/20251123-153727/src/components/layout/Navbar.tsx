'use client';

import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { diagLog } from '@/lib/diagnostic';
import { LogOut, User, Settings } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
      try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message || error);
      }
      diagLog('info', 'signOut completed (Navbar)', 'Navbar');
      try {
        // Clear token if persisted
        if (typeof window !== 'undefined') localStorage.removeItem('GEMODIDA-auth-token');
        // Call server to clear cookie as well
        await fetch('/api/auth/clear-session', { method: 'POST' });
      } catch (err) {
        console.warn('Navbar signOut: error clearing session cookie', err);
      }
      router.replace('/signin');
      router.refresh();
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
    }
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">GEMODIDA</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/principal-dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Panel Principal
          </Link>
          <Link href="/keywords" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Keywords
          </Link>
          <Link href="/results" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Resultados
          </Link>
          <Link href="/analytics" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Estadísticas
          </Link>
          <Link href="/reports" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Reportes
          </Link>
          <Link href="/surveys" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Encuestas
          </Link>
          <Link href="/activities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Actividades
          </Link>
          <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Perfil</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Configuración</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive/90"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
