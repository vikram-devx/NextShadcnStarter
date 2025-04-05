import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Info, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  CreditCard 
} from "lucide-react";

export default function ComponentShowcase() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Component Showcase
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Explore the Shadcn UI components available in this starter template.
            </p>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Various button styles for different actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="gap-2">
                  <ChevronRight className="h-4 w-4" />
                  With Icon
                </Button>
                <Button variant="outline" disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Form Inputs */}
          <Card>
            <CardHeader>
              <CardTitle>Form Inputs</CardTitle>
              <CardDescription>Input components for user data collection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="showcase-name">Name</Label>
                <Input id="showcase-name" className="mt-2" placeholder="Enter your name" />
              </div>
              <div>
                <Label htmlFor="showcase-email">Email</Label>
                <Input id="showcase-email" className="mt-2" type="email" placeholder="Enter your email" />
              </div>
              <div>
                <Label htmlFor="showcase-country">Country</Label>
                <Select>
                  <SelectTrigger id="showcase-country" className="mt-2">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="showcase-terms" />
                <Label htmlFor="showcase-terms" className="text-sm font-medium">
                  I agree to the terms and conditions
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>Notification components for user feedback.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-5 w-5" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  This is an informational alert.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was a problem with your request.
                </AlertDescription>
              </Alert>
              <Alert className="bg-green-500/10 text-green-600 border-green-500/20">
                <Check className="h-5 w-5" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your changes have been saved successfully.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Card 4: Feature Cards */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Featured Cards</CardTitle>
              <CardDescription>Showcase your features with these cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Easy Payments</h3>
                    <p className="text-sm text-muted-foreground">
                      Integrate payment processing easily with our secure payment system.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Accessible Components</h3>
                    <p className="text-sm text-muted-foreground">
                      All components are built with accessibility in mind for all users.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                      <Info className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Detailed Documentation</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive documentation to help you get started quickly.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
