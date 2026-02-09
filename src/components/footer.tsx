
import Link from 'next/link';
import { Layers3, Twitter, Github, Linkedin } from 'lucide-react';
import { Logo } from './logo';

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground">
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                    <Logo />
                    <p className="text-sm mt-4">The intelligent portfolio platform for every professional.</p>
                </div>
                <div>
                    <h3 className="font-headline font-semibold text-foreground mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/pricing" className="hover:underline hover:text-primary">Pricing</Link></li>
                        <li><Link href="/dashboard" className="hover:underline hover:text-primary">Dashboard</Link></li>
                        <li><Link href="/projects" className="hover:underline hover:text-primary">Portfolio Items</Link></li>
                        <li><Link href="/login" className="hover:underline hover:text-primary">Login</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-headline font-semibold text-foreground mb-4">Follow Us</h3>
                    <div className="flex space-x-4">
                        <Link href="#" className="hover:text-primary"><Twitter className="h-6 w-6" /></Link>
                        <Link href="#" className="hover:text-primary"><Github className="h-6 w-6" /></Link>
                        <Link href="#" className="hover:text-primary"><Linkedin className="h-6 w-6" /></Link>
                    </div>
                </div>
            </div>
            <div className="mt-8 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                <div className="flex gap-x-6 gap-y-2 flex-wrap justify-center md:justify-start mb-4 md:mb-0">
                    <Link href="/terms-and-conditions" className="hover:underline">Terms & Conditions</Link>
                    <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
                    <Link href="/cookie-policy" className="hover:underline">Cookie Policy</Link>
                </div>
                <p className="text-center md:text-right">&copy; {new Date().getFullYear()} PortfolioForge. All Rights Reserved.</p>
            </div>
        </div>
      </footer>
  );
}
