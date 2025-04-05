import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Dices } from "lucide-react";

// Extending the insert schema with additional validation
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const registerSchema = insertUserSchema.omit({
  id: true,
  created_at: true, 
  updated_at: true,
  status: true,
  wallet_balance: true,
  subadmin_id: true,
}).extend({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Redirect to dashboard if already logged in
  if (user) {
    navigate("/dashboard");
    return null;
  }
  
  // Login form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form setup
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "player",
    },
  });
  
  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    }
  };
  
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    // Remove confirmPassword as it's not part of our API model
    const { confirmPassword, ...registerData } = data;
    
    try {
      await registerMutation.mutateAsync(registerData);
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 min-h-screen flex items-center justify-center">
      <div className="grid gap-8 lg:grid-cols-2 w-full">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome to Sata Matka</CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" ? "Sign in to your account" : "Create a new account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                    
                    {/* Demo credentials section */}
                    <div className="text-center text-sm text-muted-foreground mt-4">
                      <p>Demo credentials</p>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="border rounded p-2 text-xs">
                          <div className="font-semibold">Admin</div>
                          <div>username: admin</div>
                          <div>password: admin123</div>
                        </div>
                        <div className="border rounded p-2 text-xs">
                          <div className="font-semibold">Subadmin</div>
                          <div>username: subadmin</div>
                          <div>password: subadmin123</div>
                        </div>
                        <div className="border rounded p-2 text-xs">
                          <div className="font-semibold">Player</div>
                          <div>username: player</div>
                          <div>password: player123</div>
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Choose a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Hidden role field defaulting to player */}
                    <input type="hidden" {...registerForm.register("role")} value="player" />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Hero section */}
        <div className="hidden lg:flex flex-col justify-center space-y-6">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-primary/20 p-6 rounded-full">
              <Dices className="h-20 w-20 text-primary" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl/tight lg:text-5xl/tight text-center">
            Experience the Thrill of Sata Matka
          </h1>
          
          <p className="text-muted-foreground text-center text-lg">
            Join thousands of players on the most reliable and transparent Matka gaming platform.
          </p>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-card/50">
              <h3 className="font-medium">Secure Transactions</h3>
              <p className="text-sm text-muted-foreground">Your money is safe with our secure payment system.</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-card/50">
              <h3 className="font-medium">Multiple Game Types</h3>
              <p className="text-sm text-muted-foreground">Play Jodi, Hurf, Cross, and Odd-Even games.</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-card/50">
              <h3 className="font-medium">Instant Payouts</h3>
              <p className="text-sm text-muted-foreground">Get your winnings instantly in your wallet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}