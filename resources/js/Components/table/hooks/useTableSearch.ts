import { 
  useMemo,
  useState
} from "react";



export function useTableSearch<T>(
  data:T[],
  searchableKeys?: (keyof T)[]
){



const [
 search,
 setSearch
]=useState("");





const searchedData =
useMemo(()=>{


 if(!search.trim()){

    return data;

 }




 const value =
 search
 .toLowerCase()
 .trim();





 return data.filter((row)=>{



   if(searchableKeys?.length){


      return searchableKeys.some(
        (key)=>{


          const field =
          row[key];


          return String(field)
          .toLowerCase()
          .includes(value);


        }
      );


   }





   // Si no se mandan campos,
   // busca automáticamente en todo el objeto

   return Object.values(row as any)
   .some(field=>

      String(field)
      .toLowerCase()
      .includes(value)

   );



 });



},[
 data,
 search,
 searchableKeys
]);







function clearSearch(){

 setSearch("");

}






return {


 search,

 setSearch,

 searchedData,

 clearSearch


};


}