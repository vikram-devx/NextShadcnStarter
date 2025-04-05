import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Transaction, insertTransactionSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { 
  Loader2, Plus, ArrowUpRight, ArrowDownRight, Check, X, 
  ArrowUp, ArrowDown, Info, User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { format } from "date-fns";

// Transaction form schema
const transactionFormSchema = z.object({
  type: z.enum(["deposit", "withdrawal"], {
    required_error: "Transaction type is required",
  }),
  amount: z.coerce.number().min(10, "Minimum amount is ₹10").max(100000, "Maximum amount is ₹100,000"),
  remarks: z.string().optional(),
});

// Admin approval form schema
const approvalFormSchema = z.object({
  remarks: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;
type ApprovalFormValues = z.infer<typeof approvalFormSchema>;

export default function Transactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Initialize form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "deposit",
      amount: 100,
      remarks: "",
    },
  });

  // Initialize approval form
  const approvalForm = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalFormSchema),
    defaultValues: {
      remarks: "",
    },
  });

  // Fetch user transactions
  const { 
    data: transactions,
    isLoading: isTransactionsLoading
  } = useQuery({
    queryKey: ['/api/users', user?.id, 'transactions'],
    queryFn: getQueryFn<Transaction[]>({ on401: "throw" }),
    enabled: !!user && user.role === 'player'
  });

  // Fetch all transactions (admin/subadmin)
  const {
    data: allTransactions,
    isLoading: isAllTransactionsLoading
  } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: getQueryFn<Transaction[]>({ on401: "throw" }),
    enabled: !!user && ['admin', 'subadmin'].includes(user.role)
  });

  // Fetch pending transactions (admin/subadmin)
  const {
    data: pendingTransactions,
    isLoading: isPendingTransactionsLoading
  } = useQuery({
    queryKey: ['/api/transactions/pending'],
    queryFn: getQueryFn<Transaction[]>({ on401: "throw" }),
    enabled: !!user && ['admin', 'subadmin'].includes(user.role)
  });

  // Mutation for creating a transaction
  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      return apiRequest('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          user_id: user?.id,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Transaction request submitted",
        description: "Your request has been submitted and is pending approval",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'transactions'] });
      form.reset({
        type: "deposit",
        amount: 100,
        remarks: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit request",
        description: error.message || "An error occurred while submitting your request",
        variant: "destructive",
      });
    },
  });

  // Mutation for approving a transaction
  const approveTransactionMutation = useMutation({
    mutationFn: async ({ id, remarks }: { id: number; remarks?: string }) => {
      return apiRequest(`/api/transactions/${id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ remarks }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Transaction approved",
        description: "The transaction has been approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
      approvalForm.reset();
      setSelectedTransaction(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to approve transaction",
        description: error.message || "An error occurred while approving the transaction",
        variant: "destructive",
      });
    },
  });

  // Mutation for rejecting a transaction
  const rejectTransactionMutation = useMutation({
    mutationFn: async ({ id, remarks }: { id: number; remarks?: string }) => {
      return apiRequest(`/api/transactions/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ remarks }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Transaction rejected",
        description: "The transaction has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
      approvalForm.reset();
      setSelectedTransaction(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reject transaction",
        description: error.message || "An error occurred while rejecting the transaction",
        variant: "destructive",
      });
    },
  });

  // Handle transaction form submission
  const onSubmit = (data: TransactionFormValues) => {
    createTransactionMutation.mutate(data);
  };

  // Handle approval form submission
  const onApproveSubmit = (data: ApprovalFormValues) => {
    if (selectedTransaction) {
      approveTransactionMutation.mutate({
        id: selectedTransaction.id,
        remarks: data.remarks,
      });
    }
  };

  // Handle rejection form submission
  const onRejectSubmit = (data: ApprovalFormValues) => {
    if (selectedTransaction) {
      rejectTransactionMutation.mutate({
        id: selectedTransaction.id,
        remarks: data.remarks,
      });
    }
  };

  // Filter transactions based on active tab
  const getFilteredTransactions = () => {
    let data = [];
    
    // Use appropriate data source based on user role
    if (user?.role === 'player') {
      data = transactions || [];
    } else {
      data = allTransactions || [];
    }
    
    // Apply filters
    return data.filter(tx => {
      if (activeTab === 'all') return true;
      if (activeTab === 'deposits') return tx.type === 'deposit';
      if (activeTab === 'withdrawals') return tx.type === 'withdrawal';
      if (activeTab === 'bets') return tx.type === 'bet';
      if (activeTab === 'winnings') return tx.type === 'winning';
      if (activeTab === 'pending') return tx.status === 'pending';
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // For status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">APPROVED</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">REJECTED</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">PENDING</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  // For transaction type icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-amber-600" />;
      case 'bet':
        return <ArrowUp className="h-4 w-4 text-blue-600" />;
      case 'winning':
        return <ArrowDown className="h-4 w-4 text-purple-600" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const isLoading = isTransactionsLoading || isAllTransactionsLoading || isPendingTransactionsLoading;

  if (isLoading) {
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
          <h1 className="text-4xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === 'player' 
              ? "Manage your deposits and withdrawals" 
              : "Monitor and manage all financial transactions"}
          </p>
        </div>
        
        {user?.role === 'player' && (
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New Request
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>New Transaction Request</SheetTitle>
                <SheetDescription>
                  Request a deposit or withdrawal from your account
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select transaction type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="deposit">Deposit (Add Funds)</SelectItem>
                              <SelectItem value="withdrawal">Withdrawal (Cash Out)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {field.value === 'deposit' 
                              ? "Add funds to your account" 
                              : "Withdraw funds from your account"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={10}
                              max={100000}
                              placeholder="Enter amount" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {form.getValues('type') === 'withdrawal' && 
                              `Available balance: ₹${user?.wallet_balance.toFixed(2)}`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="remarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remarks (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional information" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.getValues('type') === 'withdrawal' && user?.wallet_balance < form.getValues('amount') && (
                      <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
                        Insufficient balance for withdrawal
                      </div>
                    )}
                    
                    <SheetFooter className="pt-4">
                      <SheetClose asChild>
                        <Button variant="outline" type="button">Cancel</Button>
                      </SheetClose>
                      <Button 
                        type="submit" 
                        disabled={
                          createTransactionMutation.isPending || 
                          (form.getValues('type') === 'withdrawal' && 
                           user?.wallet_balance < form.getValues('amount'))
                        }
                      >
                        {createTransactionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                          </>
                        ) : "Submit Request"}
                      </Button>
                    </SheetFooter>
                  </form>
                </Form>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
      
      {/* For Admin/Subadmin: Show pending requests that need approval */}
      {(['admin', 'subadmin'].includes(user?.role)) && pendingTransactions && pendingTransactions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Approval</CardTitle>
            <CardDescription>
              Transactions requiring your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTransactions.slice(0, 3).map(tx => (
                <div key={tx.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <p className="font-medium">
                        {tx.user_name || `User #${tx.user_id}`} - {tx.type.toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Amount: ₹{tx.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="text-green-600"
                          onClick={() => setSelectedTransaction(tx)}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Transaction</DialogTitle>
                          <DialogDescription>
                            Confirm approval for {tx.type} of ₹{tx.amount.toFixed(2)} from {tx.user_name || `User #${tx.user_id}`}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...approvalForm}>
                          <form onSubmit={approvalForm.handleSubmit(onApproveSubmit)} className="space-y-4 py-4">
                            <FormField
                              control={approvalForm.control}
                              name="remarks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Remarks (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Add any notes about this approval" 
                                      {...field} 
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <DialogFooter className="pt-4">
                              <DialogClose asChild>
                                <Button variant="outline" type="button">Cancel</Button>
                              </DialogClose>
                              <Button 
                                type="submit" 
                                disabled={approveTransactionMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {approveTransactionMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                                  </>
                                ) : "Approve Transaction"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="text-red-600"
                          onClick={() => setSelectedTransaction(tx)}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Transaction</DialogTitle>
                          <DialogDescription>
                            Confirm rejection for {tx.type} of ₹{tx.amount.toFixed(2)} from {tx.user_name || `User #${tx.user_id}`}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...approvalForm}>
                          <form onSubmit={approvalForm.handleSubmit(onRejectSubmit)} className="space-y-4 py-4">
                            <FormField
                              control={approvalForm.control}
                              name="remarks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reasons for Rejection</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Explain why this transaction is being rejected" 
                                      {...field} 
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <DialogFooter className="pt-4">
                              <DialogClose asChild>
                                <Button variant="outline" type="button">Cancel</Button>
                              </DialogClose>
                              <Button 
                                type="submit" 
                                disabled={rejectTransactionMutation.isPending}
                                variant="destructive"
                              >
                                {rejectTransactionMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                                  </>
                                ) : "Reject Transaction"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
              
              {pendingTransactions.length > 3 && (
                <Button variant="link" onClick={() => setActiveTab('pending')} className="w-full">
                  View all {pendingTransactions.length} pending transactions
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="bets">Bets</TabsTrigger>
          <TabsTrigger value="winnings">Winnings</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredTransactions.length === 0 ? (
            <Card className="text-center py-10">
              <CardContent>
                <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Info className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Transactions Found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'all' 
                    ? "No transactions have been recorded yet." 
                    : `No ${activeTab} transactions found.`}
                </p>
                {user?.role === 'player' && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" /> New Request
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      {/* Sheet content is reused */}
                    </SheetContent>
                  </Sheet>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption>
                  {activeTab === 'all' 
                    ? "A list of all your transactions" 
                    : `A list of your ${activeTab} transactions`}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    {(['admin', 'subadmin'].includes(user?.role)) && (
                      <TableHead>User</TableHead>
                    )}
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Remarks</TableHead>
                    {(['admin', 'subadmin'].includes(user?.role)) && activeTab === 'pending' && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.id}</TableCell>
                      {(['admin', 'subadmin'].includes(user?.role)) && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{tx.user_name || `User #${tx.user_id}`}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.type)}
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={
                          tx.type === 'withdrawal' || tx.type === 'bet'
                            ? 'text-red-600'
                            : 'text-green-600'
                        }>
                          {tx.type === 'withdrawal' || tx.type === 'bet'
                            ? `-₹${tx.amount.toFixed(2)}`
                            : `+₹${tx.amount.toFixed(2)}`}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell>{format(new Date(tx.created_at), 'PPp')}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {tx.remarks || '-'}
                      </TableCell>
                      {(['admin', 'subadmin'].includes(user?.role)) && activeTab === 'pending' && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-green-600"
                                  onClick={() => setSelectedTransaction(tx)}
                                >
                                  <Check className="h-3 w-3 mr-1" /> Approve
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                {/* Dialog content is reused */}
                              </DialogContent>
                            </Dialog>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-red-600"
                                  onClick={() => setSelectedTransaction(tx)}
                                >
                                  <X className="h-3 w-3 mr-1" /> Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                {/* Dialog content is reused */}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      )}
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