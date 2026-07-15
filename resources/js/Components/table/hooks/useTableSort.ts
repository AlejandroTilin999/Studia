import {
 useMemo,
 useState
} from "react";

import {
 AppTableColumn
} from "../types/table.types";

import {
 getSortValue
} from "../utils/table.utils";


export function useTableSort<T>(
 data:T[],
 columns:AppTableColumn<T>[],
 enabled=true
){


const [
 sortColumnIndex,
 setSortColumnIndex
]=useState<number|null>(null);



const [
 sortDirection,
 setSortDirection
]=useState<
"asc"|"desc"|null
>(null);



const sortedData =
useMemo(()=>{


if(
 !enabled ||
 sortColumnIndex===null ||
 !sortDirection
){

 return data;

}



const column =
columns[sortColumnIndex];


return [...data].sort((a,b)=>{


let valueA =
getSortValue(a,column);


let valueB =
getSortValue(b,column);



if(typeof valueA==="string")
 valueA=valueA.toLowerCase();


if(typeof valueB==="string")
 valueB=valueB.toLowerCase();



if(valueA===valueB)
 return 0;



if(valueA===null ||
 valueA===undefined ||
 valueA==="")
 return 1;



if(valueB===null ||
 valueB===undefined ||
 valueB==="")
 return -1;



return sortDirection==="asc"
?
valueA > valueB ? 1 : -1
:
valueA < valueB ? 1 : -1;



});


},[
data,
columns,
sortColumnIndex,
sortDirection,
enabled
]);




function handleSort(
 index:number,
 column:AppTableColumn<T>
){


if(
 !enabled ||
 column.sortable===false
)
return;



if(sortColumnIndex===index){


 if(sortDirection==="asc"){

    setSortDirection("desc");

 }
 else if(sortDirection==="desc"){

    setSortColumnIndex(null);
    setSortDirection(null);

 }
 else{

    setSortDirection("asc");

 }


}else{

 setSortColumnIndex(index);
 setSortDirection("asc");

}



}



return {

 sortedData,

 sortColumnIndex,

 sortDirection,

 handleSort

};


}