import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar comillas y envolver en comillas si contiene comas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export function exportToExcel(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToPDF(data: any[], filename: string, title: string) {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  
  // Fecha de generación
  doc.setFontSize(10);
  doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Preparar datos para la tabla
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(header => row[header] || ''));
  
  // Crear tabla
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });
  
  doc.save(`${filename}.pdf`);
}

export function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function formatDataForExport(data: any[], columns?: string[]) {
  if (!data || data.length === 0) return [];
  
  if (columns) {
    return data.map(row => {
      const filteredRow: any = {};
      columns.forEach(col => {
        filteredRow[col] = row[col];
      });
      return filteredRow;
    });
  }
  
  return data;
}