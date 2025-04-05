/**
 * Utility functions for formatting data values consistently across the application
 */

/**
 * Safely formats a transaction type with proper capitalization
 */
export const formatTransactionType = (transaction: any) => {
  if (!transaction || !transaction.type) return "Transaction";
  return transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
};

/**
 * Safely formats a transaction amount to 2 decimal places
 */
export const formatTransactionAmount = (transaction: any) => {
  if (!transaction || typeof transaction.amount !== 'number') return "0.00";
  return transaction.amount.toFixed(2);
};

/**
 * Safely formats a wallet balance to 2 decimal places
 */
export const formatWalletBalance = (user: any) => {
  if (!user || typeof user.wallet_balance !== 'number') return "0.00";
  return user.wallet_balance.toFixed(2);
};

/**
 * Returns proper variant name for transaction status badge
 */
export const getTransactionStatusVariant = (status: string | undefined) => {
  if (!status) return "outline";
  
  switch (status.toLowerCase()) {
    case 'approved':
      return "success";
    case 'rejected':
      return "destructive";
    case 'pending':
      return "outline";
    default:
      return "outline";
  }
};

/**
 * Returns proper variant name for bet status badge
 */
export const getBetStatusVariant = (status: string | undefined) => {
  if (!status) return "outline";
  
  switch (status.toLowerCase()) {
    case 'won':
      return "success";
    case 'lost':
      return "destructive";
    case 'pending':
      return "outline";
    default:
      return "outline";
  }
};