import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Market, GameType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Markets() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch all markets
  const { 
    data: markets,
    isLoading: isMarketsLoading
  } = useQuery({
    queryKey: ['/api/markets'],
    queryFn: getQueryFn<Market[]>({ on401: "returnNull" })
  });

  // Fetch game types
  const {
    data: gameTypes,
    isLoading: isGameTypesLoading
  } = useQuery({
    queryKey: ['/api/game-types'],
    queryFn: getQueryFn<GameType[]>({ on401: "returnNull" })
  });

  const isLoading = isMarketsLoading || isGameTypesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter markets based on active tab
  const filteredMarkets = markets?.filter(market => {
    if (activeTab === "all") return true;
    if (activeTab === "open") return market.status === "open";
    if (activeTab === "closed") return market.status === "closed";
    return true;
  });

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Markets</h1>
          <p className="text-muted-foreground mt-2">
            Browse available markets and place bets
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <Button onClick={() => navigate("/markets/create")}>
            <Plus className="h-4 w-4 mr-2" /> Create Market
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="all">All Markets</TabsTrigger>
          <TabsTrigger value="open">Open Markets</TabsTrigger>
          <TabsTrigger value="closed">Closed Markets</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredMarkets?.length === 0 ? (
            <div className="text-center py-10">
              <CalendarPlus className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No markets found</h3>
              <p className="text-muted-foreground">
                {activeTab === "open" 
                  ? "There are no open markets at the moment." 
                  : activeTab === "closed" 
                    ? "There are no closed markets." 
                    : "No markets have been created yet."}
              </p>
              {user?.role === 'admin' && (
                <Button onClick={() => navigate("/markets/create")} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Create Market
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMarkets?.map((market) => (
                <Card key={market.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">{market.name}</CardTitle>
                      <Badge variant={market.status === "open" ? "success" : "secondary"}>
                        {market.status.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>
                      {format(new Date(market.open_time), 'h:mm a')} - {format(new Date(market.close_time), 'h:mm a')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Available Games</h4>
                        <div className="flex flex-wrap gap-2">
                          {market.games?.map(gameId => {
                            const gameType = gameTypes?.find(g => g.id === gameId);
                            return gameType ? (
                              <Badge key={gameId} variant="outline">
                                {gameType.name}
                              </Badge>
                            ) : null;
                          }) || (
                            <p className="text-sm text-muted-foreground">No games available</p>
                          )}
                        </div>
                      </div>
                      
                      {market.result && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Result</h4>
                          <p className="text-lg font-bold">{market.result}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 pt-6">
                    <Button 
                      onClick={() => navigate(`/markets/${market.id}`)}
                      className="w-full"
                      variant={market.status === "open" ? "default" : "secondary"}
                    >
                      {market.status === "open" 
                        ? user?.role === 'player' ? "Place Bet" : "View Details" 
                        : "View Details"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}