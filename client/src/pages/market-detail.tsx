import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Market, GameType, Bet, insertBetSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog, DialogClose, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { 
  Loader2, ArrowLeft, Clock, AlertTriangle, CheckCircle, 
  Calendar, User, DollarSign 
} from "lucide-react";
import { useState } from "react";

type MarketDetailProps = {
  id: string;
};

// Create a betting form schema
const betFormSchema = z.object({
  game_type_id: z.coerce.number().min(1, "Game type is required"),
  number: z.string().min(1, "Number is required"),
  amount: z.coerce.number().min(10, "Minimum bet amount is 10").max(100000, "Maximum bet amount is 100,000"),
});

type BetFormValues = z.infer<typeof betFormSchema>;

// Create a result declaration form schema
const resultFormSchema = z.object({
  result: z.string().min(1, "Result is required"),
});

type ResultFormValues = z.infer<typeof resultFormSchema>;

export default function MarketDetail({ id }: MarketDetailProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const marketId = parseInt(id);
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);

  // Initialize betting form
  const betForm = useForm<BetFormValues>({
    resolver: zodResolver(betFormSchema),
    defaultValues: {
      game_type_id: 0,
      number: "",
      amount: 100,
    },
  });

  // Initialize result form
  const resultForm = useForm<ResultFormValues>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      result: "",
    },
  });

  // Fetch market details
  const { 
    data: market,
    isLoading: isMarketLoading,
    error: marketError
  } = useQuery({
    queryKey: ['/api/markets', marketId],
    queryFn: getQueryFn<Market>({ on401: "throw" }),
  });

  // Fetch game types for this market
  const {
    data: gameTypes,
    isLoading: isGameTypesLoading
  } = useQuery({
    queryKey: ['/api/markets', marketId, 'games'],
    queryFn: getQueryFn<GameType[]>({ on401: "returnNull" }),
    enabled: !!marketId
  });

  // Fetch bets for this market (admin only)
  const {
    data: marketBets,
    isLoading: isMarketBetsLoading
  } = useQuery({
    queryKey: ['/api/markets', marketId, 'bets'],
    queryFn: getQueryFn<Bet[]>({ on401: "returnNull" }),
    enabled: !!marketId && !!user && user.role === 'admin'
  });

  // Mutation for placing a bet
  const placeBetMutation = useMutation({
    mutationFn: async (data: BetFormValues) => {
      const betData = {
        ...data,
        market_id: marketId,
        user_id: user?.id as number,
      };
      return apiRequest('/api/bets', {
        method: 'POST',
        body: JSON.stringify(betData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Bet placed successfully",
        description: "Your bet has been placed. Good luck!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'bets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] }); // Update wallet balance
      betForm.reset({
        game_type_id: 0,
        number: "",
        amount: 100,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to place bet",
        description: error.message || "An error occurred while placing your bet.",
        variant: "destructive",
      });
    },
  });

  // Mutation for opening/closing market (admin only)
  const updateMarketStatusMutation = useMutation({
    mutationFn: async ({ action }: { action: 'open' | 'close' }) => {
      return apiRequest(`/api/markets/${marketId}/${action}`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      toast({
        title: "Market status updated",
        description: "The market status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/markets', marketId] });
      queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update market",
        description: error.message || "An error occurred while updating the market.",
        variant: "destructive",
      });
    },
  });

  // Mutation for declaring result (admin only)
  const declareResultMutation = useMutation({
    mutationFn: async (data: ResultFormValues) => {
      return apiRequest(`/api/markets/${marketId}/result`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Result declared",
        description: "The market result has been declared and bets have been processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/markets', marketId] });
      queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/markets', marketId, 'bets'] });
      resultForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to declare result",
        description: error.message || "An error occurred while declaring the result.",
        variant: "destructive",
      });
    },
  });

  // Handle game type selection
  const handleGameTypeChange = (gameTypeId: string) => {
    const selectedId = parseInt(gameTypeId);
    const gameType = gameTypes?.find(g => g.id === selectedId) || null;
    setSelectedGameType(gameType);
    betForm.setValue('game_type_id', selectedId);
  };

  // Handle bet form submission
  const onBetSubmit = (data: BetFormValues) => {
    // Check if user has enough balance
    if (user && user.wallet_balance < data.amount) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance to place this bet. Please add funds to your wallet.",
        variant: "destructive",
      });
      return;
    }
    
    placeBetMutation.mutate(data);
  };

  // Handle result form submission
  const onResultSubmit = (data: ResultFormValues) => {
    declareResultMutation.mutate(data);
  };

  // Handle market status update
  const handleMarketStatusUpdate = (action: 'open' | 'close') => {
    updateMarketStatusMutation.mutate({ action });
  };

  const isLoading = isMarketLoading || isGameTypesLoading || 
    (user?.role === 'admin' && isMarketBetsLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (marketError || !market) {
    return (
      <div className="container py-10">
        <Button variant="outline" onClick={() => navigate("/markets")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Markets
        </Button>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load market details. The market may not exist or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Button variant="outline" onClick={() => navigate("/markets")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Markets
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{market.name}</h1>
            <Badge variant={market.status === "open" ? "success" : "secondary"}>
              {market.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {format(new Date(market.open_time), 'PPP')} • {format(new Date(market.open_time), 'h:mm a')} - {format(new Date(market.close_time), 'h:mm a')}
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <div className="flex gap-3">
            {market.status === 'closed' && !market.result ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Declare Result</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Declare Market Result</DialogTitle>
                    <DialogDescription>
                      Enter the result for {market.name}. This will process all bets and update user balances accordingly.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...resultForm}>
                    <form onSubmit={resultForm.handleSubmit(onResultSubmit)} className="space-y-4">
                      <FormField
                        control={resultForm.control}
                        name="result"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Result</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter the result" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter the result in the appropriate format for this market
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={declareResultMutation.isPending}>
                          {declareResultMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                            </>
                          ) : "Declare Result"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            ) : market.status === 'open' ? (
              <Button 
                variant="outline" 
                onClick={() => handleMarketStatusUpdate('close')}
                disabled={updateMarketStatusMutation.isPending}
              >
                {updateMarketStatusMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                  </>
                ) : "Close Market"}
              </Button>
            ) : market.status === 'closed' ? (
              <Button 
                variant="outline" 
                onClick={() => handleMarketStatusUpdate('open')}
                disabled={updateMarketStatusMutation.isPending || !!market.result}
              >
                {updateMarketStatusMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                  </>
                ) : "Reopen Market"}
              </Button>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Market Information */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Timing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {format(new Date(market.open_time), 'h:mm a')} - {format(new Date(market.close_time), 'h:mm a')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(market.open_time), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {market.status === 'open' ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              )}
              <div>
                <p className="font-medium">
                  {market.status === 'open' ? 'Open for Betting' : 'Closed'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {market.status === 'open' 
                    ? 'You can place bets now' 
                    : market.result 
                      ? `Result: ${market.result}` 
                      : 'Awaiting result declaration'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {gameTypes && gameTypes.length > 0 ? (
                gameTypes.map(gameType => (
                  <Badge key={gameType.id} variant="outline">{gameType.name}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No games available for this market</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different views */}
      <Tabs defaultValue="bet" className="w-full">
        <TabsList className="grid grid-cols-2 md:w-[400px] mb-8">
          <TabsTrigger value="bet" disabled={market.status !== 'open' || user?.role !== 'player'}>
            Place a Bet
          </TabsTrigger>
          {user?.role === 'admin' && (
            <TabsTrigger value="bets">Betting Activity</TabsTrigger>
          )}
          <TabsTrigger value="details">Market Details</TabsTrigger>
        </TabsList>
        
        {/* Place Bet Tab - Only for players and open markets */}
        <TabsContent value="bet">
          {user?.role !== 'player' ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Admin/Subadmin Access</AlertTitle>
              <AlertDescription>
                As an admin or subadmin, you cannot place bets. You can only view and manage the market.
              </AlertDescription>
            </Alert>
          ) : market.status !== 'open' ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Market Closed</AlertTitle>
              <AlertDescription>
                This market is currently closed for betting. Please check back later or try another market.
              </AlertDescription>
            </Alert>
          ) : !gameTypes || gameTypes.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Games Available</AlertTitle>
              <AlertDescription>
                There are no games available for this market. Please check back later.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Place Your Bet</CardTitle>
                <CardDescription>
                  Select a game type, enter your numbers and amount to place a bet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...betForm}>
                  <form onSubmit={betForm.handleSubmit(onBetSubmit)} className="space-y-6">
                    <FormField
                      control={betForm.control}
                      name="game_type_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Game Type</FormLabel>
                          <Select 
                            onValueChange={handleGameTypeChange} 
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a game type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {gameTypes.map(gameType => (
                                <SelectItem key={gameType.id} value={gameType.id.toString()}>
                                  {gameType.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {selectedGameType?.description || "Select a game type to see its description"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={betForm.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={selectedGameType ? `Enter number for ${selectedGameType.name}` : "Enter number"} 
                              {...field}
                              disabled={!selectedGameType}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the number you want to bet on
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={betForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bet Amount (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={10}
                              max={100000}
                              placeholder="Enter bet amount" 
                              {...field}
                              disabled={!selectedGameType}
                            />
                          </FormControl>
                          <FormDescription>
                            Your wallet balance: ₹{user?.wallet_balance.toFixed(2)}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {selectedGameType && (
                      <div className="p-4 bg-muted rounded-md">
                        <h4 className="font-medium mb-2">Potential Payout</h4>
                        <p className="text-sm">
                          If you win: ₹{(betForm.getValues('amount') * (selectedGameType?.payout_multiplier || 1)).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Payout rate: {selectedGameType?.payout_multiplier}x
                        </p>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={placeBetMutation.isPending || !selectedGameType}
                      className="w-full"
                    >
                      {placeBetMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                        </>
                      ) : "Place Bet"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Admin-only Betting Activity Tab */}
        {user?.role === 'admin' && (
          <TabsContent value="bets">
            <Card>
              <CardHeader>
                <CardTitle>Betting Activity</CardTitle>
                <CardDescription>
                  View all bets placed on this market
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!marketBets || marketBets.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No bets have been placed on this market yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>A list of all bets placed on this market</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Game</TableHead>
                        <TableHead>Number</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Potential/Actual Payout</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marketBets.map(bet => (
                        <TableRow key={bet.id}>
                          <TableCell className="font-medium">{bet.user_name}</TableCell>
                          <TableCell>{bet.game_type_name}</TableCell>
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
                                ? `₹${(bet.amount * (bet.payout_multiplier || 1)).toFixed(2)}` 
                                : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {/* Market Details Tab */}
        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Market ID</p>
                      <p className="text-muted-foreground">{market.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge variant={market.status === "open" ? "success" : "secondary"}>
                        {market.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Market Name</p>
                    <p>{market.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Open Time</p>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p>{format(new Date(market.open_time), 'PPP')}</p>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p>{format(new Date(market.open_time), 'h:mm a')}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Close Time</p>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p>{format(new Date(market.close_time), 'PPP')}</p>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p>{format(new Date(market.close_time), 'h:mm a')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {market.result && (
                    <div>
                      <p className="text-sm font-medium">Declared Result</p>
                      <p className="text-xl font-semibold">{market.result}</p>
                      {market.result_declared_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Declared on: {format(new Date(market.result_declared_at), 'PPP')} at {format(new Date(market.result_declared_at), 'h:mm a')}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {market.admin_id && (
                    <div>
                      <p className="text-sm font-medium">Created By</p>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p>Admin ID: {market.admin_id}</p>
                      </div>
                    </div>
                  )}
                  
                  {market.created_at && (
                    <div>
                      <p className="text-sm font-medium">Created On</p>
                      <p>{format(new Date(market.created_at), 'PPP')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Available Games</CardTitle>
              </CardHeader>
              <CardContent>
                {!gameTypes || gameTypes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No games have been added to this market.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {gameTypes.map(gameType => (
                      <div key={gameType.id} className="pb-4 border-b last:border-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{gameType.name}</h3>
                          <Badge variant="outline" className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {gameType.payout_multiplier}x
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {gameType.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}