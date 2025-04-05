import { Link } from "wouter";
import { Plane, Github, Twitter, Info } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-4 py-10 md:flex-row md:py-8">
        <div className="flex-1">
          <div className="flex h-10 items-center space-x-2">
            <Plane className="h-6 w-6" />
            <span className="font-bold">NextJS Starter</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/documentation" className="transition-colors hover:text-foreground/80">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/components" className="transition-colors hover:text-foreground/80">
                  Components
                </Link>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground/80">
                  Examples
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://nextjs.org" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="transition-colors hover:text-foreground/80"
                >
                  NextJS
                </a>
              </li>
              <li>
                <a 
                  href="https://tailwindcss.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="transition-colors hover:text-foreground/80"
                >
                  Tailwind CSS
                </a>
              </li>
              <li>
                <a 
                  href="https://ui.shadcn.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="transition-colors hover:text-foreground/80"
                >
                  Shadcn UI
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Social</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="transition-colors hover:text-foreground/80"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="transition-colors hover:text-foreground/80"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="transition-colors hover:text-foreground/80"
                >
                  Discord
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground md:order-1">
            © {new Date().getFullYear()} NextJS Starter. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
              <Info className="h-5 w-5" />
              <span className="sr-only">Discord</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
