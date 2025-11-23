'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';

interface FilterConfig {
  label: string;
  key: string;
  type: 'text' | 'date' | 'select' | 'number';
  options?: { label: string; value: string }[];
}

interface AdvancedFilterBarProps {
  filters: FilterConfig[];
  onFilter: (filters: Record<string, any>) => void;
  onClear?: () => void;
}

export function AdvancedFilterBar({ filters, onFilter, onClear }: AdvancedFilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const handleClear = () => {
    setActiveFilters({});
    onClear?.();
  };

  const activeCount = Object.values(activeFilters).filter(v => v).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros Avanzados {activeCount > 0 && `(${activeCount})`}
        </Button>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4 bg-muted rounded-lg">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-medium">{filter.label}</label>
              {filter.type === 'text' && (
                <Input
                  placeholder={`Buscar ${filter.label.toLowerCase()}...`}
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              )}
              {filter.type === 'date' && (
                <Input
                  type="date"
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              )}
              {filter.type === 'number' && (
                <Input
                  type="number"
                  placeholder={`Ingresa ${filter.label.toLowerCase()}...`}
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              )}
              {filter.type === 'select' && (
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Seleccionar...</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
