'use client';

import { useState, ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: FilterOption[];
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
  placeholder?: string;
  children?: ReactNode;
  className?: string;
  filters?: FilterConfig[];
  onFilterChange?: (filters: Record<string, any>) => void;
}

export function FilterBar({
  searchValue = '',
  onSearchChange,
  onSearch,
  onClear,
  placeholder = 'Buscar...',
  children,
  className = '',
  filters = [],
  onFilterChange,
}: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (!value || value === '') {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFilterChange?.({});
    onClear?.();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barra de búsqueda principal */}
      <div className="flex gap-2 items-center flex-wrap">
        <div className="flex-1 min-w-[200px] flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-8"
            />
          </div>
          {onSearch && (
            <Button onClick={onSearch} variant="outline" size="sm">
              Buscar
            </Button>
          )}
          {filters.length > 0 && (
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtros
            </Button>
          )}
          {(Object.keys(activeFilters).length > 0 || searchValue) && (
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              className="px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {children}
      </div>

      {/* Filtros avanzados */}
      {showFilters && filters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {filter.label}
              </label>
              {filter.type === 'select' && filter.options ? (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  <option value="">Todos</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === 'date' ? (
                <Input
                  type="date"
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="text-sm"
                />
              ) : (
                <Input
                  type="text"
                  placeholder={`Filtrar por ${filter.label.toLowerCase()}`}
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="text-sm"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filtros activos */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key);
            const displayValue = filter?.type === 'select' 
              ? filter.options?.find(o => o.value === value)?.label || value
              : value;
            
            return (
              <div
                key={key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                <span>{filter?.label}: {displayValue}</span>
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
