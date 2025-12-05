# MEJORAS DE MENÚS DE PANELES
## Diseño Moderno, Elegante y Funcional

**Prioridad:** 🔴 CRÍTICA  
**Duración:** 3 días  
**Impacto:** Alto (Interfaz de usuario)

---

## 1. PROBLEMAS ACTUALES

### 1.1 Problemas Identificados
- ❌ Botones sin uniformidad de ancho
- ❌ Falta de efectos hover
- ❌ Falta de animaciones
- ❌ Falta de iconografía consistente
- ❌ Falta de feedback visual
- ❌ Falta de estados activos/inactivos
- ❌ Diseño poco profesional
- ❌ Inconsistencia entre paneles

### 1.2 Impacto
- Interfaz poco profesional
- Mala experiencia de usuario
- Falta de feedback visual
- Difícil identificar sección activa

---

## 2. SOLUCIÓN PROPUESTA

### 2.1 Componente MenuButton Mejorado

#### Características
- ✅ Ancho uniforme (200px)
- ✅ Altura consistente (48px)
- ✅ Efectos hover elegantes
- ✅ Animaciones suaves
- ✅ Estados activos/inactivos
- ✅ Iconografía consistente
- ✅ Feedback visual
- ✅ Transiciones suaves

#### Código
```typescript
// src/components/shared/MenuButton.tsx
'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface MenuButtonProps {
  icon: ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
  badge?: number;
}

export function MenuButton({
  icon,
  label,
  href,
  isActive = false,
  onClick,
  badge,
}: MenuButtonProps) {
  return (
    <Link href={href}>
      <button
        onClick={onClick}
        className={`
          w-full h-12 px-4 rounded-lg
          flex items-center gap-3
          transition-all duration-300 ease-in-out
          relative overflow-hidden
          group
          ${
            isActive
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
      >
        {/* Efecto de fondo animado */}
        <div
          className={`
            absolute inset-0 opacity-0 group-hover:opacity-10
            transition-opacity duration-300
            ${isActive ? 'bg-white' : 'bg-blue-600'}
          `}
        />

        {/* Icono */}
        <span
          className={`
            text-xl flex-shrink-0
            transition-transform duration-300
            ${isActive ? 'scale-110' : 'group-hover:scale-110'}
          `}
        >
          {icon}
        </span>

        {/* Etiqueta */}
        <span
          className={`
            font-medium flex-1 text-left
            transition-all duration-300
            ${isActive ? 'font-semibold' : ''}
          `}
        >
          {label}
        </span>

        {/* Badge (opcional) */}
        {badge !== undefined && badge > 0 && (
          <span
            className={`
              px-2 py-1 rounded-full text-xs font-bold
              transition-all duration-300
              ${
                isActive
                  ? 'bg-white text-blue-600'
                  : 'bg-red-500 text-white'
              }
            `}
          >
            {badge}
          </span>
        )}

        {/* Indicador de estado activo */}
        {isActive && (
          <div
            className={`
              absolute right-0 top-0 bottom-0 w-1
              bg-white rounded-l-full
              animate-pulse
            `}
          />
        )}
      </button>
    </Link>
  );
}
```

---

### 2.2 Contenedor de Menú

#### Características
- ✅ Espaciado consistente
- ✅ Separadores visuales
- ✅ Scroll suave
- ✅ Responsive

#### Código
```typescript
// src/components/shared/MenuContainer.tsx
'use client';

import { ReactNode } from 'react';

interface MenuContainerProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function MenuContainer({ title, children, icon }: MenuContainerProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Encabezado */}
      <div className="px-4 py-3 flex items-center gap-2">
        {icon && <span className="text-lg text-gray-600">{icon}</span>}
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          {title}
        </h3>
      </div>

      {/* Separador */}
      <div className="px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>

      {/* Botones */}
      <div className="flex flex-col gap-2 px-2">
        {children}
      </div>
    </div>
  );
}
```

---

### 2.3 Sidebar Mejorado

#### Características
- ✅ Diseño moderno
- ✅ Scroll suave
- ✅ Responsive
- ✅ Animaciones

#### Código
```typescript
// src/components/layout/PanelSidebar.tsx (MEJORADO)
'use client';

import { usePathname } from 'next/navigation';
import { MenuButton } from '@/components/shared/MenuButton';
import { MenuContainer } from '@/components/shared/MenuContainer';
import {
  BarChart3,
  Users,
  Settings,
  FileText,
  Zap,
  Target,
  Activity,
  Bell,
} from 'lucide-react';

interface PanelSidebarProps {
  panelType: 'monitoreo-gerencia' | 'monitoreo-operaciones' | 'admin-general' | string;
}

export function PanelSidebar({ panelType }: PanelSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  const renderMenuItems = () => {
    switch (panelType) {
      case 'monitoreo-gerencia':
        return (
          <>
            <MenuContainer title="Gestión" icon={<BarChart3 size={18} />}>
              <MenuButton
                icon={<Target size={20} />}
                label="Palabras Clave"
                href="/monitoreo-gerencia/keywords"
                isActive={isActive('/monitoreo-gerencia/keywords')}
              />
              <MenuButton
                icon={<FileText size={20} />}
                label="Planificación"
                href="/monitoreo-gerencia/planificacion"
                isActive={isActive('/monitoreo-gerencia/planificacion')}
              />
              <MenuButton
                icon={<FileText size={20} />}
                label="Informes"
                href="/monitoreo-gerencia/informes"
                isActive={isActive('/monitoreo-gerencia/informes')}
              />
            </MenuContainer>

            <MenuContainer title="Administración" icon={<Settings size={18} />}>
              <MenuButton
                icon={<Users size={20} />}
                label="Usuarios"
                href="/monitoreo-gerencia/usuarios"
                isActive={isActive('/monitoreo-gerencia/usuarios')}
              />
              <MenuButton
                icon={<Settings size={20} />}
                label="Configuración"
                href="/monitoreo-gerencia/configuracion"
                isActive={isActive('/monitoreo-gerencia/configuracion')}
              />
            </MenuContainer>
          </>
        );

      case 'monitoreo-operaciones':
        return (
          <>
            <MenuContainer title="Operaciones" icon={<Zap size={18} />}>
              <MenuButton
                icon={<Activity size={20} />}
                label="Encuestas"
                href="/monitoreo-operaciones/encuestas"
                isActive={isActive('/monitoreo-operaciones/encuestas')}
              />
              <MenuButton
                icon={<BarChart3 size={20} />}
                label="Scraping"
                href="/monitoreo-operaciones/scraping"
                isActive={isActive('/monitoreo-operaciones/scraping')}
              />
              <MenuButton
                icon={<FileText size={20} />}
                label="Reportes"
                href="/monitoreo-operaciones/reportes"
                isActive={isActive('/monitoreo-operaciones/reportes')}
              />
            </MenuContainer>

            <MenuContainer title="Seguimiento" icon={<Activity size={18} />}>
              <MenuButton
                icon={<Bell size={20} />}
                label="Notificaciones"
                href="/monitoreo-operaciones/notificaciones"
                isActive={isActive('/monitoreo-operaciones/notificaciones')}
                badge={3}
              />
            </MenuContainer>
          </>
        );

      case 'admin-general':
        return (
          <>
            <MenuContainer title="Administración" icon={<Settings size={18} />}>
              <MenuButton
                icon={<Users size={20} />}
                label="Usuarios"
                href="/admin/users"
                isActive={isActive('/admin/users')}
              />
              <MenuButton
                icon={<Target size={20} />}
                label="Roles"
                href="/admin/roles"
                isActive={isActive('/admin/roles')}
              />
              <MenuButton
                icon={<FileText size={20} />}
                label="Logs"
                href="/admin/logs"
                isActive={isActive('/admin/logs')}
              />
              <MenuButton
                icon={<Settings size={20} />}
                label="Configuración"
                href="/admin/settings"
                isActive={isActive('/admin/settings')}
              />
            </MenuContainer>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <aside
      className={`
        w-64 bg-white border-r border-gray-200
        flex flex-col
        transition-all duration-300
        overflow-y-auto
      `}
    >
      {/* Logo/Encabezado */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">GEMODIDA</h2>
        <p className="text-xs text-gray-500 mt-1">Panel de Control</p>
      </div>

      {/* Menú */}
      <nav className="flex-1 py-4 space-y-4 overflow-y-auto">
        {renderMenuItems()}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          v1.0.0 • Diciembre 2024
        </p>
      </div>
    </aside>
  );
}
```

---

## 3. ESTILOS GLOBALES

### 3.1 Animaciones CSS

```css
/* src/app/globals-enhanced.css */

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-in-out;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Scroll suave */
html {
  scroll-behavior: smooth;
}

/* Transiciones suaves */
* {
  @apply transition-colors duration-200;
}

/* Focus visible */
:focus-visible {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2;
}
```

---

## 4. IMPLEMENTACIÓN POR PANEL

### 4.1 Panel de Monitoreo - Gerencia

**Archivo:** `src/app/(dashboard)/monitoreo-gerencia/layout.tsx`

```typescript
import { PanelSidebar } from '@/components/layout/PanelSidebar';

export default function MonitoreoGerenciaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <PanelSidebar panelType="monitoreo-gerencia" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

---

### 4.2 Panel de Monitoreo - Operaciones

**Archivo:** `src/app/(dashboard)/monitoreo-operaciones/layout.tsx`

```typescript
import { PanelSidebar } from '@/components/layout/PanelSidebar';

export default function MonitoreoOperacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <PanelSidebar panelType="monitoreo-operaciones" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

---

### 4.3 Panel de Administración

**Archivo:** `src/app/admin/layout.tsx`

```typescript
import { PanelSidebar } from '@/components/layout/PanelSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <PanelSidebar panelType="admin-general" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

---

## 5. EFECTOS VISUALES DETALLADOS

### 5.1 Hover Effect
```
Estado Normal:
- Fondo: #F3F4F6 (gray-100)
- Texto: #374151 (gray-700)
- Sombra: ninguna

Hover:
- Fondo: #E5E7EB (gray-200)
- Texto: #1F2937 (gray-900)
- Sombra: 0 4px 6px rgba(0, 0, 0, 0.1)
- Escala: 1.02
- Duración: 300ms
```

### 5.2 Active Effect
```
Estado Activo:
- Fondo: Gradiente azul (from-blue-600 to-blue-700)
- Texto: Blanco
- Sombra: 0 10px 15px rgba(0, 0, 0, 0.2)
- Escala: 1.0
- Indicador: Línea blanca a la derecha
- Animación: Pulse suave
```

### 5.3 Click Effect
```
Al hacer clic:
- Escala: 0.95
- Duración: 100ms
- Tipo: ease-out
```

---

## 6. RESPONSIVE DESIGN

### 6.1 Breakpoints
```
Mobile (< 768px):
- Sidebar: Oculto (drawer)
- Botones: Ancho completo
- Altura: 44px

Tablet (768px - 1024px):
- Sidebar: 56px (colapsado)
- Botones: Solo iconos
- Altura: 48px

Desktop (> 1024px):
- Sidebar: 256px (expandido)
- Botones: Icono + texto
- Altura: 48px
```

### 6.2 Código Responsive
```typescript
// Sidebar responsive
<aside className="
  w-64 md:w-14 lg:w-64
  transition-all duration-300
">
  {/* Contenido */}
</aside>

// Botón responsive
<button className="
  h-11 md:h-12 lg:h-12
  px-3 md:px-2 lg:px-4
  text-sm md:text-xs lg:text-base
">
  {/* Contenido */}
</button>
```

---

## 7. ACCESIBILIDAD

### 7.1 ARIA Labels
```typescript
<button
  aria-label="Ir a palabras clave"
  aria-current={isActive ? 'page' : undefined}
  role="menuitem"
>
  {/* Contenido */}
</button>
```

### 7.2 Keyboard Navigation
- Tab: Navegar entre botones
- Enter: Activar botón
- Escape: Cerrar menú (si aplica)

---

## 8. TESTING

### 8.1 Tests Unitarios
```typescript
// __tests__/MenuButton.test.tsx
import { render, screen } from '@testing-library/react';
import { MenuButton } from '@/components/shared/MenuButton';

describe('MenuButton', () => {
  it('renders with correct label', () => {
    render(
      <MenuButton
        icon={<span>📌</span>}
        label="Test"
        href="/test"
      />
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('shows active state', () => {
    const { container } = render(
      <MenuButton
        icon={<span>📌</span>}
        label="Test"
        href="/test"
        isActive={true}
      />
    );
    expect(container.querySelector('button')).toHaveClass('bg-gradient-to-r');
  });
});
```

---

## 9. CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear `MenuButton.tsx`
- [ ] Crear `MenuContainer.tsx`
- [ ] Actualizar `PanelSidebar.tsx`
- [ ] Agregar estilos en `globals-enhanced.css`
- [ ] Actualizar layouts de paneles
- [ ] Implementar responsive design
- [ ] Agregar tests
- [ ] Validar accesibilidad
- [ ] Compilar y validar
- [ ] Deploy

---

## 10. RESULTADO ESPERADO

### Antes
- Botones básicos sin estilos
- Interfaz poco profesional
- Falta de feedback visual
- Inconsistencia

### Después
- ✅ Botones modernos y elegantes
- ✅ Interfaz profesional
- ✅ Feedback visual completo
- ✅ Consistencia en todos los paneles
- ✅ Animaciones suaves
- ✅ Efectos visuales dinámicos
- ✅ Accesibilidad mejorada
- ✅ Responsive en todos los dispositivos

---

**Documento de mejoras de menús - Versión 1.0**
