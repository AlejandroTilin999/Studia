import { PhoneCall } from 'lucide-react';

const COLORS = {
    primary: "#0066CC",
    secondary: "#483D8B",
    accent: "#ffffffff",
}

export default function Topbar() {
    return (
        <div className=" text-white text-xs py-2 px-6 flex justify-between items-center" style={{ backgroundColor: COLORS.primary }}>

            <span
                className="flex items-center gap-2"
                style={{ color: COLORS.accent }}
            >
                <PhoneCall className='text-white' size={16} />
                Soporte: 800-PREPAHID-12
            </span>
            <div className="flex gap-4">
                <span style={{ color: COLORS.accent }}>Hidalgo, Michoacán</span>

            </div>
        </div>
    );
}