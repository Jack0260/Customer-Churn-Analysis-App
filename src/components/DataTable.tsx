interface DataTableProps {
  columns: string[];
  rows: (string | number | null)[][];
  maxRows?: number;
}

export function DataTable({ columns, rows, maxRows = 100 }: DataTableProps) {
  const displayRows = rows.slice(0, maxRows);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col, i) => (
              <th
                key={i}
                className="text-left px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-2.5 text-slate-700 whitespace-nowrap"
                >
                  {cell === null ? "—" : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <div className="text-sm text-slate-400 mt-3 px-3">
          Showing {maxRows} of {rows.length} rows
        </div>
      )}
    </div>
  );
}
