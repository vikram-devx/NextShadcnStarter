import { Card, CardContent } from "@/components/ui/card";

export default function GettingStarted() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Get Started with NextJS and Shadcn UI
            </h2>
            <p className="mt-4 text-muted-foreground md:text-xl">
              Follow these simple steps to get started with your Next.js project using Shadcn UI components.
            </p>
            <div className="mt-8 space-y-8">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">1</div>
                <div>
                  <h3 className="font-bold">Create a new Next.js project</h3>
                  <p className="text-muted-foreground">Use create-next-app to initialize a new TypeScript project.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">2</div>
                <div>
                  <h3 className="font-bold">Install Tailwind CSS</h3>
                  <p className="text-muted-foreground">Configure Tailwind CSS for your project.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">3</div>
                <div>
                  <h3 className="font-bold">Add Shadcn UI Components</h3>
                  <p className="text-muted-foreground">Install and configure Shadcn UI for your project.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">4</div>
                <div>
                  <h3 className="font-bold">Start building</h3>
                  <p className="text-muted-foreground">Add your components and start building your application.</p>
                </div>
              </div>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Installation Commands</h3>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                    <code>npx create-next-app@latest my-app --typescript</code>
                  </pre>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                    <code>npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p</code>
                  </pre>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                    <code>npx shadcn-ui@latest init</code>
                  </pre>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                    <code>npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
