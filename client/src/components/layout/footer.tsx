import { Link } from "wouter";
import { Dices, HelpCircle, Shield, Lock, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto max-w-7xl px-4 flex flex-col gap-4 py-10 md:flex-row md:py-8">
        <div className="flex-1">
          <div className="flex h-10 items-center space-x-2">
            <Dices className="h-6 w-6 text-primary" />
            <span className="font-bold">Sata Matka</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            A premier gaming platform for Sata Matka enthusiasts. Play, win, and enjoy a secure and 
            transparent betting experience.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/markets" className="transition-colors hover:text-primary">
                  Markets
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-primary">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Games</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">Jodi</span>
              </li>
              <li>
                <span className="text-muted-foreground">Hurf</span>
              </li>
              <li>
                <span className="text-muted-foreground">Cross</span>
              </li>
              <li>
                <span className="text-muted-foreground">Odd-Even</span>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help Center</span>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+91 1234567890</span>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>support@satamatka.com</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t py-6">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground md:order-1">
            © {new Date().getFullYear()} Sata Matka. All rights reserved.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Shield className="h-4 w-4 mr-1" /> 
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Lock className="h-4 w-4 mr-1" /> 
              <span>Privacy Protected</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
