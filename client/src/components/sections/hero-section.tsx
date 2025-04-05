import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Next.js + TypeScript + Tailwind + Shadcn UI
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              A complete starter template with everything you need to build modern web applications.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/documentation">
              <Button>Get Started</Button>
            </Link>
            <Link href="/components">
              <Button variant="outline">Components</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
