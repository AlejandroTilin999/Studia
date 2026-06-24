import Button from '@/Components/ui/Button';
import { Link } from '@inertiajs/react';

const COLORS = {
    primary: "#7d9eebff",
    secondary: "#483D8B",
    accent: "#3CB371",
}

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center px-16 py-8" style={{ paddingLeft:"100px", paddingRight:"100px"}}>
            <img src="/assets/logo-ph.webp" className="w-48" alt="Logo"/>
            
            <div className="flex gap-8 font-medium text-slate-500">
               
            </div>

            {/* Utilizamos el componente reutilizable aquí */}
            <Link href={route('login')}>
                <Button className="px-6 py-2">
                    Bienvenido a PREPAHID
                </Button>
            </Link>

        </nav>
    );
}