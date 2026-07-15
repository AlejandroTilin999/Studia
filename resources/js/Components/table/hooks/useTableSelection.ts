import {
  useMemo,
  useState
} from "react";



export function useTableSelection<T>(
  data:T[],
  keyExtractor:(item:T,index:number)=>string|number
){



const [
 selectedKeys,
 setSelectedKeys
]=useState<(string|number)[]>([]);





// Verifica si un registro está seleccionado

function isSelected(
 key:string|number
){

 return selectedKeys.includes(key);

}





// Seleccionar / quitar selección individual

function toggleSelection(
 item:T,
 index:number
){


 const key =
 keyExtractor(item,index);



 setSelectedKeys(prev=>{


   if(prev.includes(key)){


      return prev.filter(
        item=>item!==key
      );


   }


   return [
    ...prev,
    key
   ];


 });



}






// Seleccionar todos

function selectAll(){


 setSelectedKeys(
   data.map(
    (item,index)=>
      keyExtractor(item,index)
   )
 );


}







// Limpiar selección

function clearSelection(){

 setSelectedKeys([]);

}







// Alternar todos

function toggleAll(){



 if(
   selectedKeys.length===data.length
 ){

    clearSelection();

 }
 else{

    selectAll();

 }


}







// Registros completos seleccionados

const selectedItems =
useMemo(()=>{


 return data.filter(
  (item,index)=>

   selectedKeys.includes(
     keyExtractor(item,index)
   )

 );


},[
 data,
 selectedKeys
]);








return {


 selectedKeys,


 selectedItems,


 isSelected,


 toggleSelection,


 selectAll,


 toggleAll,


 clearSelection,


 hasSelection:
 selectedKeys.length>0,


 allSelected:
 data.length>0 &&
 selectedKeys.length===data.length



};


}