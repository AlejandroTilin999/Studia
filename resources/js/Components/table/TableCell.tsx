import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}


export default function TableCell({
  children,
  align="left",
  className
}:Props){


const alignClass =
align==="right"
? "text-right pr-6"
:
align==="center"
? "text-center"
:
"text-left pl-6";


return (

<td
className={cn(
"h-14 text-[13px] font-normal text-slate-600 whitespace-nowrap",
alignClass,
className
)}
>

{children}

</td>

);


}
