import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ExportOptions {
  filename: string;
  data: any[];
  columns?: string[];
}

export class ExportService {
  exportToCSV(options: ExportOptions): void {
    const csv = Papa.unparse(options.data);
    this.downloadFile(csv, `${options.filename}.csv`, 'text/csv');
  }

  exportToExcel(options: ExportOptions): void {
    const ws = XLSX.utils.json_to_sheet(options.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${options.filename}.xlsx`);
  }

  exportToPDF(options: ExportOptions): void {
    const doc = new jsPDF();
    const columns = options.columns || Object.keys(options.data[0] || {});
    const rows = options.data.map(item =>
      columns.map(col => item[col] || '')
    );

    (doc as any).autoTable({
      head: [columns],
      body: rows,
    });

    (doc as any).save(`${options.filename}.pdf`);
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();
