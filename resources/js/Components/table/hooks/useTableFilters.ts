import { useMemo, useState } from "react";


export type TableFilter<T> = {
  key: keyof T;

  value: any;

  operator?:
    | "equals"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "greaterThan"
    | "lessThan";
};



export function useTableFilters<T>(
  data: T[]
) {


  const [
    filters,
    setFilters
  ] = useState<TableFilter<T>[]>([]);



  const filteredData = useMemo(() => {


    if(filters.length === 0){

      return data;

    }



    return data.filter((row)=>{


      return filters.every((filter)=>{


        const rowValue =
          row[filter.key];



        const filterValue =
          filter.value;



        switch(filter.operator){


          case "equals":

            return rowValue === filterValue;



          case "contains":

            return String(rowValue)
              .toLowerCase()
              .includes(
                String(filterValue)
                .toLowerCase()
              );



          case "startsWith":

            return String(rowValue)
              .toLowerCase()
              .startsWith(
                String(filterValue)
                .toLowerCase()
              );



          case "endsWith":

            return String(rowValue)
              .toLowerCase()
              .endsWith(
                String(filterValue)
                .toLowerCase()
              );



          case "greaterThan":

            return Number(rowValue) >
              Number(filterValue);



          case "lessThan":

            return Number(rowValue) <
              Number(filterValue);



          default:

            return String(rowValue)
              .toLowerCase()
              .includes(
                String(filterValue)
                .toLowerCase()
              );

        }


      });


    });


  },[
    data,
    filters
  ]);





  function addFilter(
    filter:TableFilter<T>
  ){

    setFilters(prev=>[
      ...prev,
      filter
    ]);

  }





  function removeFilter(
    key:keyof T
  ){

    setFilters(prev=>
      prev.filter(
        item=>item.key!==key
      )
    );

  }





  function clearFilters(){

    setFilters([]);

  }





  return {

    filteredData,

    filters,

    setFilters,

    addFilter,

    removeFilter,

    clearFilters

  };


}