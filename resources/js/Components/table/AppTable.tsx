import {
AppTableProps
} from "./types/table.types";


import {
useTableSort
} from "./hooks/useTableSort";


import {
useTablePagination
} from "./hooks/useTablePagination";


import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import TablePagination from "./TablePagination";


export default function AppTable<T>(
{
columns,
data,
keyExtractor,
emptyMessage="No se encontraron elementos.",
defaultPageSize=20,
enablePagination=true,
enableSorting=true,
onRowClick

}:AppTableProps<T>){



const sort =
useTableSort(
data,
columns,
enableSorting
);



const pagination =
useTablePagination(
sort.sortedData,
defaultPageSize,
enablePagination
);


return (

<div className="flex flex-col gap-4 w-full">

  <div className="
    border
    border-slate-100
    overflow-hidden
    bg-white
    overflow-x-auto
    w-full
  ">

    <table
      className="
        w-full
        border-collapse
      "
    >

      <TableHeader

        columns={columns}

        sortColumnIndex={
          sort.sortColumnIndex
        }

        sortDirection={
          sort.sortDirection
        }

        onSort={
          sort.handleSort
        }

      />


      <TableBody

        columns={columns}

        data={
          pagination.paginatedData
        }

        keyExtractor={
          keyExtractor
        }

        onRowClick={
          onRowClick
        }

        emptyMessage={
          emptyMessage
        }

      />


    </table>

  </div>



  {
    enablePagination &&

    <TablePagination

      currentPage={
        pagination.currentPage
      }

      totalPages={
        pagination.totalPages
      }

      pageSize={
        pagination.pageSize
      }

      totalRecords={
        pagination.totalRecords
      }

      startRecord={
        pagination.startRecord
      }

      endRecord={
        pagination.endRecord
      }

      getPageNumbers={
        pagination.getPageNumbers
      }

      setPageSize={
        pagination.setPageSize
      }

      setCurrentPage={
        pagination.setCurrentPage
      }

    />

  }


</div>

);


}
