
import Link from 'next/link';
import { Layers3, Twitter, Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground">
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Layers3 className="h-8 w-8 text-primary" />
                        <span className="font-headline text-2xl font-bold text-foreground">PortfolioForge</span>
                    </div>
                    <p className="text-sm">The intelligent portfolio platform for every professional.</p>
                </div>
                <div>
                    <h3 className="font-headline font-semibold text-foreground mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="hover:underline hover:text-primary">About Us</Link></li>
                        <li><Link href="#" className="hover:underline hover:text-primary">Contact Us</Link></li>
                        <li><Link href="#" className="hover:underline hover:text-primary">Features</Link></li>
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
                <p>&copy; {new Date().getFullYear()} PortfolioForge. All Rights Reserved.</p>
            </div>
             <p className="text-xs text-center mt-4">
                Disclaimer: This site is a project and should be treated as such. The content is for demonstration purposes only.
            </p>
        </div>
      </footer>
  );
}
