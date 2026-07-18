import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, X, PhoneCall } from 'lucide-react';
import Button from '@/Components/ui/button';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-transparent transition-all duration-300 relative z-50">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex justify-between items-center h-24">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <img src="/assets/phid_logo.png" className="w-52 md:w-64 h-auto object-contain translate-y-1.5" alt="Logo"/>
                        </Link>
                    </div>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-500">
                        <span className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                            <PhoneCall size={14} className="text-blue-600" />
                            Soporte: 800-PREPAHID-12
                        </span>
                        <span className="text-slate-200">|</span>
                        <span className="text-slate-500 font-medium text-xs">
                            Hidalgo, Michoacán
                        </span>
                        <Button className="px-6 py-2.5 cursor-default select-none hover:scale-100 hover:opacity-100">
                            Bienvenido a PREPAHID
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                            aria-label="Toggle Menu"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white absolute top-24 left-0 w-full p-6 space-y-4 shadow-sm animate-in slide-in-from-top-5 duration-200">
                    <div className="flex flex-col gap-2 pb-2 border-b border-slate-100 text-slate-500 text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                            <PhoneCall size={14} className="text-blue-600" />
                            Soporte: 800-PREPAHID-12
                        </span>
                        <span>Hidalgo, Michoacán</span>
                    </div>
                    <Button className="w-full py-3 flex items-center justify-center cursor-default select-none hover:scale-100 hover:opacity-100">
                        Bienvenido a PREPAHID
                    </Button>
                </div>
            )}
        </nav>
    );
}
