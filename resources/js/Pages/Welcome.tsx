import Topbar from '@/Components/Topbar';
import Navbar from '@/Components/navbar';
import Hero from '@/Components/Hero';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-white" >
            <Topbar />
            <Navbar />
            <Hero />
        </div>
    );
}