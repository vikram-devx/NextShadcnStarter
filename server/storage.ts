import {
  users, markets, gameTypes, marketGames, bets, transactions,
  type User, type InsertUser,
  type Market, type InsertMarket,
  type GameType, type InsertGameType,
  type MarketGame, type InsertMarketGame,
  type Bet, type InsertBet,
  type Transaction, type InsertTransaction
} from "@shared/schema";

// Storage interface with CRUD operations for all entities
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersBySubadminId(subadminId: number): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  blockUser(id: number, blockedBy: number): Promise<User | undefined>;
  unblockUser(id: number, unblockedBy: number): Promise<User | undefined>;
  
  // Market operations
  getMarket(id: number): Promise<Market | undefined>;
  getAllMarkets(): Promise<Market[]>;
  getOpenMarkets(): Promise<Market[]>;
  createMarket(market: InsertMarket): Promise<Market>;
  updateMarket(id: number, market: Partial<Market>): Promise<Market | undefined>;
  openMarket(id: number): Promise<Market | undefined>;
  closeMarket(id: number): Promise<Market | undefined>;
  declareResult(id: number, result: string): Promise<Market | undefined>;
  
  // Game type operations
  getGameType(id: number): Promise<GameType | undefined>;
  getAllGameTypes(): Promise<GameType[]>;
  createGameType(gameType: InsertGameType): Promise<GameType>;
  updateGameType(id: number, gameType: Partial<GameType>): Promise<GameType | undefined>;
  
  // Market game operations
  getMarketGame(id: number): Promise<MarketGame | undefined>;
  getGamesByMarketId(marketId: number): Promise<GameType[]>;
  getMarketsByGameTypeId(gameTypeId: number): Promise<Market[]>;
  addGameToMarket(marketGame: InsertMarketGame): Promise<MarketGame>;
  removeGameFromMarket(marketId: number, gameTypeId: number): Promise<boolean>;
  
  // Bet operations
  getBet(id: number): Promise<Bet | undefined>;
  getUserBets(userId: number): Promise<Bet[]>;
  getMarketBets(marketId: number): Promise<Bet[]>;
  getAllBets(): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBetStatus(id: number, status: 'won' | 'lost'): Promise<Bet | undefined>;
  processBetsForMarket(marketId: number, result: string): Promise<void>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  getPendingTransactions(subadminId?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  approveTransaction(id: number, approverId: number, remarks?: string): Promise<Transaction | undefined>;
  rejectTransaction(id: number, approverId: number, remarks?: string): Promise<Transaction | undefined>;
  updateWalletBalance(userId: number, amount: number): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  // In-memory data storage
  private users: Map<number, User>;
  private markets: Map<number, Market>;
  private gameTypes: Map<number, GameType>;
  private marketGames: Map<number, MarketGame>;
  private bets: Map<number, Bet>;
  private transactions: Map<number, Transaction>;
  
  // IDs for auto-increment
  private userCurrentId: number;
  private marketCurrentId: number;
  private gameTypeCurrentId: number;
  private marketGameCurrentId: number;
  private betCurrentId: number;
  private transactionCurrentId: number;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.markets = new Map();
    this.gameTypes = new Map();
    this.marketGames = new Map();
    this.bets = new Map();
    this.transactions = new Map();
    
    // Initialize IDs
    this.userCurrentId = 1;
    this.marketCurrentId = 1;
    this.gameTypeCurrentId = 1;
    this.marketGameCurrentId = 1;
    this.betCurrentId = 1;
    this.transactionCurrentId = 1;
    
    // Initialize sample data
    this.initializeSampleData();
  }
  
  private async initializeSampleData() {
    try {
      // Create admin user
      const adminUser = await this.createUser({
        username: "admin",
        password: "admin123", // Would be hashed in a real app
        name: "System Admin",
        email: "admin@example.com",
        role: "admin",
        status: "active",
      });

      // Create subadmin user
      const subadminUser = await this.createUser({
        username: "subadmin",
        password: "subadmin123",
        name: "Sub Admin",
        email: "subadmin@satamatka.com",
        role: "subadmin",
        status: "active",
      });
      
      // Create player user
      const playerUser = await this.createUser({
        username: "player",
        password: "player123",
        name: "Test Player",
        email: "player@satamatka.com",
        role: "player",
        status: "active",
        subadmin_id: subadminUser.id,
      });
      
      // Update wallet balances
      await this.updateUser(adminUser.id, { wallet_balance: 10000 });
      await this.updateUser(subadminUser.id, { wallet_balance: 5000 });
      await this.updateUser(playerUser.id, { wallet_balance: 1000 });
      
      // Create game types
      const jodiGame = await this.createGameType({
        name: "Jodi Game",
        type: "jodi",
        description: "Bet on a pair of numbers. Win big if your chosen pair matches the result.",
        min_bet_amount: 10,
        max_bet_amount: 10000,
        payout_ratio: 90,
        admin_id: adminUser.id,
      });
      
      const hurfGame = await this.createGameType({
        name: "Hurf Game",
        type: "hurf",
        description: "Bet on a single digit. Win if your digit appears in the result.",
        min_bet_amount: 10,
        max_bet_amount: 5000,
        payout_ratio: 9,
        admin_id: adminUser.id,
      });
      
      const crossGame = await this.createGameType({
        name: "Cross Game",
        type: "cross",
        description: "Bet on numbers appearing in a specific pattern. Higher risk, higher rewards.",
        min_bet_amount: 10,
        max_bet_amount: 2000,
        payout_ratio: 12,
        admin_id: adminUser.id,
      });
      
      const oddEvenGame = await this.createGameType({
        name: "Odd-Even Game",
        type: "odd_even",
        description: "Bet on whether the result will be an odd or even number. Simple and popular.",
        min_bet_amount: 10,
        max_bet_amount: 20000,
        payout_ratio: 2,
        admin_id: adminUser.id,
      });
      
      // Create markets
      const openMarket = await this.createMarket({
        name: "Morning Star Market",
        description: "Daily morning market with all game types available",
        status: "open",
        open_time: new Date(new Date().setHours(9, 0, 0, 0)),
        close_time: new Date(new Date().setHours(12, 0, 0, 0)),
        result: null,
        admin_id: adminUser.id,
      });
      
      const closedMarket = await this.createMarket({
        name: "Evening Glory Market",
        description: "Daily evening market with all game types available",
        status: "closed",
        open_time: new Date(new Date().setHours(15, 0, 0, 0)),
        close_time: new Date(new Date().setHours(18, 0, 0, 0)),
        result: "27",
        admin_id: adminUser.id,
      });
      
      // Add game types to markets
      await this.addGameToMarket({
        market_id: openMarket.id,
        game_type_id: jodiGame.id,
      });
      
      await this.addGameToMarket({
        market_id: openMarket.id,
        game_type_id: hurfGame.id,
      });
      
      await this.addGameToMarket({
        market_id: openMarket.id,
        game_type_id: crossGame.id,
      });
      
      await this.addGameToMarket({
        market_id: openMarket.id,
        game_type_id: oddEvenGame.id,
      });
      
      await this.addGameToMarket({
        market_id: closedMarket.id,
        game_type_id: jodiGame.id,
      });
      
      // Create some sample bets
      const bet1 = await this.createBet({
        user_id: playerUser.id,
        market_id: openMarket.id,
        game_type_id: jodiGame.id,
        selected_number: "27",
        bet_amount: 100,
        potential_winnings: 9000,
        is_subadmin_transaction: false,
      });
      
      // Create a direct bet with status won (bypassing the normal flow)
      const bet2: Bet = {
        id: this.betCurrentId++,
        user_id: playerUser.id,
        market_id: closedMarket.id,
        game_type_id: jodiGame.id,
        selected_number: "27",
        bet_amount: 50,
        potential_winnings: 4500,
        status: "won",
        created_at: new Date(new Date().setDate(new Date().getDate() - 1)),
        updated_at: new Date(),
      };
      this.bets.set(bet2.id, bet2);
      
      // Create some sample transactions (directly to avoid balance changes)
      const tx1: Transaction = {
        id: this.transactionCurrentId++,
        user_id: playerUser.id,
        type: "deposit",
        amount: 1000,
        status: "approved",
        remarks: "Initial deposit",
        approver_id: subadminUser.id,
        reference_id: null,
        is_subadmin_transaction: false,
        created_at: new Date(new Date().setDate(new Date().getDate() - 7)),
        updated_at: new Date(new Date().setDate(new Date().getDate() - 7)),
      };
      this.transactions.set(tx1.id, tx1);
      
      const tx3: Transaction = {
        id: this.transactionCurrentId++,
        user_id: playerUser.id,
        type: "winning",
        amount: 4500,
        status: "approved",
        remarks: "Winning from Evening Glory Market",
        reference_id: bet2.id,
        is_subadmin_transaction: false,
        created_at: new Date(new Date().setDate(new Date().getDate() - 1)),
        updated_at: new Date(new Date().setDate(new Date().getDate() - 1)),
      };
      this.transactions.set(tx3.id, tx3);
      
      const tx4: Transaction = {
        id: this.transactionCurrentId++,
        user_id: playerUser.id,
        type: "withdrawal",
        amount: 2000,
        status: "pending",
        remarks: "Withdrawal request",
        is_subadmin_transaction: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.transactions.set(tx4.id, tx4);
      
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUsersBySubadminId(subadminId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.subadmin_id === subadminId,
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    
    // Create a fully typed User object with all required fields
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      name: insertUser.name,
      email: insertUser.email,
      phone: insertUser.phone || null,
      role: insertUser.role || 'player',
      status: insertUser.status || 'active',
      wallet_balance: 0,
      subadmin_id: insertUser.subadmin_id || null,
      created_at: now,
      updated_at: now,
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...userData,
      updated_at: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async blockUser(id: number, blockedBy: number): Promise<User | undefined> {
    return this.updateUser(id, { status: "blocked" });
  }
  
  async unblockUser(id: number, unblockedBy: number): Promise<User | undefined> {
    return this.updateUser(id, { status: "active" });
  }
  
  // Market operations
  async getMarket(id: number): Promise<Market | undefined> {
    return this.markets.get(id);
  }
  
  async getAllMarkets(): Promise<Market[]> {
    return Array.from(this.markets.values());
  }
  
  async getOpenMarkets(): Promise<Market[]> {
    return Array.from(this.markets.values()).filter(
      (market) => market.status === "open",
    );
  }
  
  async createMarket(marketData: InsertMarket): Promise<Market> {
    const id = this.marketCurrentId++;
    const now = new Date();
    
    const market: Market = {
      id,
      name: marketData.name,
      description: marketData.description || null,
      status: marketData.status || 'closed',
      open_time: marketData.open_time || null,
      close_time: marketData.close_time || null,
      result: marketData.result || null,
      admin_id: marketData.admin_id,
      created_at: now,
      updated_at: now,
    };
    
    this.markets.set(id, market);
    return market;
  }
  
  async updateMarket(id: number, marketData: Partial<Market>): Promise<Market | undefined> {
    const market = await this.getMarket(id);
    if (!market) return undefined;
    
    const updatedMarket = {
      ...market,
      ...marketData,
      updated_at: new Date(),
    };
    
    this.markets.set(id, updatedMarket);
    return updatedMarket;
  }
  
  async openMarket(id: number): Promise<Market | undefined> {
    return this.updateMarket(id, { 
      status: "open",
      open_time: new Date()
    });
  }
  
  async closeMarket(id: number): Promise<Market | undefined> {
    return this.updateMarket(id, { 
      status: "closed",
      close_time: new Date()
    });
  }
  
  async declareResult(id: number, result: string): Promise<Market | undefined> {
    const updatedMarket = await this.updateMarket(id, { result });
    if (updatedMarket) {
      // Process bets for this market
      await this.processBetsForMarket(id, result);
    }
    return updatedMarket;
  }
  
  // Game type operations
  async getGameType(id: number): Promise<GameType | undefined> {
    return this.gameTypes.get(id);
  }
  
  async getAllGameTypes(): Promise<GameType[]> {
    return Array.from(this.gameTypes.values());
  }
  
  async createGameType(gameTypeData: InsertGameType): Promise<GameType> {
    const id = this.gameTypeCurrentId++;
    const now = new Date();
    
    const gameType: GameType = {
      id,
      name: gameTypeData.name,
      type: gameTypeData.type,
      description: gameTypeData.description || null,
      min_bet_amount: gameTypeData.min_bet_amount || 10,
      max_bet_amount: gameTypeData.max_bet_amount || 10000,
      payout_ratio: gameTypeData.payout_ratio,
      admin_id: gameTypeData.admin_id,
      created_at: now,
      updated_at: now,
    };
    
    this.gameTypes.set(id, gameType);
    return gameType;
  }
  
  async updateGameType(id: number, gameTypeData: Partial<GameType>): Promise<GameType | undefined> {
    const gameType = await this.getGameType(id);
    if (!gameType) return undefined;
    
    const updatedGameType = {
      ...gameType,
      ...gameTypeData,
      updated_at: new Date(),
    };
    
    this.gameTypes.set(id, updatedGameType);
    return updatedGameType;
  }
  
  // Market game operations
  async getMarketGame(id: number): Promise<MarketGame | undefined> {
    return this.marketGames.get(id);
  }
  
  async getGamesByMarketId(marketId: number): Promise<GameType[]> {
    const marketGameEntries = Array.from(this.marketGames.values())
      .filter(mg => mg.market_id === marketId);
    
    const gameTypes: GameType[] = [];
    for (const mg of marketGameEntries) {
      const gameType = await this.getGameType(mg.game_type_id);
      if (gameType) {
        gameTypes.push(gameType);
      }
    }
    
    return gameTypes;
  }
  
  async getMarketsByGameTypeId(gameTypeId: number): Promise<Market[]> {
    const marketGameEntries = Array.from(this.marketGames.values())
      .filter(mg => mg.game_type_id === gameTypeId);
    
    const markets: Market[] = [];
    for (const mg of marketGameEntries) {
      const market = await this.getMarket(mg.market_id);
      if (market) {
        markets.push(market);
      }
    }
    
    return markets;
  }
  
  async addGameToMarket(marketGameData: InsertMarketGame): Promise<MarketGame> {
    const id = this.marketGameCurrentId++;
    const now = new Date();
    
    const marketGame: MarketGame = {
      ...marketGameData,
      id,
      created_at: now,
      updated_at: now,
    };
    
    this.marketGames.set(id, marketGame);
    return marketGame;
  }
  
  async removeGameFromMarket(marketId: number, gameTypeId: number): Promise<boolean> {
    const entries = Array.from(this.marketGames.entries());
    for (const [id, mg] of entries) {
      if (mg.market_id === marketId && mg.game_type_id === gameTypeId) {
        this.marketGames.delete(id);
        return true;
      }
    }
    return false;
  }
  
  // Bet operations
  async getBet(id: number): Promise<Bet | undefined> {
    return this.bets.get(id);
  }
  
  async getUserBets(userId: number): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter(bet => bet.user_id === userId);
  }
  
  async getMarketBets(marketId: number): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter(bet => bet.market_id === marketId);
  }
  
  async getAllBets(): Promise<Bet[]> {
    return Array.from(this.bets.values());
  }
  
  async createBet(betData: InsertBet): Promise<Bet> {
    const id = this.betCurrentId++;
    const now = new Date();
    
    const bet: Bet = {
      ...betData,
      id,
      status: "pending",
      created_at: now,
      updated_at: now,
    };
    
    this.bets.set(id, bet);
    
    // Deduct the bet amount from user's wallet
    await this.updateWalletBalance(betData.user_id, -betData.bet_amount);
    
    // Create a transaction for the bet
    await this.createTransaction({
      user_id: betData.user_id,
      type: "bet",
      amount: betData.bet_amount,
      status: "approved",
      reference_id: id,
      is_subadmin_transaction: false,
    });
    
    return bet;
  }
  
  async updateBetStatus(id: number, status: 'won' | 'lost'): Promise<Bet | undefined> {
    const bet = await this.getBet(id);
    if (!bet) return undefined;
    
    const updatedBet = {
      ...bet,
      status,
      updated_at: new Date(),
    };
    
    this.bets.set(id, updatedBet);
    
    // If bet is won, add winnings to user's wallet
    if (status === 'won') {
      await this.updateWalletBalance(bet.user_id, bet.potential_winnings);
      
      // Create a transaction for the winning
      await this.createTransaction({
        user_id: bet.user_id,
        type: "winning",
        amount: bet.potential_winnings,
        status: "approved",
        reference_id: id,
        is_subadmin_transaction: false,
      });
    }
    
    return updatedBet;
  }
  
  async processBetsForMarket(marketId: number, result: string): Promise<void> {
    const bets = await this.getMarketBets(marketId);
    
    for (const bet of bets) {
      if (bet.status !== "pending") continue;
      
      const gameType = await this.getGameType(bet.game_type_id);
      if (!gameType) continue;
      
      let isWinning = false;
      
      // Check if bet is a winner based on game type
      switch (gameType.type) {
        case "jodi":
          // Direct match of 2-digit number
          isWinning = bet.selected_number === result;
          break;
          
        case "odd_even":
          // Check if result is odd or even
          const resultNum = parseInt(result);
          const isOdd = resultNum % 2 === 1;
          isWinning = (bet.selected_number === "odd" && isOdd) || 
                      (bet.selected_number === "even" && !isOdd);
          break;
          
        case "hurf":
          // Check if selected digit matches position (left or right)
          const [leftDigit, rightDigit] = result.split('');
          if (bet.selected_number.length === 1) {
            // Single position bet
            const position = bet.selected_number.charAt(0);
            if (position === 'l') {
              isWinning = bet.selected_number.charAt(1) === leftDigit;
            } else if (position === 'r') {
              isWinning = bet.selected_number.charAt(1) === rightDigit;
            }
          } else if (bet.selected_number.length === 2) {
            // Double position bet
            isWinning = bet.selected_number === result;
          }
          break;
          
        case "cross":
          // Check if any permutation of selected digits matches result
          const selectedDigits = bet.selected_number.split('');
          
          // Generate all possible 2-digit permutations
          const permutations: string[] = [];
          for (let i = 0; i < selectedDigits.length; i++) {
            for (let j = 0; j < selectedDigits.length; j++) {
              if (i !== j) {
                permutations.push(selectedDigits[i] + selectedDigits[j]);
              }
            }
          }
          
          isWinning = permutations.includes(result);
          break;
      }
      
      // Update bet status
      await this.updateBetStatus(bet.id, isWinning ? "won" : "lost");
    }
  }
  
  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getUserTransactions(userId: number): Promise<(Transaction & { user_name?: string })[]> {
    const transactions = Array.from(this.transactions.values())
      .filter(tx => tx.user_id === userId);
    
    // Add user name to each transaction
    const user = await this.getUser(userId);
    if (user) {
      return transactions.map(tx => ({
        ...tx,
        user_name: user.name
      }));
    }
    
    return transactions;
  }
  
  async getPendingTransactions(subadminId?: number): Promise<(Transaction & { user_name?: string })[]> {
    let pendingTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.status === "pending");
    
    if (subadminId) {
      // Get users under this subadmin
      const subadminUsers = await this.getUsersBySubadminId(subadminId);
      const userIds = subadminUsers.map(u => u.id);
      
      // Filter transactions to only include those from subadmin's users
      pendingTransactions = pendingTransactions.filter(tx =>
        userIds.includes(tx.user_id) || 
        (tx.is_subadmin_transaction && tx.user_id === subadminId)
      );
    }
    
    // Add user name to each transaction
    const enhancedTransactions = await Promise.all(
      pendingTransactions.map(async (tx) => {
        const user = await this.getUser(tx.user_id);
        return {
          ...tx,
          user_name: user ? user.name : `User #${tx.user_id}`
        };
      })
    );
    
    return enhancedTransactions;
  }
  
  async createTransaction(txData: InsertTransaction): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    const now = new Date();
    
    const transaction: Transaction = {
      id,
      user_id: txData.user_id,
      type: txData.type,
      amount: txData.amount,
      status: txData.status || 'pending',
      remarks: txData.remarks || null,
      payment_proof: txData.payment_proof || null,
      is_subadmin_transaction: txData.is_subadmin_transaction || false,
      reference_id: txData.reference_id || null,
      approver_id: null,
      created_at: now,
      updated_at: now,
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async approveTransaction(id: number, approverId: number, remarks?: string): Promise<Transaction | undefined> {
    const tx = await this.getTransaction(id);
    if (!tx || tx.status !== "pending") return undefined;
    
    const updatedTx = {
      ...tx,
      status: "approved" as const,
      approver_id: approverId,
      remarks: remarks || tx.remarks,
      updated_at: new Date(),
    };
    
    this.transactions.set(id, updatedTx);
    
    // For deposit and withdrawal, update wallet balance
    if (tx.type === "deposit") {
      await this.updateWalletBalance(tx.user_id, tx.amount);
    }
    
    return updatedTx;
  }
  
  async rejectTransaction(id: number, approverId: number, remarks?: string): Promise<Transaction | undefined> {
    const tx = await this.getTransaction(id);
    if (!tx || tx.status !== "pending") return undefined;
    
    const updatedTx = {
      ...tx,
      status: "rejected" as const,
      approver_id: approverId,
      remarks: remarks || tx.remarks,
      updated_at: new Date(),
    };
    
    this.transactions.set(id, updatedTx);
    
    // For withdrawal, refund the amount back to wallet
    if (tx.type === "withdrawal") {
      await this.updateWalletBalance(tx.user_id, tx.amount);
    }
    
    return updatedTx;
  }
  
  async updateWalletBalance(userId: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const newBalance = user.wallet_balance + amount;
    
    return this.updateUser(userId, { wallet_balance: newBalance });
  }
}

import { db } from './db';
import { eq, and, or, desc, isNull, isNotNull, asc, gte, lte, sql } from 'drizzle-orm';
import connectPg from 'connect-pg-simple';
import session from 'express-session';
import { Pool } from '@neondatabase/serverless';

// Database implementation of the IStorage interface

const PostgresSessionStore = connectPg(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      tableName: 'session',
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsersBySubadminId(subadminId: number): Promise<User[]> {
    return db.select().from(users).where(eq(users.subadmin_id, subadminId));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.created_at));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async blockUser(id: number, blockedBy: number): Promise<User | undefined> {
    return this.updateUser(id, { status: "blocked" });
  }

  async unblockUser(id: number, unblockedBy: number): Promise<User | undefined> {
    return this.updateUser(id, { status: "active" });
  }

  // Market operations
  async getMarket(id: number): Promise<Market | undefined> {
    const [market] = await db.select().from(markets).where(eq(markets.id, id));
    return market;
  }

  async getAllMarkets(): Promise<Market[]> {
    return db.select().from(markets).orderBy(desc(markets.created_at));
  }

  async getOpenMarkets(): Promise<Market[]> {
    return db
      .select()
      .from(markets)
      .where(eq(markets.status, "open"))
      .orderBy(asc(markets.open_time));
  }

  async createMarket(marketData: InsertMarket): Promise<Market> {
    const [market] = await db.insert(markets).values(marketData).returning();
    return market;
  }

  async updateMarket(id: number, marketData: Partial<Market>): Promise<Market | undefined> {
    const [market] = await db
      .update(markets)
      .set({ ...marketData, updated_at: new Date() })
      .where(eq(markets.id, id))
      .returning();
    return market;
  }

  async openMarket(id: number): Promise<Market | undefined> {
    return this.updateMarket(id, { 
      status: "open",
      open_time: new Date() 
    });
  }

  async closeMarket(id: number): Promise<Market | undefined> {
    return this.updateMarket(id, { 
      status: "closed",
      close_time: new Date() 
    });
  }

  async declareResult(id: number, result: string): Promise<Market | undefined> {
    const updatedMarket = await this.updateMarket(id, { result });
    if (updatedMarket) {
      await this.processBetsForMarket(id, result);
    }
    return updatedMarket;
  }

  // Game type operations
  async getGameType(id: number): Promise<GameType | undefined> {
    const [gameType] = await db.select().from(gameTypes).where(eq(gameTypes.id, id));
    return gameType;
  }

  async getAllGameTypes(): Promise<GameType[]> {
    return db.select().from(gameTypes).orderBy(asc(gameTypes.name));
  }

  async createGameType(gameTypeData: InsertGameType): Promise<GameType> {
    const [gameType] = await db.insert(gameTypes).values(gameTypeData).returning();
    return gameType;
  }

  async updateGameType(id: number, gameTypeData: Partial<GameType>): Promise<GameType | undefined> {
    const [gameType] = await db
      .update(gameTypes)
      .set({ ...gameTypeData, updated_at: new Date() })
      .where(eq(gameTypes.id, id))
      .returning();
    return gameType;
  }

  // Market game operations
  async getMarketGame(id: number): Promise<MarketGame | undefined> {
    const [marketGame] = await db.select().from(marketGames).where(eq(marketGames.id, id));
    return marketGame;
  }

  async getGamesByMarketId(marketId: number): Promise<GameType[]> {
    const query = db
      .select({
        gameType: gameTypes
      })
      .from(marketGames)
      .innerJoin(gameTypes, eq(marketGames.game_type_id, gameTypes.id))
      .where(eq(marketGames.market_id, marketId));
    
    const result = await query;
    return result.map(row => row.gameType);
  }

  async getMarketsByGameTypeId(gameTypeId: number): Promise<Market[]> {
    const query = db
      .select({
        market: markets
      })
      .from(marketGames)
      .innerJoin(markets, eq(marketGames.market_id, markets.id))
      .where(eq(marketGames.game_type_id, gameTypeId));
    
    const result = await query;
    return result.map(row => row.market);
  }

  async addGameToMarket(marketGameData: InsertMarketGame): Promise<MarketGame> {
    try {
      const [marketGame] = await db
        .insert(marketGames)
        .values(marketGameData)
        .returning();
      return marketGame;
    } catch (error) {
      // Handle unique constraint violation
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new Error("This game is already added to the market");
      }
      throw error;
    }
  }

  async removeGameFromMarket(marketId: number, gameTypeId: number): Promise<boolean> {
    const result = await db
      .delete(marketGames)
      .where(
        and(
          eq(marketGames.market_id, marketId),
          eq(marketGames.game_type_id, gameTypeId)
        )
      );
    
    return true; // In Drizzle, successful deletion doesn't return count
  }

  // Bet operations
  async getBet(id: number): Promise<Bet | undefined> {
    const [bet] = await db.select().from(bets).where(eq(bets.id, id));
    return bet;
  }

  async getUserBets(userId: number): Promise<Bet[]> {
    return db
      .select()
      .from(bets)
      .where(eq(bets.user_id, userId))
      .orderBy(desc(bets.created_at));
  }

  async getMarketBets(marketId: number): Promise<Bet[]> {
    return db
      .select()
      .from(bets)
      .where(eq(bets.market_id, marketId))
      .orderBy(desc(bets.created_at));
  }

  async getAllBets(): Promise<Bet[]> {
    return db.select().from(bets).orderBy(desc(bets.created_at));
  }

  async createBet(betData: InsertBet): Promise<Bet> {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // 1. Get the user to check wallet balance
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, betData.user_id));
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // 2. Get the game type to calculate potential winnings
      const [gameType] = await tx
        .select()
        .from(gameTypes)
        .where(eq(gameTypes.id, betData.game_type_id));
      
      if (!gameType) {
        throw new Error("Game type not found");
      }
      
      // 3. Check if bet amount is within the allowed range
      if (betData.bet_amount < gameType.min_bet_amount || 
          betData.bet_amount > gameType.max_bet_amount) {
        throw new Error(`Bet amount must be between ${gameType.min_bet_amount} and ${gameType.max_bet_amount}`);
      }
      
      // 4. Check if user has enough balance
      if (user.wallet_balance < betData.bet_amount) {
        throw new Error("Insufficient wallet balance");
      }
      
      // 5. Calculate potential winnings
      const potentialWinnings = betData.bet_amount * gameType.payout_ratio;
      
      // 6. Create the bet
      const [bet] = await tx
        .insert(bets)
        .values({
          ...betData,
          potential_winnings: potentialWinnings,
        })
        .returning();
        
      // 7. Deduct amount from user's wallet
      await tx
        .update(users)
        .set({ 
          wallet_balance: user.wallet_balance - betData.bet_amount,
          updated_at: new Date()
        })
        .where(eq(users.id, betData.user_id));
        
      // 8. Create a transaction record for the bet
      await tx
        .insert(transactions)
        .values({
          user_id: betData.user_id,
          amount: -betData.bet_amount,
          type: "bet",
          description: `Bet placed on market ID ${betData.market_id}`,
          status: "approved",
          bet_id: bet.id,
          is_subadmin_transaction: betData.is_subadmin_transaction || false,
          created_at: new Date(),
          updated_at: new Date()
        });
        
      return bet;
    });
  }

  async updateBetStatus(id: number, status: 'won' | 'lost'): Promise<Bet | undefined> {
    const [bet] = await db
      .update(bets)
      .set({ status, updated_at: new Date() })
      .where(eq(bets.id, id))
      .returning();
    
    if (bet && status === 'won') {
      await this.processBetWinning(bet);
    }
    
    return bet;
  }

  private async processBetWinning(bet: Bet): Promise<void> {
    // Process individual winning bet
    await db.transaction(async (tx) => {
      // 1. Get the user
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, bet.user_id));
      
      if (!user) {
        throw new Error(`User not found: ${bet.user_id}`);
      }
      
      // 2. Update user's wallet
      await tx
        .update(users)
        .set({ 
          wallet_balance: user.wallet_balance + bet.potential_winnings,
          updated_at: new Date()
        })
        .where(eq(users.id, bet.user_id));
        
      // 3. Create winning transaction
      await tx
        .insert(transactions)
        .values({
          user_id: bet.user_id,
          amount: bet.potential_winnings,
          type: "winning",
          description: `Winning from bet ID ${bet.id}`,
          status: "approved",
          bet_id: bet.id,
          created_at: new Date(),
          updated_at: new Date()
        });
    });
  }

  async processBetsForMarket(marketId: number, result: string): Promise<void> {
    // Get all pending bets for this market
    const pendingBets = await db
      .select()
      .from(bets)
      .where(
        and(
          eq(bets.market_id, marketId),
          eq(bets.status, "pending")
        )
      );
      
    // Process each bet based on game type and result
    for (const bet of pendingBets) {
      let isWinner = false;
      
      // Get the game type to determine winning logic
      const gameType = await this.getGameType(bet.game_type_id);
      if (!gameType) continue;
      
      // Apply game-specific winning logic
      switch (gameType.type) {
        case "jodi":
          // Exact match for jodi games
          isWinner = bet.selected_number === result;
          break;
          
        case "hurf":
          // Match any digit for hurf games
          isWinner = result.includes(bet.selected_number);
          break;
          
        case "cross":
          // Game-specific logic for cross games
          // This would depend on the specific rules of the cross game
          // For now, implementing a simple pattern match
          isWinner = bet.selected_number.split('').every(digit => 
            result.includes(digit)
          );
          break;
          
        case "odd_even":
          // Odd/Even logic
          const resultNum = parseInt(result, 10);
          if (!isNaN(resultNum)) {
            if (bet.selected_number.toLowerCase() === "odd") {
              isWinner = resultNum % 2 !== 0;
            } else if (bet.selected_number.toLowerCase() === "even") {
              isWinner = resultNum % 2 === 0;
            }
          }
          break;
      }
      
      // Update bet status and process winning if applicable
      await this.updateBetStatus(bet.id, isWinner ? "won" : "lost");
    }
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .orderBy(desc(transactions.created_at));
  }

  async getPendingTransactions(subadminId?: number): Promise<Transaction[]> {
    if (subadminId) {
      // For subadmin: get transactions of players under this subadmin
      const subadminPlayers = await this.getUsersBySubadminId(subadminId);
      const playerIds = subadminPlayers.map(player => player.id);
      
      if (playerIds.length === 0) return [];
      
      return db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.status, "pending"),
            or(...playerIds.map(id => eq(transactions.user_id, id)))
          )
        )
        .orderBy(asc(transactions.created_at));
    }
    
    // For admin: get all pending transactions
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.status, "pending"))
      .orderBy(asc(transactions.created_at));
  }

  async createTransaction(txData: InsertTransaction): Promise<Transaction> {
    // Handle deposit and withdrawal transactions
    if (txData.type === "deposit" || txData.type === "withdrawal" || txData.type === "adjustment") {
      const [transaction] = await db
        .insert(transactions)
        .values(txData)
        .returning();
        
      return transaction;
    } else {
      throw new Error(`Direct creation of ${txData.type} transactions is not allowed`);
    }
  }

  async approveTransaction(id: number, approverId: number, remarks?: string): Promise<Transaction | undefined> {
    return await db.transaction(async (tx) => {
      // 1. Get the transaction
      const [transaction] = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, id));
        
      if (!transaction) {
        throw new Error("Transaction not found");
      }
      
      if (transaction.status !== "pending") {
        throw new Error("Only pending transactions can be approved");
      }
      
      // 2. Update transaction status
      const [updatedTransaction] = await tx
        .update(transactions)
        .set({ 
          status: "approved", 
          approver_id: approverId,
          remarks: remarks || null,
          updated_at: new Date()
        })
        .where(eq(transactions.id, id))
        .returning();
        
      // 3. Update user's wallet balance
      await this.updateWalletBalance(transaction.user_id, transaction.amount);
      
      return updatedTransaction;
    });
  }

  async rejectTransaction(id: number, approverId: number, remarks?: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ 
        status: "rejected", 
        approver_id: approverId,
        remarks: remarks || null,
        updated_at: new Date()
      })
      .where(eq(transactions.id, id))
      .returning();
      
    return transaction;
  }

  async updateWalletBalance(userId: number, amount: number): Promise<User | undefined> {
    return await db.transaction(async (tx) => {
      // 1. Get the user
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId));
        
      if (!user) {
        throw new Error("User not found");
      }
      
      // 2. Calculate new balance
      // For deposits and winnings: positive amount
      // For withdrawals and bets: negative amount
      const newBalance = user.wallet_balance + amount;
      
      if (newBalance < 0) {
        throw new Error("Insufficient balance");
      }
      
      // 3. Update the user's wallet
      const [updatedUser] = await tx
        .update(users)
        .set({ 
          wallet_balance: newBalance,
          updated_at: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
        
      return updatedUser;
    });
  }
}

// Use memory storage for development, database storage for production
// export const storage = new MemStorage();
export const storage = new DatabaseStorage();
