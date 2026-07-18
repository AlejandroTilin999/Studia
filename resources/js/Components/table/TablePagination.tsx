import { ChevronLeft, ChevronRight } from "lucide-react";
import { TABLE_PAGE_SIZE_OPTIONS } from "./constants/table.constants";
import { cn } from "@/lib/utils";

interface Props {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  startRecord: number;
  endRecord: number;
  getPageNumbers: () => (number | string)[];
  setPageSize: (value: number) => void;
  setCurrentPage: (value: number) => void;
}

export default function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  startRecord,
  endRecord,
  getPageNumbers,
  setPageSize,
  setCurrentPage,
}: Props) {
  if (totalRecords === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-xs text-slate-500">
      <div>
        Mostrando <b className="mx-1">{startRecord}</b> al <b className="mx-1">{endRecord}</b> de <b className="mx-1">{totalRecords}</b> registros
      </div>

      <div className="flex items-center gap-3">
        <select
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
        className="h-10 pl-3 pr-8 text-sm border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none bg-white"
        >
        {TABLE_PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
            {size}
            </option>
        ))}
        </select>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          className="h-8 w-8 border rounded-full flex items-center justify-center disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={index}>...</span>
          ) : (
            <button
              key={index}
              onClick={() => setCurrentPage(Number(page))}
              className={cn(
                "h-8 min-w-8 rounded-full",
                currentPage === page ? "bg-[#1e88e5] text-white" : "hover:bg-slate-100"
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          className="h-8 w-8 border rounded-full flex items-center justify-center disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
