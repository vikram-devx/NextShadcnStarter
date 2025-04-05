import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { GameType, insertGameTypeSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { format } from "date-fns";

// Create game type form schema
const gameTypeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["jodi", "hurf", "cross", "odd_even"], {
    required_error: "Game type is required",
  }),
  min_bet_amount: z.coerce.number().min(10, "Minimum bet amount must be at least 10"),
  max_bet_amount: z.coerce.number().min(100, "Maximum bet amount must be at least 100"),
  payout_ratio: z.coerce.number().min(1, "Payout ratio must be at least 1"),
});

type GameTypeFormValues = z.infer<typeof gameTypeFormSchema>;

export default function GameTypes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch all game types
  const { 
    data: gameTypes,
    isLoading: isGameTypesLoading
  } = useQuery({
    queryKey: ['/api/game-types'],
    queryFn: getQueryFn<GameType[]>({ on401: "throw" })
  });

  // Initialize form
  const form = useForm<GameTypeFormValues>({
    resolver: zodResolver(gameTypeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "jodi",
      min_bet_amount: 10,
      max_bet_amount: 10000,
      payout_ratio: 9,
    },
  });

  // Reset form with selected game type data for editing
  const setFormForEditing = (gameType: GameType) => {
    form.reset({
      name: gameType.name,
      description: gameType.description || "",
      type: gameType.type,
      min_bet_amount: gameType.min_bet_amount,
      max_bet_amount: gameType.max_bet_amount,
      payout_ratio: gameType.payout_ratio,
    });
    setSelectedGameType(gameType);
    setIsEditMode(true);
  };

  // Reset form for creating a new game type
  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      type: "jodi",
      min_bet_amount: 10,
      max_bet_amount: 10000,
      payout_ratio: 9,
    });
    setSelectedGameType(null);
    setIsEditMode(false);
  };

  // Mutation for creating a game type
  const createGameTypeMutation = useMutation({
    mutationFn: async (data: GameTypeFormValues) => {
      return apiRequest('/api/game-types', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Game type created",
        description: "The game type has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/game-types'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create game type",
        description: error.message || "An error occurred while creating the game type",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating a game type
  const updateGameTypeMutation = useMutation({
    mutationFn: async (data: { id: number; formData: GameTypeFormValues }) => {
      return apiRequest(`/api/game-types/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.formData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Game type updated",
        description: "The game type has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/game-types'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update game type",
        description: error.message || "An error occurred while updating the game type",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a game type
  const deleteGameTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/game-types/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Game type deleted",
        description: "The game type has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/game-types'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete game type",
        description: error.message || "An error occurred while deleting the game type",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: GameTypeFormValues) => {
    if (isEditMode && selectedGameType) {
      updateGameTypeMutation.mutate({ id: selectedGameType.id, formData: data });
    } else {
      createGameTypeMutation.mutate(data);
    }
  };

  // Map game type to readable name
  const gameTypeLabels: Record<string, string> = {
    jodi: "Jodi",
    hurf: "Hurf",
    cross: "Cross",
    odd_even: "Odd-Even"
  };

  if (isGameTypesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Game Types</h1>
          <p className="text-muted-foreground mt-2">
            Manage the different types of games available on the platform
          </p>
        </div>
        
        <Sheet onOpenChange={(open) => !open && resetForm()}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Game Type
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{isEditMode ? "Edit Game Type" : "Add New Game Type"}</SheetTitle>
              <SheetDescription>
                {isEditMode 
                  ? "Update the details of an existing game type" 
                  : "Create a new game type for the platform"}
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter game type name" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for the game type
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter game type description" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Explain how this game works to players
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a game type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="jodi">Jodi</SelectItem>
                            <SelectItem value="hurf">Hurf</SelectItem>
                            <SelectItem value="cross">Cross</SelectItem>
                            <SelectItem value="odd_even">Odd-Even</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The category of game
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="min_bet_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Bet (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min={10} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="max_bet_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Bet (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min={100} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="payout_ratio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payout Ratio</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={1} step="0.1" />
                        </FormControl>
                        <FormDescription>
                          Multiplier applied to winning bets (e.g., 9 means 9x the bet amount)
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
                      disabled={createGameTypeMutation.isPending || updateGameTypeMutation.isPending}
                    >
                      {(createGameTypeMutation.isPending || updateGameTypeMutation.isPending) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          {isEditMode ? "Updating..." : "Creating..."}
                        </>
                      ) : isEditMode ? "Update Game Type" : "Create Game Type"}
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {!gameTypes || gameTypes.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Game Types Available</h3>
            <p className="text-muted-foreground mb-6">
              You haven't created any game types yet. Add a game type to get started.
            </p>
            <Sheet>
              <SheetTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Game Type
                </Button>
              </SheetTrigger>
              <SheetContent>
                {/* Same form content */}
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>A list of all game types on the platform</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Bet Limits</TableHead>
                <TableHead>Payout Ratio</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gameTypes.map((gameType) => (
                <TableRow key={gameType.id}>
                  <TableCell className="font-medium">{gameType.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{gameTypeLabels[gameType.type]}</Badge>
                  </TableCell>
                  <TableCell>
                    ₹{gameType.min_bet_amount} - ₹{gameType.max_bet_amount}
                  </TableCell>
                  <TableCell>{gameType.payout_ratio}x</TableCell>
                  <TableCell>{format(new Date(gameType.created_at), 'PP')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => setFormForEditing(gameType)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="overflow-y-auto">
                          {/* Sheet content is handled by the main sheet */}
                        </SheetContent>
                      </Sheet>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Game Type</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{gameType.name}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-4">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button 
                              variant="destructive" 
                              onClick={() => deleteGameTypeMutation.mutate(gameType.id)}
                              disabled={deleteGameTypeMutation.isPending}
                            >
                              {deleteGameTypeMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                                </>
                              ) : "Delete"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}