import { Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button'; // Asegúrate de que esta ruta sea la correcta en tu proyecto
import { Circle } from 'lucide-react';

const COLORS = {
    primary: "#0066CC",
    secondary: "#483D8B",
    accent: "#3CB371",
    circle:"#628bc4ff"
}

export default function Hero() {
    return (
        <header className="flex items-center justify-between px-16 py-12 h-[510px]" style={{ padding:"100px"}}>
            {/* Lado izquierdo */}
            <div className="w-1/2">
                <p className="text-slate-500 font-medium mb-4" style={{ fontSize: "20px" }}>Gestión Académica</p>
                <h1 className="text-6xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-slate-900 leading-tight" style={{ fontSize: "65px" }}>
                    Todo lo que necesitas <br />
                    para <span style={{ color: COLORS.primary }}>vida académica</span>
                </h1>
                <p className="mt-6 text-slate-500 max-w-sm text-xs md:text-xs lg:text-sm xl:text-xl" style={{ fontSize: "25px" }}>
                    La plataforma educativa diseñada para que tus materias y tareas sean tan únicas como tú.
                </p>
                {/* Usamos el componente Button reutilizable */}
                <Link href={route('login')}>
                    <Button className="mt-8 px-12 py-4 shadow-lg">
                        Inicia sesión en PREPAHID
                    </Button>
                </Link>
            </div>

            {/* Lado derecho */}
            <div className="w-1/2 flex justify-end relative">
                {/* Círculos decorativos */}
                <div 
                    className="absolute top-10 right-20 w-32 h-32 rounded-full blur-3xl opacity-40"
                    style={{ backgroundColor: COLORS.primary }}
                ></div>
                <div 
                    className="absolute bottom-10 right-10 w-40 h-60 rounded-full blur-3xl opacity-40"
                    style={{ backgroundColor: COLORS.secondary }}
                ></div>
                <div 
                    className="absolute top-20 right-80 w-80 h-60 rounded-full blur-3xl opacity-40"
                    style={{ backgroundColor: COLORS.circle }}
                ></div>

                
                <img 
                 
                    src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/appDownload/excitedWomenImage.png" 
                    alt="Estudiante" 
                    className="relative z-10 w-[800px] max-w-none" 
                />
            </div>
        </header>
    );
}