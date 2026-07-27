interface Props{

message:React.ReactNode;

colSpan:number;

}


export default function TableEmpty({
message,
colSpan
}:Props){


return (

<tr>

<td

colSpan={colSpan}

className="
h-24
text-center
text-slate-400
font-medium
text-xs
"

>

{message}

</td>

</tr>

);


}
