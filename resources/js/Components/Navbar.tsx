import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-transparent transition-all duration-300 relative z-50">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex justify-between items-center h-24">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <img src="/assets/phid_logo.png" className="w-40 sm:w-52 md:w-64 h-auto object-contain translate-y-1.5" alt="Logo"/>
                        </Link>
                    </div>

                    {/* Desktop Menu - Simplified */}
                    <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-500">
                        {/* No content as per request */}
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

            {/* Mobile Drawer - Simplified */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white absolute top-24 left-0 w-full p-6 space-y-4 shadow-sm animate-in slide-in-from-top-5 duration-200">
                    <div className="text-center text-slate-500 text-sm font-medium">
                        Portal PREPAHID
                    </div>
                </div>
            )}
        </nav>
    );
}
