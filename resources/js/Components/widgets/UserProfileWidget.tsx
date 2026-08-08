interface UserProfileWidgetProps {
  name: string;
  role: string;
}

export default function UserProfileWidget({ name, role }: UserProfileWidgetProps) {
  return (
    <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100">
      <div className="flex flex-col text-left">
        <span className="text-[17px] font-extrabold text-slate-800 leading-tight">{name}</span>
        <span className="text-xs font-bold text-slate-400 mt-0.5">{role}</span>
      </div>
      <img
        alt={name}
        className="w-12 h-12 rounded-full border border-slate-100 object-cover shadow-sm"
      />
    </div>
  );
}
