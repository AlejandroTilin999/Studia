import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppTableColumn } from "./types/table.types";

interface Props<T> {
  columns: AppTableColumn<T>[];
  sortColumnIndex: number | null;
  sortDirection: "asc" | "desc" | null;
  onSort: (index: number, column: AppTableColumn<T>) => void;
}

export default function TableHeader<T>({ columns, sortColumnIndex, sortDirection, onSort }: Props<T>) {
  return (
    <thead className="bg-[#f8faff]">
      <tr className="border-b border-slate-100">
        {columns.map((col, index) => {
          const sortable = col.sortable !== false && (!!col.accessor || !!col.sortKey);
          const current = sortColumnIndex === index;

          const align = col.align === "right" ? "text-right pr-6" :
                        col.align === "center" ? "text-center" : "text-left pl-6";

          return (
            <th
              key={index}
              onClick={() => sortable && onSort(index, col)}
              className={cn(
                "font-normal text-slate-500 h-14 uppercase text-[12px] tracking-normal whitespace-nowrap",
                align,
                sortable && "cursor-pointer hover:bg-slate-50",
                col.headerClassName
              )}
            >
              <div className={cn("flex items-center gap-1.5",
                col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : ""
              )}>
                <span>{col.header}</span>
                {sortable && (
                  current ? (
                    sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
