import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Bet, Transaction, Market, User, GameType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, TrendingUp, Wallet, Calendar, Clock, Users, Activity,
  CreditCard, LineChart, CircleDollarSign, Award, CheckSquare, Dices,
  UserCog, UserPlus, Settings, PlusCircle
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress"; 

// Admin-specific dashboard content
function AdminDashboard({ 
  user, 
  activeMarkets = [], 
  pendingTransactions = [], 
  recentTransactions = []
}) {
  // Fetch additional data for admin dashboard
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: getQueryFn<User[]>({ on401: "returnNull" }),
  });

  const { data: gameTypes = [] } = useQuery({
    queryKey: ['/api/game-types'],
    queryFn: getQueryFn<GameType[]>({ on401: "returnNull" }),
  });

  // Calculate statistics
  const totalUsers = users.length;
  const playerCount = users.filter(u => u.role === 'player').length;
  const subadminCount = users.filter(u => u.role === 'subadmin').length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const blockedUsers = users.filter(u => u.status === 'blocked').length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Complete administrative control of your Sata Matka platform
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{user?.wallet_balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Administrator account balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Players: {playerCount}</span>
                <span>Subadmins: {subadminCount}</span>
              </div>
              <Progress value={(playerCount / totalUsers) * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Markets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMarkets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Markets open for betting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTransactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">User Management</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <UserCog className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm">Manage subadmins and users</p>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" className="w-full">
                <Link href="/users">View Users</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Market Management</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <Dices className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm">Manage markets and results</p>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" className="w-full">
                <Link href="/markets">View Markets</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Game Types</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <Settings className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm">Manage game types and rules</p>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" className="w-full">
                <Link href="/game-types">Configure</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Transactions</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <CreditCard className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm">Approve and manage transactions</p>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" className="w-full">
                <Link href="/transactions">View All</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="markets" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="markets">Active Markets</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        {/* Active Markets Tab */}
        <TabsContent value="markets">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Active Markets</h3>
            <Button asChild size="sm">
              <Link href="/markets">
                <PlusCircle className="h-4 w-4 mr-2" /> Create Market
              </Link>
            </Button>
          </div>
          
          {activeMarkets.length === 0 ? (
            <p className="text-muted-foreground">No active markets at the moment.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeMarkets.map((market) => (
                <Card key={market.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{market.name}</CardTitle>
                      <Badge variant="secondary">Open</Badge>
                    </div>
                    <CardDescription>
                      {market.open_time && market.close_time ? 
                        `${format(new Date(market.open_time), 'h:mm a')} - ${format(new Date(market.close_time), 'h:mm a')}` : 
                        "Schedule not set"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Open Time</p>
                        <p className="text-sm text-muted-foreground">
                          {market.open_time ? format(new Date(market.open_time), 'PPP') : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Close Time</p>
                        <p className="text-sm text-muted-foreground">
                          {market.close_time ? format(new Date(market.close_time), 'PPP') : "Not set"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/markets/${market.id}`}>Manage</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Recent Transactions</h3>
            <Button asChild size="sm">
              <Link href="/transactions">View All</Link>
            </Button>
          </div>
          
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground">No recent transactions.</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), 'PPP')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {transaction.type === 'deposit' || transaction.type === 'winning' 
                            ? '+' : '-'}
                          ₹{transaction.amount.toFixed(2)}
                        </p>
                        <Badge variant={
                          transaction.status === 'approved' ? 'outline' : 
                          transaction.status === 'rejected' ? 'destructive' : 
                          'outline'
                        }>
                          {transaction.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {transaction.remarks && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {transaction.remarks}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Pending Approvals Tab */}
        <TabsContent value="pending">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Pending Approvals</h3>
            <Button asChild size="sm">
              <Link href="/transactions">Manage All</Link>
            </Button>
          </div>
          
          {pendingTransactions.length === 0 ? (
            <p className="text-muted-foreground">No pending approvals.</p>
          ) : (
            <div className="space-y-4">
              {pendingTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          User #{transaction.user_id} - {transaction.type.toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), 'PPP p')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{transaction.amount.toFixed(2)}</p>
                        <Badge variant="outline">PENDING</Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button asChild size="sm">
                      <Link href={`/transactions?id=${transaction.id}`}>Manage</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">User Management</h3>
            <Button asChild size="sm">
              <Link href="/users">
                <UserPlus className="h-4 w-4 mr-2" /> Add User
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>User Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Active Users</span>
                      <span>{activeUsers} / {totalUsers}</span>
                    </div>
                    <Progress value={(activeUsers / totalUsers) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Blocked Users</span>
                      <span>{blockedUsers} / {totalUsers}</span>
                    </div>
                    <Progress value={(blockedUsers / totalUsers) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-primary mr-2"></div>
                      <span>Players</span>
                    </div>
                    <span>{playerCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-purple-500 mr-2"></div>
                      <span>Subadmins</span>
                    </div>
                    <span>{subadminCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-red-500 mr-2"></div>
                      <span>Admins</span>
                    </div>
                    <span>1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <h4 className="font-medium mb-4">Recently Added Users</h4>
          <div className="space-y-4">
            {users.slice(0, 5).map(user => (
              <Card key={user.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.username} - {user.email}</p>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={user.status === 'active' ? 'outline' : 'destructive'} className="mr-2">
                      {user.status.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary">{user.role.toUpperCase()}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

// Subadmin-specific dashboard content
function SubadminDashboard({ 
  user, 
  activeMarkets = [], 
  pendingTransactions = [], 
  recentTransactions = [] 
}) {
  // Fetch subadmin's users
  const { data: managedUsers = [] } = useQuery({
    queryKey: ['/api/users/subadmin', user?.id],
    queryFn: getQueryFn<User[]>({ on401: "returnNull" }),
    enabled: !!user
  });
  
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Subadmin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your players and process transactions
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{user?.wallet_balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Your account balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managedUsers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Players under your management
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Markets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMarkets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Markets open for betting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTransactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Transactions awaiting your approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">My Players</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <UserCog className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm">Manage your players</p>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" className="w-full">
                <Link href="/users">View Players</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Add Player</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <UserPlus className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm">Create a new player</p>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" className="w-full">
                <Link href="/users?new=true">Add New</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Deposits/Withdrawals</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <CreditCard className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm">Approve player transactions</p>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" className="w-full">
                <Link href="/transactions">Manage</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">My Transactions</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <CircleDollarSign className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm">Request deposits/withdrawals</p>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" className="w-full">
                <Link href="/transactions?personal=true">View</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="players" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="players">My Players</TabsTrigger>
          <TabsTrigger value="markets">Active Markets</TabsTrigger>
          <TabsTrigger value="transactions">My Transactions</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
        </TabsList>
        
        {/* My Players Tab */}
        <TabsContent value="players">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">My Players</h3>
            <Button asChild size="sm">
              <Link href="/users?new=true">
                <UserPlus className="h-4 w-4 mr-2" /> Add Player
              </Link>
            </Button>
          </div>
          
          {managedUsers.length === 0 ? (
            <p className="text-muted-foreground">You don't have any players assigned to you yet.</p>
          ) : (
            <div className="space-y-4">
              {managedUsers.map(player => (
                <Card key={player.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">{player.username} - {player.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <p className="font-medium">₹{player.wallet_balance.toFixed(2)}</p>
                      </div>
                      <Badge variant={player.status === 'active' ? 'outline' : 'destructive'}>
                        {player.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/users/${player.id}`}>
                        Manage
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Active Markets Tab */}
        <TabsContent value="markets">
          <h3 className="text-xl font-semibold mb-4">Active Markets</h3>
          {activeMarkets.length === 0 ? (
            <p className="text-muted-foreground">No active markets at the moment.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeMarkets.map((market) => (
                <Card key={market.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{market.name}</CardTitle>
                      <Badge variant="secondary">Open</Badge>
                    </div>
                    <CardDescription>
                      {market.open_time && market.close_time ? 
                        `${format(new Date(market.open_time), 'h:mm a')} - ${format(new Date(market.close_time), 'h:mm a')}` : 
                        "Schedule not set"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Open Time</p>
                        <p className="text-sm text-muted-foreground">
                          {market.open_time ? format(new Date(market.open_time), 'PPP') : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Close Time</p>
                        <p className="text-sm text-muted-foreground">
                          {market.close_time ? format(new Date(market.close_time), 'PPP') : "Not set"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/markets/${market.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* My Transactions Tab */}
        <TabsContent value="transactions">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">My Transactions</h3>
            <Button asChild size="sm">
              <Link href="/transactions?personal=true">View All</Link>
            </Button>
          </div>
          
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground">No recent transactions.</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), 'PPP')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {transaction.type === 'deposit' || transaction.type === 'winning' 
                            ? '+' : '-'}
                          ₹{transaction.amount.toFixed(2)}
                        </p>
                        <Badge variant={
                          transaction.status === 'approved' ? 'outline' : 
                          transaction.status === 'rejected' ? 'destructive' : 
                          'outline'
                        }>
                          {transaction.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {transaction.remarks && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {transaction.remarks}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Pending Approvals Tab */}
        <TabsContent value="pending">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Pending Approvals</h3>
            <Button asChild size="sm">
              <Link href="/transactions">Manage All</Link>
            </Button>
          </div>
          
          {pendingTransactions.length === 0 ? (
            <p className="text-muted-foreground">No pending approvals.</p>
          ) : (
            <div className="space-y-4">
              {pendingTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          User #{transaction.user_id} - {transaction.type.toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), 'PPP p')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{transaction.amount.toFixed(2)}</p>
                        <Badge variant="outline">PENDING</Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button asChild size="sm">
                      <Link href={`/transactions?id=${transaction.id}`}>Review</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

// Player-specific dashboard content
function PlayerDashboard({ 
  user, 
  activeMarkets = [], 
  recentBets = [], 
  recentTransactions = [] 
}) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mt-2">
          Place bets and track your gaming activities
        </p>
      </div>

      {/* User Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{user?.wallet_balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for betting
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/transactions?add=true">Add Funds</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentBets?.filter(bet => bet.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active bets
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/betting-history">View History</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Winnings</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{recentBets?.filter(bet => bet.status === 'won')
                .reduce((sum, bet) => sum + bet.potential_winnings, 0).toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total winnings to date
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Markets Open</CardTitle>
            <Dices className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMarkets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for betting now
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/markets">Place Bets</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Betting Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Available Markets</h2>
          <Button asChild size="sm">
            <Link href="/markets">See All Markets</Link>
          </Button>
        </div>
        
        {activeMarkets.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <Dices className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Open Markets</h3>
            <p className="text-muted-foreground">
              There are no markets currently open for betting. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {activeMarkets.slice(0, 3).map(market => (
              <Card key={market.id} className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{market.name}</CardTitle>
                    <Badge>Open</Badge>
                  </div>
                  <CardDescription>
                    {market.open_time && market.close_time ? 
                      `Closes at ${format(new Date(market.close_time), 'h:mm a')}` : 
                      "Open for betting"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {market.description || "Place your bets on various game types available in this market."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/markets/${market.id}`}>Place Bets</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="bets" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="bets">Recent Bets</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="markets">All Markets</TabsTrigger>
        </TabsList>
        
        {/* Recent Bets Tab */}
        <TabsContent value="bets">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Recent Bets</h3>
            <Button asChild size="sm">
              <Link href="/betting-history">Full History</Link>
            </Button>
          </div>
          
          {!recentBets || recentBets.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Bets Yet</h3>
              <p className="text-muted-foreground">
                You haven't placed any bets yet. Visit the markets to start betting!
              </p>
              <Button asChild className="mt-4">
                <Link href="/markets">Browse Markets</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBets.slice(0, 5).map((bet) => (
                <Card key={bet.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Market #{bet.market_id}</p>
                        <p className="text-sm text-muted-foreground">
                          Game Type #{bet.game_type_id} - Selected: {bet.selected_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{bet.bet_amount.toFixed(2)}</p>
                        <Badge variant={
                          bet.status === 'won' ? 'outline' : 
                          bet.status === 'lost' ? 'destructive' : 
                          'outline'
                        }>
                          {bet.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {bet.status === 'won' && (
                      <p className="text-sm text-green-600 mt-2">
                        Potential Winnings: ₹{bet.potential_winnings.toFixed(2)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Transaction History</h3>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/transactions?withdraw=true">Withdraw</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/transactions?add=true">Deposit</Link>
              </Button>
            </div>
          </div>
          
          {!recentTransactions || recentTransactions.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
              <p className="text-muted-foreground">
                You don't have any transactions recorded yet.
              </p>
              <Button asChild className="mt-4">
                <Link href="/transactions?add=true">Add Funds</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), 'PPP')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {transaction.type === 'deposit' || transaction.type === 'winning' 
                            ? '+' : '-'}
                          ₹{transaction.amount.toFixed(2)}
                        </p>
                        <Badge variant={
                          transaction.status === 'approved' ? 'outline' : 
                          transaction.status === 'rejected' ? 'destructive' : 
                          'outline'
                        }>
                          {transaction.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {transaction.remarks && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {transaction.remarks}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* All Markets Tab */}
        <TabsContent value="markets">
          <h3 className="text-xl font-semibold mb-4">All Markets</h3>
          {activeMarkets.length === 0 ? (
            <p className="text-muted-foreground">No active markets at the moment.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeMarkets.map((market) => (
                <Card key={market.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{market.name}</CardTitle>
                      <Badge variant="secondary">Open</Badge>
                    </div>
                    <CardDescription>
                      {market.open_time && market.close_time ? 
                        `${format(new Date(market.open_time), 'h:mm a')} - ${format(new Date(market.close_time), 'h:mm a')}` : 
                        "Schedule not set"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {market.description ? (
                      <p className="text-sm text-muted-foreground">{market.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Place your bets on this market.</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/markets/${market.id}`}>Place Bets</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

// Main Dashboard component that renders different dashboards based on user role
export default function Dashboard() {
  const { user } = useAuth();

  // Fetch active markets
  const { 
    data: activeMarkets = [],
    isLoading: isMarketsLoading
  } = useQuery({
    queryKey: ['/api/markets/open'],
    queryFn: getQueryFn<Market[]>({ on401: "returnNull" })
  });

  // For players, fetch their betting history
  const {
    data: recentBets = [],
    isLoading: isBetsLoading
  } = useQuery({
    queryKey: ['/api/users', user?.id, 'bets'],
    queryFn: getQueryFn<Bet[]>({ on401: "returnNull" }),
    enabled: !!user && user.role === 'player'
  });

  // For all users, fetch recent transactions
  const {
    data: recentTransactions = [],
    isLoading: isTransactionsLoading
  } = useQuery({
    queryKey: ['/api/users', user?.id, 'transactions'],
    queryFn: getQueryFn<Transaction[]>({ on401: "returnNull" }),
    enabled: !!user
  });

  // Admin/subadmin stats for bets and users
  const {
    data: pendingTransactions = [],
    isLoading: isPendingLoading
  } = useQuery({
    queryKey: ['/api/transactions/pending'],
    queryFn: getQueryFn<Transaction[]>({ on401: "returnNull" }),
    enabled: !!user && (user.role === 'admin' || user.role === 'subadmin')
  });

  const isLoading = isMarketsLoading || isBetsLoading || isTransactionsLoading || isPendingLoading;

  if (isLoading || !user) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      {user.role === 'admin' && (
        <AdminDashboard 
          user={user}
          activeMarkets={activeMarkets} 
          pendingTransactions={pendingTransactions}
          recentTransactions={recentTransactions}
        />
      )}
      
      {user.role === 'subadmin' && (
        <SubadminDashboard 
          user={user}
          activeMarkets={activeMarkets} 
          pendingTransactions={pendingTransactions}
          recentTransactions={recentTransactions}
        />
      )}
      
      {user.role === 'player' && (
        <PlayerDashboard 
          user={user}
          activeMarkets={activeMarkets} 
          recentBets={recentBets}
          recentTransactions={recentTransactions}
        />
      )}
    </div>
  );
}