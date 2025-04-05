import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { User, insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, 
  FormLabel, FormMessage 
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Sheet, SheetClose, SheetContent, SheetDescription,
  SheetFooter, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { 
  Loader2, Plus, Shield, UserPlus, LockIcon, UnlockIcon, 
  User as UserIcon, Mail, Phone, Wallet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { format } from "date-fns";

// Create user form schema
const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["admin", "subadmin", "player"], {
    required_error: "Role is required",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(user?.role === 'subadmin' ? 'players' : 'all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch all users
  const { 
    data: users,
    isLoading: isUsersLoading
  } = useQuery({
    queryKey: ['/api/users'],
    queryFn: getQueryFn<User[]>({ on401: "throw" }),
  });

  // Initialize form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      role: "player",
    },
  });

  // Mutation for creating a user
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      return apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "The user has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      form.reset({
        username: "",
        password: "",
        name: "",
        email: "",
        phone: "",
        role: "player",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create user",
        description: error.message || "An error occurred while creating the user",
        variant: "destructive",
      });
    },
  });

  // Mutation for blocking a user
  const blockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/users/${userId}/block`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      toast({
        title: "User blocked",
        description: "The user has been blocked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to block user",
        description: error.message || "An error occurred while blocking the user",
        variant: "destructive",
      });
    },
  });

  // Mutation for unblocking a user
  const unblockUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/users/${userId}/unblock`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      toast({
        title: "User unblocked",
        description: "The user has been unblocked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unblock user",
        description: error.message || "An error occurred while unblocking the user",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: UserFormValues) => {
    createUserMutation.mutate(data);
  };

  // Filter users based on active tab and user role
  const filteredUsers = users?.filter(u => {
    if (user?.role === 'subadmin') {
      // Subadmins can only see their own players
      return u.subadmin_id === user.id;
    }
    
    if (activeTab === 'all') return true;
    if (activeTab === 'admins') return u.role === 'admin';
    if (activeTab === 'subadmins') return u.role === 'subadmin';
    if (activeTab === 'players') return u.role === 'player';
    if (activeTab === 'blocked') return u.status === 'blocked';
    
    return true;
  });

  // User role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'subadmin': return 'default';
      case 'player': return 'outline';
      default: return 'secondary';
    }
  };

  if (isUsersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === 'admin' 
              ? "Manage all users on the platform" 
              : "Manage your players and their accounts"}
          </p>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" /> Add User
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New User</SheetTitle>
              <SheetDescription>
                Add a new user to the platform
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} />
                        </FormControl>
                        <FormDescription>
                          Username must be unique
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Must be at least 6 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                          disabled={user?.role === 'subadmin'} // Subadmins can only create players
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {user?.role === 'admin' && (
                              <>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="subadmin">Subadmin</SelectItem>
                              </>
                            )}
                            <SelectItem value="player">Player</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {user?.role === 'admin' 
                            ? "Select the user's role on the platform" 
                            : "As a subadmin, you can only create players"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <SheetFooter className="pt-4">
                    <SheetClose asChild>
                      <Button variant="outline" type="button">Cancel</Button>
                    </SheetClose>
                    <Button 
                      type="submit" 
                      disabled={createUserMutation.isPending}
                    >
                      {createUserMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                        </>
                      ) : "Create User"}
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
          {user?.role === 'admin' && (
            <>
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="admins">Admins</TabsTrigger>
              <TabsTrigger value="subadmins">Subadmins</TabsTrigger>
            </>
          )}
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {!filteredUsers || filteredUsers.length === 0 ? (
            <Card className="text-center py-10">
              <CardContent>
                <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <UserPlus className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'all' 
                    ? "No users have been created yet." 
                    : `No ${activeTab} found. Add a new user to get started.`}
                </p>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" /> Add User
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    {/* Sheet content is reused */}
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption>
                  {activeTab === 'all' 
                    ? "A list of all users on the platform" 
                    : `A list of all ${activeTab}`}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    {user?.role === 'admin' && <TableHead>Assigned To</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-sm text-muted-foreground">{u.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(u.role)}>
                          {u.role.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.status === 'blocked' ? 'destructive' : 'outline'}>
                          {u.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{u.wallet_balance.toFixed(2)}</TableCell>
                      {user?.role === 'admin' && (
                        <TableCell>
                          {u.role === 'player' && u.subadmin_id 
                            ? `Subadmin #${u.subadmin_id}` 
                            : '-'}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <UserIcon className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information about {u.name}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="py-4">
                                <div className="flex flex-col gap-4">
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium">{u.name}</p>
                                      <p className="text-sm text-muted-foreground">Username: {u.username}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium">Role: {u.role.toUpperCase()}</p>
                                      <p className="text-sm text-muted-foreground">Status: {u.status.toUpperCase()}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <p>{u.email}</p>
                                  </div>
                                  
                                  {u.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      <p>{u.phone}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">Wallet Balance: ₹{u.wallet_balance.toFixed(2)}</p>
                                  </div>
                                  
                                  {u.created_at && (
                                    <p className="text-sm text-muted-foreground">
                                      Joined: {format(new Date(u.created_at), 'PPP')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Close</Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          {/* Block/Unblock button - only show if: 
                              - Admin can block/unblock anyone except other admins
                              - Subadmin can only block/unblock their own players 
                          */}
                          {((user?.role === 'admin' && u.role !== 'admin') || 
                             (user?.role === 'subadmin' && u.role === 'player' && u.subadmin_id === user.id)) && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                  {u.status === 'blocked' 
                                    ? <UnlockIcon className="h-4 w-4 text-green-600" /> 
                                    : <LockIcon className="h-4 w-4 text-destructive" />}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    {u.status === 'blocked' ? 'Unblock User' : 'Block User'}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {u.status === 'blocked' 
                                      ? `Are you sure you want to unblock ${u.name}?`
                                      : `Are you sure you want to block ${u.name}?`}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="py-4">
                                  <p className="text-sm">
                                    {u.status === 'blocked' 
                                      ? "Unblocking will restore the user's access to the platform."
                                      : "Blocking will prevent the user from accessing the platform."}
                                  </p>
                                </div>
                                
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button 
                                    variant={u.status === 'blocked' ? 'default' : 'destructive'}
                                    onClick={() => {
                                      if (u.status === 'blocked') {
                                        unblockUserMutation.mutate(u.id);
                                      } else {
                                        blockUserMutation.mutate(u.id);
                                      }
                                    }}
                                    disabled={blockUserMutation.isPending || unblockUserMutation.isPending}
                                  >
                                    {blockUserMutation.isPending || unblockUserMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                        {u.status === 'blocked' ? "Unblocking..." : "Blocking..."}
                                      </>
                                    ) : u.status === 'blocked' ? "Unblock User" : "Block User"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}