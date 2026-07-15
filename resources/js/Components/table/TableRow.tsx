import { cn } from "@/lib/utils";


interface Props {

children:React.ReactNode;

onClick?:()=>void;

className?:string;

}


export default function TableRow({
children,
onClick,
className
}:Props){


return (

<tr

onClick={onClick}

className={cn(
"border-b border-slate-100 transition-colors",
onClick
?"cursor-pointer"
:"cursor-default",
"hover:bg-blue-50/30",
className
)}

>

{children}

</tr>

);


}