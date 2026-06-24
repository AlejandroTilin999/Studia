import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/Components/ui/table";

export interface AppTableColumn<T> {
  header: React.ReactNode;
  accessor?: keyof T | ((row: T, index: number) => React.ReactNode);
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
}

interface AppTableProps<T> {
  columns: AppTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: string | ((item: T, index: number) => string);
}

export default function AppTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No se encontraron elementos.",
  className,
  onRowClick,
  rowClassName,
}: AppTableProps<T>) {
  return (
    <div className={cn("rounded-xl border border-slate-100 overflow-hidden bg-white shadow-sm overflow-x-auto text-left", className)}>
      <Table className="w-full border-collapse">
        <TableHeader className="bg-[#f8faff]">
          <TableRow className="border-none hover:bg-transparent">
            {columns.map((col, idx) => {
              const alignClass = 
                col.align === "right" ? "text-right pr-6" : 
                col.align === "center" ? "text-center" : 
                "text-left pl-6";
              
              return (
                <TableHead
                  key={idx}
                  className={cn(
                    "font-bold text-slate-700 h-14 uppercase text-[10px] md:text-[11px] tracking-wider whitespace-nowrap",
                    alignClass,
                    col.headerClassName
                  )}
                >
                  {col.header}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-50">
          {data.length > 0 ? (
            data.map((row, rowIdx) => {
              const rowClass = typeof rowClassName === 'function' ? rowClassName(row, rowIdx) : rowClassName;
              
              return (
                <TableRow
                  key={keyExtractor(row, rowIdx)}
                  onClick={() => onRowClick && onRowClick(row, rowIdx)}
                  className={cn(
                    "border-slate-50 transition-colors",
                    onRowClick ? "cursor-pointer" : "cursor-default",
                    "hover:bg-blue-50/30",
                    rowClass
                  )}
                >
                  {columns.map((col, colIdx) => {
                    const alignClass = 
                      col.align === "right" ? "text-right pr-6" : 
                      col.align === "center" ? "text-center" : 
                      "text-left pl-6";

                    let content: React.ReactNode = null;
                    if (typeof col.accessor === 'function') {
                      content = col.accessor(row, rowIdx);
                    } else if (col.accessor) {
                      content = String(row[col.accessor] ?? '');
                    }

                    return (
                      <TableCell
                        key={colIdx}
                        className={cn(
                          "h-14 text-sm font-semibold text-slate-600 whitespace-nowrap",
                          alignClass,
                          col.className
                        )}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow className="border-none hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-slate-400 font-medium text-xs pl-6 pr-6"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
