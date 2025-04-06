import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { GameType, insertMarketSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, 
  FormLabel, FormMessage 
} from "@/components/ui/form";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Alert, AlertTitle, AlertDescription
} from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, Loader2, CalendarIcon, Clock, Check, Info
} from "lucide-react";

// Create a market form schema
const marketFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  banner_image: z.string().optional(),
  open_date: z.date({
    required_error: "Please select an opening date",
  }),
  open_time_hour: z.string().min(1, "Required"),
  open_time_minute: z.string().min(1, "Required"),
  open_time_ampm: z.string().min(1, "Required"),
  close_date: z.date({
    required_error: "Please select a closing date",
  }),
  close_time_hour: z.string().min(1, "Required"),
  close_time_minute: z.string().min(1, "Required"),
  close_time_ampm: z.string().min(1, "Required"),
  game_types: z.array(z.number()).min(1, "Select at least one game type"),
  status: z.enum(["open", "closed"]).default("closed"),
});

type MarketFormValues = z.infer<typeof marketFormSchema>;

export default function MarketCreate() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedGameTypes, setSelectedGameTypes] = useState<number[]>([]);

  // Redirect if not an admin
  if (user?.role !== 'admin') {
    navigate("/markets");
    return null;
  }

  // Fetch available game types
  const { data: gameTypes, isLoading: isGameTypesLoading } = useQuery({
    queryKey: ['/api/game-types'],
    queryFn: getQueryFn<GameType[]>({ on401: "returnNull" }),
  });

  // Initialize form
  const form = useForm<MarketFormValues>({
    resolver: zodResolver(marketFormSchema),
    defaultValues: {
      name: "",
      description: "",
      banner_image: "",
      open_date: new Date(),
      open_time_hour: "9",
      open_time_minute: "00",
      open_time_ampm: "AM",
      close_date: new Date(),
      close_time_hour: "11",
      close_time_minute: "00",
      close_time_ampm: "AM",
      game_types: [],
      status: "closed",
    },
  });

  // Create market mutation
  const createMarketMutation = useMutation({
    mutationFn: async (formData: MarketFormValues) => {
      // Convert form data to market data
      const openDate = new Date(formData.open_date);
      const closeDate = new Date(formData.close_date);
      
      // Parse hours properly accounting for AM/PM
      let openHour = parseInt(formData.open_time_hour);
      if (formData.open_time_ampm === "PM" && openHour !== 12) {
        openHour += 12;
      } else if (formData.open_time_ampm === "AM" && openHour === 12) {
        openHour = 0;
      }
      
      let closeHour = parseInt(formData.close_time_hour);
      if (formData.close_time_ampm === "PM" && closeHour !== 12) {
        closeHour += 12;
      } else if (formData.close_time_ampm === "AM" && closeHour === 12) {
        closeHour = 0;
      }
      
      // Set the hours and minutes
      openDate.setHours(openHour, parseInt(formData.open_time_minute), 0, 0);
      closeDate.setHours(closeHour, parseInt(formData.close_time_minute), 0, 0);
      
      // Make sure close time is after open time
      if (closeDate <= openDate) {
        throw new Error("Close time must be after open time");
      }

      const marketData = {
        name: formData.name,
        description: formData.description || null,
        banner_image: formData.banner_image || null,
        open_time: openDate.toISOString(),
        close_time: closeDate.toISOString(),
        status: formData.status,
        admin_id: user?.id as number,
      };

      // Create the market
      const response = await apiRequest('/api/markets', {
        method: 'POST',
        body: JSON.stringify(marketData),
      });
      
      const market = await response.json();
      
      // Add game types to the market
      if (formData.game_types.length > 0) {
        await Promise.all(formData.game_types.map(async (gameTypeId) => {
          await apiRequest('/api/market-games', {
            method: 'POST',
            body: JSON.stringify({
              market_id: market.id,
              game_type_id: gameTypeId,
            }),
          });
        }));
      }
      
      return market;
    },
    onSuccess: () => {
      toast({
        title: "Market created",
        description: "The market has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
      navigate("/markets");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create market",
        description: error.message || "An error occurred while creating the market.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: MarketFormValues) => {
    createMarketMutation.mutate(data);
  };

  // Handle game type selection
  const toggleGameType = (gameTypeId: number) => {
    const currentValue = form.getValues("game_types");
    const updatedValue = currentValue.includes(gameTypeId)
      ? currentValue.filter(id => id !== gameTypeId)
      : [...currentValue, gameTypeId];
    
    form.setValue("game_types", updatedValue);
    setSelectedGameTypes(updatedValue);
  };

  if (isGameTypesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <Button variant="outline" onClick={() => navigate("/markets")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Markets
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Market</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new market with games for players to bet on
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Information</CardTitle>
                <CardDescription>
                  Basic details about the market
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter market name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for the market
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a description for this market"
                          className="resize-none"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional details about this market
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="banner_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter image URL for market banner"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        URL for an image to display on the market card
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select initial status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="closed">Closed (Default)</SelectItem>
                          <SelectItem value="open">Open for Betting</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Whether the market is open for betting immediately
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Timing</CardTitle>
                <CardDescription>
                  When the market opens and closes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="open_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Opening Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        The date when this market opens for betting
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="close_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Closing Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        The date when this market closes for betting
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">Opening Time</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="open_time_hour"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Hour" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                                  <SelectItem key={hour} value={hour.toString()}>
                                    {hour}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="open_time_minute"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Min" />
                              </SelectTrigger>
                              <SelectContent>
                                {["00", "15", "30", "45"].map(minute => (
                                  <SelectItem key={minute} value={minute}>
                                    {minute}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="open_time_ampm"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="AM/PM" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">Closing Time</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="close_time_hour"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Hour" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                                  <SelectItem key={hour} value={hour.toString()}>
                                    {hour}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="close_time_minute"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Min" />
                              </SelectTrigger>
                              <SelectContent>
                                {["00", "15", "30", "45"].map(minute => (
                                  <SelectItem key={minute} value={minute}>
                                    {minute}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="close_time_ampm"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="AM/PM" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Game Types</CardTitle>
                <CardDescription>
                  Select the game types that will be available in this market
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    You must select at least one game type for the market. Players can only place bets on the selected game types.
                  </AlertDescription>
                </Alert>
                
                <FormField
                  control={form.control}
                  name="game_types"
                  render={() => (
                    <FormItem>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {gameTypes?.map((gameType) => (
                          <div
                            key={gameType.id}
                            className={cn(
                              "flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-accent transition-colors",
                              form.getValues("game_types").includes(gameType.id) && "bg-primary/5 border-primary"
                            )}
                            onClick={() => toggleGameType(gameType.id)}
                          >
                            <Checkbox
                              checked={form.getValues("game_types").includes(gameType.id)}
                              onCheckedChange={() => toggleGameType(gameType.id)}
                              id={`game-type-${gameType.id}`}
                            />
                            <div className="space-y-1 leading-none">
                              <FormLabel htmlFor={`game-type-${gameType.id}`} className="text-base cursor-pointer">
                                {gameType.name}
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                {gameType.description || `Type: ${gameType.type.toUpperCase()}`}
                              </p>
                              <div className="mt-2 text-xs">
                                <span className="font-medium">Payout: </span>
                                <span>{gameType.payout_ratio}x</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/markets")}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createMarketMutation.isPending}
            >
              {createMarketMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : "Create Market"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}