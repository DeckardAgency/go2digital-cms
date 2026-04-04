import { DataTableColumn } from './data-table-wrapper.models';

export function exportToCsv(columns: DataTableColumn[], data: any[], filename: string): void {
  const exportCols = columns.filter(c => c.csvHeader || c.csvValue);
  if (exportCols.length === 0) return;

  const headers = exportCols.map(c => c.csvHeader || c.label);
  const rows = data.map(row =>
    exportCols.map(c => {
      const val = c.csvValue ? c.csvValue(row) : (row[c.key] ?? '');
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
