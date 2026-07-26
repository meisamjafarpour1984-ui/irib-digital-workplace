'use client'

import { useState } from 'react'
import { Plus, Trash2, Copy, Printer, Download, GripVertical } from 'lucide-react'

interface AfishColumn {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'date'
  options?: string[]
  width?: number
}

interface AfishRow {
  id: string
  data: Record<string, string | number>
}

interface AfishTableProps {
  columns: AfishColumn[]
  initialRows?: AfishRow[]
  title?: string
  locked?: boolean
  onChange?: (rows: AfishRow[]) => void
}

export function AfishTable({
  columns,
  initialRows = [],
  title = 'آفیش تیم',
  locked = false,
  onChange,
}: AfishTableProps) {
  const [rows, setRows] = useState<AfishRow[]>(
    initialRows.length > 0 ? initialRows : [{ id: `r-${Date.now()}`, data: {} }]
  )

  const addRow = () => {
    const newRow: AfishRow = {
      id: `r-${Date.now()}`,
      data: {},
    }
    const newRows = [...rows, newRow]
    setRows(newRows)
    onChange?.(newRows)
  }

  const removeRow = (id: string) => {
    if (rows.length <= 1) return
    const newRows = rows.filter((r) => r.id !== id)
    setRows(newRows)
    onChange?.(newRows)
  }

  const duplicateRow = (id: string) => {
    const source = rows.find((r) => r.id === id)
    if (!source) return
    const newRow: AfishRow = {
      id: `r-${Date.now()}`,
      data: { ...source.data },
    }
    const newRows = [...rows, newRow]
    setRows(newRows)
    onChange?.(newRows)
  }

  const updateCell = (rowId: string, colId: string, value: string | number) => {
    const newRows = rows.map((r) =>
      r.id === rowId ? { ...r, data: { ...r.data, [colId]: value } } : r
    )
    setRows(newRows)
    onChange?.(newRows)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4 print:hidden">
        <div className="flex items-center gap-3">
          <h3 className="text-heading-1 text-foreground">{title}</h3>
          <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
            {rows.length} ردیف
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Printer className="size-3.5" aria-hidden />
            چاپ
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Download className="size-3.5" aria-hidden />
            PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-10 p-3 text-center text-xs font-medium text-muted-foreground">#</th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="p-3 text-right text-xs font-medium text-muted-foreground"
                  style={{ minWidth: col.width || 120 }}
                >
                  {col.label}
                </th>
              ))}
              <th className="w-20 p-3 text-center text-xs font-medium text-muted-foreground print:hidden">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="p-3 text-center text-xs text-muted-foreground">
                  <span className="flex items-center justify-center gap-1">
                    <GripVertical className="size-3 print:hidden" aria-hidden />
                    {rowIndex + 1}
                  </span>
                </td>
                {columns.map((col) => (
                  <td key={col.id} className="p-1">
                    {locked ? (
                      <div className="px-3 py-2 text-sm text-foreground">
                        {row.data[col.id] || '—'}
                      </div>
                    ) : col.type === 'select' ? (
                      <select
                        value={(row.data[col.id] as string) || ''}
                        onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                      >
                        <option value="">انتخاب...</option>
                        {col.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : col.type === 'date' ? (
                      <input
                        type="date"
                        value={(row.data[col.id] as string) || ''}
                        onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                      />
                    ) : col.type === 'number' ? (
                      <input
                        type="number"
                        value={(row.data[col.id] as number) || ''}
                        onChange={(e) => updateCell(row.id, col.id, Number(e.target.value))}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                      />
                    ) : (
                      <input
                        type="text"
                        value={(row.data[col.id] as string) || ''}
                        onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                      />
                    )}
                  </td>
                ))}
                <td className="p-2 print:hidden">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => duplicateRow(row.id)}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="کپی ردیف"
                    >
                      <Copy className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-error/10 hover:text-error disabled:opacity-30"
                      aria-label="حذف ردیف"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row */}
      {!locked && (
        <div className="border-t border-border p-3 print:hidden">
          <button
            type="button"
            onClick={addRow}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
          >
            <Plus className="size-4" aria-hidden />
            افزودن ردیف
          </button>
        </div>
      )}

      {/* Print Layout - Hidden on screen */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { font-size: 12pt; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; }
        }
      `}</style>
    </div>
  )
}
