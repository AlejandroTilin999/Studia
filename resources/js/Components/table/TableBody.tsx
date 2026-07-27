import TableRow from "./TableRow";
import TableCell from "./TableCell";
import TableEmpty from "./TableEmpty";


import {
AppTableColumn
} from "./types/table.types";


interface Props<T>{

columns:AppTableColumn<T>[];

data:T[];

keyExtractor:
(item:T,index:number)=>string|number;

onRowClick?:
(item:T,index:number)=>void;

emptyMessage:React.ReactNode;

}



export default function TableBody<T>({
columns,
data,
keyExtractor,
onRowClick,
emptyMessage
}:Props<T>){



return (

<tbody>


{
data.length===0

?

<TableEmpty
message={emptyMessage}
colSpan={columns.length}
/>


:

data.map((row,index)=>(


<TableRow

key={keyExtractor(row,index)}

onClick={()=>
onRowClick?.(row,index)
}

>


{
columns.map((column,colIndex)=>{


let content;


if(typeof column.accessor==="function"){

content=
column.accessor(row,index);


}
else if(column.accessor){

content=
String(
row[column.accessor] ?? ""
);

}



return (

<TableCell

key={colIndex}

align={column.align}

className={column.className}

>

{content}

</TableCell>

);


})

}


</TableRow>


))


}


</tbody>

);


}
