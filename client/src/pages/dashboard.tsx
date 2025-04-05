import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Bet, Transaction, Market } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Wallet, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch active markets
  const { 
    data: activeMarkets,
    isLoading: isMarketsLoading
  } = useQuery({
    queryKey: ['/api/markets/open'],
    queryFn: getQueryFn<Market[]>({ on401: "returnNull" })
  });

  // For players, fetch their betting history
  const {
    data: recentBets,
    isLoading: isBetsLoading
  } = useQuery({
    queryKey: ['/api/users', user?.id, 'bets'],
    queryFn: getQueryFn<Bet[]>({ on401: "returnNull" }),
    enabled: !!user && user.role === 'player'
  });

  // For all users, fetch recent transactions
  const {
    data: recentTransactions,
    isLoading: isTransactionsLoading
  } = useQuery({
    queryKey: ['/api/users', user?.id, 'transactions'],
    queryFn: getQueryFn<Transaction[]>({ on401: "returnNull" }),
    enabled: !!user
  });

  // Admin/subadmin stats for bets and users
  const {
    data: pendingTransactions,
    isLoading: isPendingLoading
  } = useQuery({
    queryKey: ['/api/transactions/pending'],
    queryFn: getQueryFn<Transaction[]>({ on401: "returnNull" }),
    enabled: !!user && (user.role === 'admin' || user.role === 'subadmin')
  });

  const isLoading = isMarketsLoading || isBetsLoading || isTransactionsLoading || isPendingLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mt-2">
          {user?.role === 'admin' && "View and manage all aspects of your Sata Matka platform"}
          {user?.role === 'subadmin' && "Manage your players and process transactions"}
          {user?.role === 'player' && "Place bets and track your gaming activities"}
        </p>
      </div>

      {/* User balance/stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
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
        </Card>
        
        {user?.role === 'player' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Bets</CardTitle>
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
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latest Wins</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{recentBets?.filter(bet => bet.status === 'won')
                    .reduce((sum, bet) => sum + (bet.payout || 0), 0).toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total recent winnings
                </p>
              </CardContent>
            </Card>
          </>
        )}
        
        {(user?.role === 'admin' || user?.role === 'subadmin') && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingTransactions?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Require approval
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Markets</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeMarkets?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Markets open for betting
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="markets" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="markets">Active Markets</TabsTrigger>
          {user?.role === 'player' && <TabsTrigger value="bets">Recent Bets</TabsTrigger>}
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          {(user?.role === 'admin' || user?.role === 'subadmin') && (
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          )}
        </TabsList>
        
        {/* Active Markets Tab */}
        <TabsContent value="markets">
          <h3 className="text-xl font-semibold mb-4">Active Markets</h3>
          {activeMarkets?.length === 0 ? (
            <p className="text-muted-foreground">No active markets at the moment.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeMarkets?.map((market) => (
                <Card key={market.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{market.name}</CardTitle>
                      <Badge variant="secondary">Open</Badge>
                    </div>
                    <CardDescription>
                      {format(new Date(market.open_time), 'h:mm a')} - {format(new Date(market.close_time), 'h:mm a')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Open Time</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(market.open_time), 'PPP')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Close Time</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(market.close_time), 'PPP')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Recent Bets Tab */}
        {user?.role === 'player' && (
          <TabsContent value="bets">
            <h3 className="text-xl font-semibold mb-4">Recent Bets</h3>
            {recentBets?.length === 0 ? (
              <p className="text-muted-foreground">No recent bets.</p>
            ) : (
              <div className="space-y-4">
                {recentBets?.slice(0, 5).map((bet) => (
                  <Card key={bet.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{bet.market_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {bet.game_type_name} - {bet.number}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{bet.amount.toFixed(2)}</p>
                          <Badge variant={
                            bet.status === 'won' ? 'success' : 
                            bet.status === 'lost' ? 'destructive' : 
                            'outline'
                          }>
                            {bet.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      {bet.status === 'won' && (
                        <p className="text-sm text-green-600 mt-2">
                          Won: ₹{bet.payout?.toFixed(2)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
          {recentTransactions?.length === 0 ? (
            <p className="text-muted-foreground">No recent transactions.</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions?.slice(0, 5).map((transaction) => (
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
                          transaction.status === 'approved' ? 'success' : 
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
        {(user?.role === 'admin' || user?.role === 'subadmin') && (
          <TabsContent value="pending">
            <h3 className="text-xl font-semibold mb-4">Pending Approvals</h3>
            {pendingTransactions?.length === 0 ? (
              <p className="text-muted-foreground">No pending approvals.</p>
            ) : (
              <div className="space-y-4">
                {pendingTransactions?.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {transaction.user_name} - {transaction.type.toUpperCase()}
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
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}