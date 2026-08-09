import { useEffect, useMemo, useState } from "react";


export function useTablePagination<T>(
    data: T[],
    defaultPageSize = 10,
    enabled = true
) {

    const [pageSize, setPageSize] = useState(defaultPageSize);

    const [currentPage, setCurrentPage] = useState(1);



    const totalRecords = data.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalRecords / pageSize)
    );

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [data, totalPages, currentPage]);



    const paginatedData = useMemo(() => {


        if (!enabled) {
            return data;
        }


        const startIndex =
            (currentPage - 1) * pageSize;


        return data.slice(
            startIndex,
            startIndex + pageSize
        );


    }, [
        data,
        currentPage,
        pageSize,
        enabled
    ]);




    const startRecord =
        totalRecords === 0
            ? 0
            : (currentPage - 1) * pageSize + 1;



    const endRecord =
        Math.min(
            currentPage * pageSize,
            totalRecords
        );




    const getPageNumbers = () => {

        const pages:(number|string)[]=[];

        const delta = 1;


        pages.push(1);



        const start =
            Math.max(
                2,
                currentPage - delta
            );


        const end =
            Math.min(
                totalPages - 1,
                currentPage + delta
            );



        if(start > 2){
            pages.push("...");
        }



        for(
            let i=start;
            i<=end;
            i++
        ){

            pages.push(i);

        }



        if(end < totalPages - 1){

            pages.push("...");

        }



        if(totalPages > 1){

            pages.push(totalPages);

        }



        return pages;

    };




    return {

        paginatedData,

        totalRecords,

        totalPages,

        currentPage,

        setCurrentPage,

        pageSize,

        setPageSize,

        startRecord,

        endRecord,

        getPageNumbers

    };


}