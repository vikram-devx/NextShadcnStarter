import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, foreignKey, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'subadmin', 'player']);
export const userStatusEnum = pgEnum('user_status', ['active', 'blocked']);
export const marketStatusEnum = pgEnum('market_status', ['open', 'closed']);
export const gameTypeEnum = pgEnum('game_type', ['jodi', 'hurf', 'cross', 'odd_even']);
export const betStatusEnum = pgEnum('bet_status', ['pending', 'won', 'lost']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal', 'bet', 'winning', 'adjustment']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'approved', 'rejected']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default('player'),
  status: userStatusEnum("status").notNull().default('active'),
  wallet_balance: doublePrecision("wallet_balance").notNull().default(0),
  subadmin_id: integer("subadmin_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Markets table
export const markets = pgTable("markets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  banner_image: text("banner_image"),
  status: marketStatusEnum("status").notNull().default('closed'),
  open_time: timestamp("open_time"),
  close_time: timestamp("close_time"),
  result: text("result"),
  admin_id: integer("admin_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Game types table
export const gameTypes = pgTable("game_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: gameTypeEnum("type").notNull(),
  description: text("description"),
  min_bet_amount: doublePrecision("min_bet_amount").notNull().default(10),
  max_bet_amount: doublePrecision("max_bet_amount").notNull().default(10000),
  payout_ratio: doublePrecision("payout_ratio").notNull(),
  admin_id: integer("admin_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Market games (junction table between markets and game types)
export const marketGames = pgTable("market_games", {
  id: serial("id").primaryKey(),
  market_id: integer("market_id").notNull().references(() => markets.id),
  game_type_id: integer("game_type_id").notNull().references(() => gameTypes.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Bets table
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  market_id: integer("market_id").notNull().references(() => markets.id),
  game_type_id: integer("game_type_id").notNull().references(() => gameTypes.id),
  selected_number: text("selected_number").notNull(),
  bet_amount: doublePrecision("bet_amount").notNull(),
  potential_winnings: doublePrecision("potential_winnings").notNull(),
  status: betStatusEnum("status").notNull().default('pending'),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  type: transactionTypeEnum("type").notNull(),
  amount: doublePrecision("amount").notNull(),
  status: transactionStatusEnum("status").notNull().default('pending'),
  remarks: text("remarks"),
  payment_proof: text("payment_proof"),
  approver_id: integer("approver_id").references(() => users.id),
  is_subadmin_transaction: boolean("is_subadmin_transaction").notNull().default(false),
  reference_id: integer("reference_id"), // For bet/winning reference
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
  wallet_balance: true,
});

export const insertMarketSchema = createInsertSchema(markets).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertGameTypeSchema = createInsertSchema(gameTypes).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertMarketGameSchema = createInsertSchema(marketGames).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  created_at: true,
  updated_at: true,
  status: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  created_at: true,
  updated_at: true,
  approver_id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMarket = z.infer<typeof insertMarketSchema>;
export type Market = typeof markets.$inferSelect;

export type InsertGameType = z.infer<typeof insertGameTypeSchema>;
export type GameType = typeof gameTypes.$inferSelect;

export type InsertMarketGame = z.infer<typeof insertMarketGameSchema>;
export type MarketGame = typeof marketGames.$inferSelect;

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
