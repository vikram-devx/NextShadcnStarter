import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Bet } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Dices, ArrowUpRight, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function BettingHistory() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filter, setFilter] = useState<{
    sortBy: 'newest' | 'oldest' | 'amount' | 'payout'; 
    timeframe: 'all' | 'today' | 'week' | 'month';
  }>({
    sortBy: 'newest',
    timeframe: 'all',
  });

  // Fetch user bets (for players)
  const { 
    data: userBets,
    isLoading: isUserBetsLoading
  } = useQuery({
    queryKey: ['/api/users', user?.id, 'bets'],
    queryFn: getQueryFn<Bet[]>({ on401: "throw" }),
    enabled: !!user && user.role === 'player'
  });

  // Fetch managed player bets (for subadmins)
  const {
    data: managedBets,
    isLoading: isManagedBetsLoading
  } = useQuery({
    queryKey: ['/api/subadmin/bets'],
    queryFn: getQueryFn<Bet[]>({ on401: "throw" }),
    enabled: !!user && user.role === 'subadmin'
  });

  // Fetch all bets (for admins)
  const {
    data: allBets,
    isLoading: isAllBetsLoading
  } = useQuery({
    queryKey: ['/api/bets'],
    queryFn: getQueryFn<Bet[]>({ on401: "throw" }),
    enabled: !!user && user.role === 'admin'
  });

  // Filter bets based on active tab
  const getFilteredBets = () => {
    // Select appropriate data source based on user role
    let bets = [];
    if (user?.role === 'player') {
      bets = userBets || [];
    } else if (user?.role === 'subadmin') {
      bets = managedBets || [];
    } else if (user?.role === 'admin') {
      bets = allBets || [];
    }
    
    // Filter by status
    if (activeTab !== 'all') {
      bets = bets.filter(bet => bet.status === activeTab);
    }
    
    // Filter by timeframe
    if (filter.timeframe !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      bets = bets.filter(bet => {
        const betDate = new Date(bet.created_at);
        if (filter.timeframe === 'today') {
          return betDate >= today;
        } else if (filter.timeframe === 'week') {
          return betDate >= weekAgo;
        } else if (filter.timeframe === 'month') {
          return betDate >= monthAgo;
        }
        return true;
      });
    }
    
    // Sort results
    return [...bets].sort((a, b) => {
      if (filter.sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (filter.sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (filter.sortBy === 'amount') {
        return b.amount - a.amount;
      } else if (filter.sortBy === 'payout') {
        const aPayoutVal = a.status === 'won' ? (a.payout || 0) : 0;
        const bPayoutVal = b.status === 'won' ? (b.payout || 0) : 0;
        return bPayoutVal - aPayoutVal;
      }
      return 0;
    });
  };

  const filteredBets = getFilteredBets();
  
  // Calculate summary statistics
  const calculateSummary = () => {
    const bets = 
      user?.role === 'player' ? userBets || [] :
      user?.role === 'subadmin' ? managedBets || [] :
      allBets || [];
      
    const totalBets = bets.length;
    const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const wonBets = bets.filter(bet => bet.status === 'won');
    const totalWinnings = wonBets.reduce((sum, bet) => sum + (bet.payout || 0), 0);
    const winRate = totalBets > 0 ? (wonBets.length / totalBets) * 100 : 0;
    
    return {
      totalBets,
      totalAmount,
      totalWinnings,
      winRate
    };
  };
  
  const summary = calculateSummary();

  const isLoading = isUserBetsLoading || isManagedBetsLoading || isAllBetsLoading;

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
        <h1 className="text-4xl font-bold">Betting History</h1>
        <p className="text-muted-foreground mt-2">
          {user?.role === 'player' 
            ? "View your betting history and outcomes" 
            : user?.role === 'subadmin'
              ? "Track bets placed by your players"
              : "Monitor all betting activity on the platform"}
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalBets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bets placed {user?.role !== 'player' ? 'by users' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bet Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Amount wagered
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Winnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalWinnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Amount won from bets
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of winning bets
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Bets</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="won">Won</TabsTrigger>
            <TabsTrigger value="lost">Lost</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Select
            value={filter.timeframe}
            onValueChange={(value) => setFilter(prev => ({ ...prev, timeframe: value as any }))}
          >
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filter.sortBy}
            onValueChange={(value) => setFilter(prev => ({ ...prev, sortBy: value as any }))}
          >
            <SelectTrigger className="w-[140px]">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="amount">Highest Amount</SelectItem>
              <SelectItem value="payout">Highest Payout</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Betting History Table */}
      {filteredBets.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Dices className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Bets Found</h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === 'all' 
                ? "No betting history available yet." 
                : `No ${activeTab} bets found.`}
            </p>
            {user?.role === 'player' && (
              <Button asChild>
                <Link href="/markets">
                  <ArrowUpRight className="h-4 w-4 mr-2" /> Place a Bet
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>
              {activeTab === 'all' 
                ? "A list of all bets" 
                : `A list of ${activeTab} bets`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                {user?.role !== 'player' && <TableHead>Player</TableHead>}
                <TableHead>Market</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBets.map((bet) => (
                <TableRow key={bet.id}>
                  <TableCell className="font-medium">{bet.id}</TableCell>
                  {user?.role !== 'player' && (
                    <TableCell>{bet.user_name || `User #${bet.user_id}`}</TableCell>
                  )}
                  <TableCell>{bet.market_name || `Market #${bet.market_id}`}</TableCell>
                  <TableCell>{bet.game_type_name || `Game #${bet.game_type_id}`}</TableCell>
                  <TableCell>{bet.number}</TableCell>
                  <TableCell>₹{bet.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      bet.status === 'won' ? 'success' : 
                      bet.status === 'lost' ? 'destructive' : 
                      'outline'
                    }>
                      {bet.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {bet.status === 'won' 
                      ? `₹${bet.payout?.toFixed(2)}` 
                      : bet.status === 'pending' 
                        ? 'Pending' 
                        : '-'}
                  </TableCell>
                  <TableCell>{format(new Date(bet.created_at), 'PP')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}