import {
 AppTableColumn
} from "../types/table.types";


export function getSortValue<T>(
 row:T,
 column:AppTableColumn<T>
){


 if(column.sortKey){

   return typeof column.sortKey === "function"
    ? column.sortKey(row)
    : (row as any)[column.sortKey];

 }



 if(typeof column.accessor === "string"){

    return (row as any)[column.accessor];

 }



 if(typeof column.accessor === "function"){

    const value =
      column.accessor(row,0);


    if(
      typeof value === "string" ||
      typeof value === "number"
    ){

      return value;

    }

 }



const keys=[
"name",
"nombre",
"title",
"code",
"matricula",
"employee_code"
];


for(const key of keys){

 if(key in (row as any)){

    return (row as any)[key];

 }

}


return "";

}