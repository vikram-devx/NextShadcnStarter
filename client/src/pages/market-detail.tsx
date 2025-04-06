import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Market, GameType, Bet, insertBetSchema, insertMarketGameSchema } from "@shared/schema";
import { formatWalletBalance, getBetStatusVariant } from "@/lib/formatters";
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
  Calendar, User, DollarSign, Plus, X
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

// Component for adding games to a market
function AddGameToMarketForm({ 
  marketId,
  existingGames
}: { 
  marketId: number;
  existingGames: GameType[];
}) {
  const { toast } = useToast();
  
  // Create a schema for adding games to the market
  const addGameSchema = z.object({
    game_type_id: z.coerce.number().min(1, "Please select a game type")
  });

  type AddGameFormValues = z.infer<typeof addGameSchema>;
  
  // Initialize form
  const form = useForm<AddGameFormValues>({
    resolver: zodResolver(addGameSchema),
    defaultValues: {
      game_type_id: 0,
    },
  });
  
  // Fetch all available game types
  const { data: allGameTypes, isLoading } = useQuery({
    queryKey: ['/api/game-types'],
    queryFn: getQueryFn<GameType[]>({ on401: "returnNull" }),
  });
  
  // Mutation for adding a game to the market
  const addGameMutation = useMutation({
    mutationFn: async (data: AddGameFormValues) => {
      const marketGameData = {
        market_id: marketId,
        game_type_id: data.game_type_id,
      };
      return apiRequest('/api/market-games', {
        method: 'POST',
        body: JSON.stringify(marketGameData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Game added",
        description: "The game has been added to the market successfully."
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/markets', marketId, 'games'] });
      queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
      form.reset();
      // Close dialog by clicking the close button
      document.querySelector('[data-dialog-close="true"]')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add game",
        description: error.message || "An error occurred while adding the game to the market.",
        variant: "destructive"
      });
    }
  });
  
  // Filter out already added games
  const availableGameTypes = allGameTypes?.filter(gameType => 
    !existingGames.some(existing => existing.id === gameType.id)
  ) || [];
  
  // Handle form submission
  const onSubmit = (data: AddGameFormValues) => {
    addGameMutation.mutate(data);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="game_type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableGameTypes.length === 0 ? (
                    <SelectItem value="0" disabled>
                      No available games to add
                    </SelectItem>
                  ) : (
                    availableGameTypes.map(gameType => (
                      <SelectItem key={gameType.id} value={gameType.id.toString()}>
                        {gameType.name} - Payout {gameType.payout_ratio}x
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Select a game type to add to this market
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
          <Button 
            type="submit" 
            disabled={addGameMutation.isPending || availableGameTypes.length === 0}
          >
            {addGameMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
              </>
            ) : "Add Game"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function MarketDetail({ id }: MarketDetailProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const marketId = parseInt(id);
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
  
  // Mutation for removing a game from the market
  const removeGameMutation = useMutation({
    mutationFn: async (gameTypeId: number) => {
      return apiRequest(`/api/market-games/${marketId}/${gameTypeId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Game removed",
        description: "The game has been removed from the market."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/markets', marketId, 'games'] });
      queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove game",
        description: error.message || "An error occurred while removing the game from the market.",
        variant: "destructive"
      });
    }
  });
  
  // Handle removing a game from the market
  const removeGameFromMarket = (gameTypeId: number) => {
    if (!user || user.role !== 'admin') return;
    
    if (confirm('Are you sure you want to remove this game from the market?')) {
      removeGameMutation.mutate(gameTypeId);
    }
  };

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
    // Check if user has enough balance (using safe access)
    if (!user || typeof user.wallet_balance !== 'number' || user.wallet_balance < data.amount) {
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
      <div className="container mx-auto max-w-7xl px-4 py-10">
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
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <Button variant="outline" onClick={() => navigate("/markets")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Markets
      </Button>
      
      {market?.banner_image && (
        <div className="w-full h-64 mb-6 rounded-lg overflow-hidden relative">
          <img 
            src={market.banner_image} 
            alt={market.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-4xl font-bold text-background">{market?.name || 'Market Details'}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge 
                variant={market?.status === "open" ? "success" : "secondary"}
                className="px-3 py-1 text-base"
              >
                {market?.status ? market.status.toUpperCase() : 'LOADING'}
              </Badge>
              <p className="text-background/90 font-medium">
                {market?.open_time && market?.close_time ? (
                  <>
                    {format(new Date(market.open_time), 'PPP')} • {format(new Date(market.open_time), 'h:mm a')} - {format(new Date(market.close_time), 'h:mm a')}
                  </>
                ) : 'Market timing information unavailable'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        {!market?.banner_image && (
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{market?.name || 'Market Details'}</h1>
              <Badge variant={market?.status === "open" ? "success" : "secondary"}>
                {market?.status ? market.status.toUpperCase() : 'LOADING'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {market?.open_time && market?.close_time ? (
                <>
                  {format(new Date(market.open_time), 'PPP')} • {format(new Date(market.open_time), 'h:mm a')} - {format(new Date(market.close_time), 'h:mm a')}
                </>
              ) : 'Market timing information unavailable'}
            </p>
          </div>
        )}
        
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
                  {market?.open_time && market?.close_time ? (
                    <>{format(new Date(market.open_time), 'h:mm a')} - {format(new Date(market.close_time), 'h:mm a')}</>
                  ) : 'Time not specified'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {market?.open_time ? format(new Date(market.open_time), 'EEEE, MMMM d, yyyy') : 'Date not specified'}
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
                            Your wallet balance: ₹{formatWalletBalance(user)}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {selectedGameType && (
                      <div className="p-4 bg-muted rounded-md">
                        <h4 className="font-medium mb-2">Potential Payout</h4>
                        <p className="text-sm">
                          If you win: ₹{formatWalletBalance({ wallet_balance: betForm.getValues('amount') * (selectedGameType?.payout_ratio || 1) })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Payout rate: {selectedGameType?.payout_ratio}x
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
                          <TableCell>{bet.selected_number}</TableCell>
                          <TableCell>₹{formatWalletBalance({ wallet_balance: bet.bet_amount || 0 })}</TableCell>
                          <TableCell>
                            <Badge variant={getBetStatusVariant(bet.status)}>
                              {bet.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {bet.status === 'won' 
                              ? `₹${formatWalletBalance({ wallet_balance: bet.potential_winnings || 0 })}` 
                              : bet.status === 'pending' 
                                ? `₹${formatWalletBalance({ wallet_balance: bet.potential_winnings || 0 })}` 
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
                      <Badge variant={market?.status === "open" ? "success" : "secondary"}>
                        {market?.status ? market.status.toUpperCase() : 'LOADING'}
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
                        <p>{market?.open_time ? format(new Date(market.open_time), 'PPP') : 'Date not specified'}</p>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p>{market?.open_time ? format(new Date(market.open_time), 'h:mm a') : 'Time not specified'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Close Time</p>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p>{market?.close_time ? format(new Date(market.close_time), 'PPP') : 'Date not specified'}</p>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p>{market?.close_time ? format(new Date(market.close_time), 'h:mm a') : 'Time not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {market?.result && (
                    <div>
                      <p className="text-sm font-medium">Declared Result</p>
                      <p className="text-xl font-semibold">{market.result}</p>
                      {/* The result_declared_at field doesn't exist in the schema, so we display the market's updated_at instead */}
                      {market?.updated_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Declared on: {format(new Date(market.updated_at), 'PPP')} at {format(new Date(market.updated_at), 'h:mm a')}
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
                  
                  {market?.created_at && (
                    <div>
                      <p className="text-sm font-medium">Created On</p>
                      <p>{format(new Date(market.created_at), 'PPP')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Available Games</CardTitle>
                {user?.role === 'admin' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" /> Add Game
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Game to Market</DialogTitle>
                        <DialogDescription>
                          Select a game type to add to {market.name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <AddGameToMarketForm 
                        marketId={marketId} 
                        existingGames={gameTypes || []} 
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {!gameTypes || gameTypes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No games have been added to this market.</p>
                    {user?.role === 'admin' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-4">
                            <Plus className="h-4 w-4 mr-2" /> Add Game
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Game to Market</DialogTitle>
                            <DialogDescription>
                              Select a game type to add to {market.name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <AddGameToMarketForm 
                            marketId={marketId} 
                            existingGames={[]} 
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {gameTypes.map(gameType => (
                      <div key={gameType.id} className="pb-4 border-b last:border-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{gameType.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {gameType?.payout_ratio || 1}x
                            </Badge>
                            {user?.role === 'admin' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => removeGameFromMarket(gameType.id)}
                              >
                                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            )}
                          </div>
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