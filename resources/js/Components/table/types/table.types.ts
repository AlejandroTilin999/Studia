import React from "react";

export interface AppTableColumn<T> {
  header: React.ReactNode;

  accessor?: keyof T | ((row: T, index: number) => React.ReactNode);

  className?: string;

  headerClassName?: string;

  align?: "left" | "center" | "right";

  sortable?: boolean;

  sortKey?: string | ((row: T) => any);
}


export interface AppTableProps<T> {
  columns: AppTableColumn<T>[];

  data: T[];

  keyExtractor: (
    item: T,
    index: number
  ) => string | number;

  emptyMessage?: string;

  className?: string;

  onRowClick?: (
    item: T,
    index: number
  ) => void;

  rowClassName?: 
    string | 
    ((item: T,index:number)=>string);

  defaultPageSize?: number;

  enablePagination?: boolean;

  enableSorting?: boolean;
}