import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Documentation() {
  return (
    <div className="container py-12 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Documentation
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Learn how to use this starter template to build your Next.js applications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2 mb-8">
                <h3 className="text-lg font-medium">Contents</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#getting-started" className="text-primary hover:underline">Getting Started</a>
                  </li>
                  <li>
                    <a href="#components" className="text-primary hover:underline">Components</a>
                  </li>
                  <li>
                    <a href="#styling" className="text-primary hover:underline">Styling</a>
                  </li>
                  <li>
                    <a href="#typescript" className="text-primary hover:underline">TypeScript</a>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Next.js Documentation</a>
                  </li>
                  <li>
                    <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Tailwind CSS Documentation</a>
                  </li>
                  <li>
                    <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Shadcn UI Documentation</a>
                  </li>
                  <li>
                    <a href="https://www.typescriptlang.org/docs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TypeScript Documentation</a>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-9">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="installation">Installation</TabsTrigger>
                  <TabsTrigger value="customization">Customization</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div id="getting-started">
                    <h2 className="text-2xl font-bold">Getting Started</h2>
                    <p className="text-muted-foreground mt-2">
                      This starter template includes everything you need to build modern web applications 
                      with Next.js, TypeScript, Tailwind CSS, and Shadcn UI.
                    </p>

                    <div className="mt-4 space-y-4">
                      <h3 className="text-xl font-medium">Features</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Next.js for server-rendered React applications</li>
                        <li>TypeScript for type safety</li>
                        <li>Tailwind CSS for utility-first styling</li>
                        <li>Shadcn UI components built with Radix UI</li>
                        <li>ESLint for code quality</li>
                        <li>Responsive layouts for all devices</li>
                      </ul>
                    </div>
                  </div>

                  <div id="components" className="pt-6">
                    <h2 className="text-2xl font-bold">Components</h2>
                    <p className="text-muted-foreground mt-2">
                      This template includes a variety of pre-built components from Shadcn UI that you can use in your projects.
                    </p>

                    <div className="mt-4 space-y-2">
                      <p>Visit the <a href="/components" className="text-primary hover:underline">components page</a> to see all available components.</p>
                      <p>Each component is built with accessibility and customization in mind.</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="installation" className="space-y-6">
                  <h2 className="text-2xl font-bold">Installation</h2>
                  <p className="text-muted-foreground">
                    Follow these steps to create a new project with this starter template.
                  </p>

                  <div className="space-y-4 mt-6">
                    <div>
                      <h3 className="text-lg font-medium">1. Create a Next.js project</h3>
                      <div className="bg-muted rounded-md p-4 mt-2">
                        <pre className="text-sm font-mono overflow-x-auto">
                          <code>npx create-next-app@latest my-app --typescript</code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">2. Install Tailwind CSS</h3>
                      <div className="bg-muted rounded-md p-4 mt-2">
                        <pre className="text-sm font-mono overflow-x-auto">
                          <code>npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p</code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">3. Add Shadcn UI</h3>
                      <div className="bg-muted rounded-md p-4 mt-2">
                        <pre className="text-sm font-mono overflow-x-auto">
                          <code>npx shadcn-ui@latest init</code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">4. Install components</h3>
                      <div className="bg-muted rounded-md p-4 mt-2">
                        <pre className="text-sm font-mono overflow-x-auto">
                          <code>npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="customization" className="space-y-6">
                  <h2 className="text-2xl font-bold">Customization</h2>
                  <p className="text-muted-foreground">
                    This template is built to be customized to your needs. Here are some ways you can customize it.
                  </p>

                  <div id="styling" className="space-y-4 mt-6">
                    <h3 className="text-xl font-medium">Styling</h3>
                    <p>
                      Customizing the look and feel of your application is easy with Tailwind CSS and the Shadcn UI theme.
                    </p>
                    <div className="bg-muted rounded-md p-4 mt-2">
                      <pre className="text-sm font-mono overflow-x-auto">
                        <code>{`// In tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Customize your colors here
        primary: {...},
        secondary: {...},
      },
      // Add other customizations
    },
  },
}`}</code>
                      </pre>
                    </div>
                  </div>

                  <div id="typescript" className="space-y-4 mt-6">
                    <h3 className="text-xl font-medium">TypeScript</h3>
                    <p>
                      TypeScript configuration can be customized in the tsconfig.json file.
                    </p>
                    <div className="bg-muted rounded-md p-4 mt-2">
                      <pre className="text-sm font-mono overflow-x-auto">
                        <code>{`// In tsconfig.json
{
  "compilerOptions": {
    // Your custom options
    "strict": true,
    "esModuleInterop": true
  }
}`}</code>
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-lg font-medium mb-4">Ready to start building?</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Button>Get Started</Button>
          <Button variant="outline">View on GitHub</Button>
        </div>
      </div>
    </div>
  );
}
