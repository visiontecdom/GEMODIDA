'use client';

import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export-utils';
import { useState } from 'react';

interface ExportButtonProps {
  data: any[];
  filename: string;
  title: string;
}

export function ExportButton({ data, filename, title }: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowMenu(!showMenu)}
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
            onClick={() => {
              exportToCSV(data, filename);
              setShowMenu(false);
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            Exportar CSV
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
            onClick={() => {
              exportToExcel(data, filename);
              setShowMenu(false);
            }}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
            onClick={() => {
              exportToPDF(data, filename, title);
              setShowMenu(false);
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </button>
        </div>
      )}
    </div>
  );
}