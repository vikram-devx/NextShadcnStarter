import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertMarketSchema, insertGameTypeSchema, 
  insertMarketGameSchema, insertBetSchema, insertTransactionSchema 
} from "@shared/schema";
import { z } from "zod";

// Extend Express Request interface to include session
declare global {
  namespace Express {
    interface Request {
      session: {
        userId?: number;
        userRole?: 'admin' | 'subadmin' | 'player';
        destroy: (callback?: (err?: any) => void) => void;
      } & Record<string, any>;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      if (user.password !== password) { // In a real app, use proper password hashing
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      if (user.status === 'blocked') {
        return res.status(403).json({ error: 'Your account has been blocked' });
      }

      // Create a user session (in a real app, use JWT or similar)
      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_balance: user.wallet_balance
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_balance: user.wallet_balance
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  });

  // User routes
  app.get('/api/users', async (req, res) => {
    // Check admin/subadmin authorization
    if (!req.session.userId || !['admin', 'subadmin'].includes(req.session.userRole)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
      let users;
      if (req.session.userRole === 'admin') {
        users = await storage.getAllUsers();
      } else {
        users = await storage.getUsersBySubadminId(req.session.userId);
      }

      // Remove sensitive data
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        wallet_balance: user.wallet_balance,
        subadmin_id: user.subadmin_id,
        created_at: user.created_at
      }));

      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertUserSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }

      // Check if creating a subadmin (only admins can create subadmins)
      if (validatedData.data.role === 'subadmin' && req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can create subadmins' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.data.username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      // Set subadmin_id for players if request is from a subadmin
      if (req.session.userRole === 'subadmin' && validatedData.data.role === 'player') {
        validatedData.data.subadmin_id = req.session.userId;
      }

      const user = await storage.createUser(validatedData.data);
      res.status(201).json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.patch('/api/users/:id/block', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Check admin/subadmin authorization
      if (!req.session.userId || !['admin', 'subadmin'].includes(req.session.userRole)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if subadmin is trying to block their own user
      if (req.session.userRole === 'subadmin' && user.subadmin_id !== req.session.userId) {
        return res.status(403).json({ error: 'You can only block your own users' });
      }

      // Check if already blocked by admin
      if (user.status === 'blocked' && req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'This user was blocked by an admin' });
      }

      const blockedUser = await storage.blockUser(userId, req.session.userId);
      res.json({
        id: blockedUser.id,
        username: blockedUser.username,
        status: blockedUser.status
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to block user' });
    }
  });

  app.patch('/api/users/:id/unblock', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Only admins can unblock
      if (!req.session.userId || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can unblock users' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const unblockedUser = await storage.unblockUser(userId, req.session.userId);
      res.json({
        id: unblockedUser.id,
        username: unblockedUser.username,
        status: unblockedUser.status
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unblock user' });
    }
  });

  // Market routes
  app.get('/api/markets', async (req, res) => {
    try {
      const markets = await storage.getAllMarkets();
      res.json(markets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch markets' });
    }
  });

  app.get('/api/markets/open', async (req, res) => {
    try {
      const openMarkets = await storage.getOpenMarkets();
      res.json(openMarkets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch open markets' });
    }
  });

  app.post('/api/markets', async (req, res) => {
    try {
      // Only admins can create markets
      if (!req.session.userId || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can create markets' });
      }

      const validatedData = insertMarketSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }

      // Set admin ID from session
      validatedData.data.admin_id = req.session.userId;
      
      // Handle optional banner image field
      if (!validatedData.data.banner_image || validatedData.data.banner_image === '') {
        delete validatedData.data.banner_image;
      }

      const market = await storage.createMarket(validatedData.data);
      res.status(201).json(market);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create market' });
    }
  });

  app.patch('/api/markets/:id/open', async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);
      if (isNaN(marketId)) {
        return res.status(400).json({ error: 'Invalid market ID' });
      }

      // Only admins can open markets
      if (!req.session.userId || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can open markets' });
      }

      const market = await storage.getMarket(marketId);
      if (!market) {
        return res.status(404).json({ error: 'Market not found' });
      }

      const openedMarket = await storage.openMarket(marketId);
      res.json(openedMarket);
    } catch (error) {
      res.status(500).json({ error: 'Failed to open market' });
    }
  });

  app.patch('/api/markets/:id/close', async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);
      if (isNaN(marketId)) {
        return res.status(400).json({ error: 'Invalid market ID' });
      }

      // Only admins can close markets
      if (!req.session.userId || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can close markets' });
      }

      const market = await storage.getMarket(marketId);
      if (!market) {
        return res.status(404).json({ error: 'Market not found' });
      }

      const closedMarket = await storage.closeMarket(marketId);
      res.json(closedMarket);
    } catch (error) {
      res.status(500).json({ error: 'Failed to close market' });
    }
  });

  app.patch('/api/markets/:id/result', async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);
      if (isNaN(marketId)) {
        return res.status(400).json({ error: 'Invalid market ID' });
      }

      // Only admins can declare results
      if (!req.session.userId || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can declare results' });
      }

      const resultSchema = z.object({
        result: z.string().min(1)
      });

      const validatedData = resultSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }

      const market = await storage.getMarket(marketId);
      if (!market) {
        return res.status(404).json({ error: 'Market not found' });
      }

      if (market.status !== 'closed') {
        return res.status(400).json({ error: 'Market must be closed before declaring result' });
      }

      const updatedMarket = await storage.declareResult(marketId, validatedData.data.result);
      res.json(updatedMarket);
    } catch (error) {
      res.status(500).json({ error: 'Failed to declare result' });
    }
  });

  // Game types routes
  app.get('/api/game-types', async (req, res) => {
    try {
      const gameTypes = await storage.getAllGameTypes();
      res.json(gameTypes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch game types' });
    }
  });

  app.post('/api/game-types', async (req, res) => {
    try {
      // Only admins can create game types
      if (!req.session.userId || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can create game types' });
      }

      const validatedData = insertGameTypeSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }

      // Set admin ID from session
      validatedData.data.admin_id = req.session.userId;

      const gameType = await storage.createGameType(validatedData.data);
      res.status(201).json(gameType);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create game type' });
    }
  });

  // Market games routes
  app.get('/api/markets/:id/games', async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);
      if (isNaN(marketId)) {
        return res.status(400).json({ error: 'Invalid market ID' });
      }

      const market = await storage.getMarket(marketId);
      if (!market) {
        return res.status(404).json({ error: 'Market not found' });
      }

      const games = await storage.getGamesByMarketId(marketId);
      res.json(games);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch market games' });
    }
  });

  app.post('/api/market-games', async (req, res) => {
    try {
      // Only admins can add games to markets
      if (!req.session.userId || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can add games to markets' });
      }

      const validatedData = insertMarketGameSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }

      const market = await storage.getMarket(validatedData.data.market_id);
      if (!market) {
        return res.status(404).json({ error: 'Market not found' });
      }

      const gameType = await storage.getGameType(validatedData.data.game_type_id);
      if (!gameType) {
        return res.status(404).json({ error: 'Game type not found' });
      }

      const marketGame = await storage.addGameToMarket(validatedData.data);
      res.status(201).json(marketGame);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add game to market' });
    }
  });

  app.delete('/api/market-games/:marketId/:gameTypeId', async (req, res) => {
    try {
      const marketId = parseInt(req.params.marketId);
      const gameTypeId = parseInt(req.params.gameTypeId);
      if (isNaN(marketId) || isNaN(gameTypeId)) {
        return res.status(400).json({ error: 'Invalid IDs' });
      }

      // Only admins can remove games from markets
      if (!req.session.userId || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can remove games from markets' });
      }

      const result = await storage.removeGameFromMarket(marketId, gameTypeId);
      if (!result) {
        return res.status(404).json({ error: 'Market game not found' });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove game from market' });
    }
  });

  // Bet routes
  app.get('/api/bets', async (req, res) => {
    try {
      // Authorization check
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Only admins can see all bets
      if (req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Get all bets
      const bets = await storage.getAllBets();
      
      // Enhance bets with additional info
      const enhancedBets = await Promise.all(bets.map(async (bet) => {
        const user = await storage.getUser(bet.user_id);
        const market = await storage.getMarket(bet.market_id);
        const gameType = await storage.getGameType(bet.game_type_id);
        
        return {
          ...bet,
          user_name: user ? user.name : undefined,
          market_name: market ? market.name : undefined,
          game_type_name: gameType ? gameType.name : undefined
        };
      }));
      
      res.json(enhancedBets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bets' });
    }
  });
  
  // Get bets managed by a subadmin
  app.get('/api/subadmin/bets', async (req, res) => {
    try {
      // Authorization check
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Only subadmins or admins can access this
      if (req.session.userRole !== 'subadmin' && req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      let bets = [];
      
      if (req.session.userRole === 'admin') {
        // Admin can see all bets
        bets = await storage.getAllBets();
      } else {
        // Get all users managed by this subadmin
        const users = await storage.getUsersBySubadminId(req.session.userId);
        
        // Get bets for all these users
        bets = [];
        for (const user of users) {
          const userBets = await storage.getUserBets(user.id);
          bets.push(...userBets);
        }
      }
      
      // Enhance bets with additional info
      const enhancedBets = await Promise.all(bets.map(async (bet) => {
        const user = await storage.getUser(bet.user_id);
        const market = await storage.getMarket(bet.market_id);
        const gameType = await storage.getGameType(bet.game_type_id);
        
        return {
          ...bet,
          user_name: user ? user.name : undefined,
          market_name: market ? market.name : undefined,
          game_type_name: gameType ? gameType.name : undefined
        };
      }));
      
      res.json(enhancedBets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subadmin bets' });
    }
  });
  
  app.get('/api/users/:id/bets', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Authorization check
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Users can only see their own bets
      if (req.session.userRole === 'player' && req.session.userId !== userId) {
        return res.status(403).json({ error: 'You can only view your own bets' });
      }

      // Subadmins can only see bets from their users
      if (req.session.userRole === 'subadmin') {
        const user = await storage.getUser(userId);
        if (!user || user.subadmin_id !== req.session.userId) {
          return res.status(403).json({ error: 'You can only view bets from your users' });
        }
      }

      const bets = await storage.getUserBets(userId);
      
      // Enhance bets with additional info
      const enhancedBets = await Promise.all(bets.map(async (bet) => {
        const market = await storage.getMarket(bet.market_id);
        const gameType = await storage.getGameType(bet.game_type_id);
        
        return {
          ...bet,
          market_name: market ? market.name : undefined,
          game_type_name: gameType ? gameType.name : undefined
        };
      }));
      
      res.json(enhancedBets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bets' });
    }
  });

  app.post('/api/bets', async (req, res) => {
    try {
      // Only players can place bets
      if (!req.session.userId || req.session.userRole !== 'player') {
        return res.status(403).json({ error: 'Only players can place bets' });
      }

      const validatedData = insertBetSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }

      // Set user ID from session
      validatedData.data.user_id = req.session.userId;

      // Check if market is open
      const market = await storage.getMarket(validatedData.data.market_id);
      if (!market || market.status !== 'open') {
        return res.status(400).json({ error: 'Market is not open for betting' });
      }

      // Check if game type is available for this market
      const marketGames = await storage.getGamesByMarketId(market.id);
      const gameTypeIds = marketGames.map(game => game.id);
      if (!gameTypeIds.includes(validatedData.data.game_type_id)) {
        return res.status(400).json({ error: 'Game type not available for this market' });
      }

      // Get game type for validation and calculating potential winnings
      const gameType = await storage.getGameType(validatedData.data.game_type_id);
      if (!gameType) {
        return res.status(400).json({ error: 'Game type not found' });
      }

      // Validate selected number based on game type
      let isValidSelection = false;
      switch (gameType.type) {
        case 'jodi':
          // Two-digit number 00-99
          isValidSelection = /^[0-9]{2}$/.test(validatedData.data.selected_number);
          break;
        case 'odd_even':
          // 'odd' or 'even'
          isValidSelection = ['odd', 'even'].includes(validatedData.data.selected_number);
          break;
        case 'hurf':
          // Single digit with position (left or right) or two digits
          isValidSelection = /^[lr][0-9]$/.test(validatedData.data.selected_number) || 
                             /^[0-9]{2}$/.test(validatedData.data.selected_number);
          break;
        case 'cross':
          // Multiple digits (2-4)
          isValidSelection = /^[0-9]{2,4}$/.test(validatedData.data.selected_number);
          break;
      }

      if (!isValidSelection) {
        return res.status(400).json({ error: 'Invalid selection for this game type' });
      }

      // Check bet amount limits
      if (validatedData.data.bet_amount < gameType.min_bet_amount || 
          validatedData.data.bet_amount > gameType.max_bet_amount) {
        return res.status(400).json({ 
          error: `Bet amount must be between ${gameType.min_bet_amount} and ${gameType.max_bet_amount}` 
        });
      }

      // Get user to check wallet balance
      const user = await storage.getUser(req.session.userId);
      if (!user || user.wallet_balance < validatedData.data.bet_amount) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }

      // Calculate potential winnings based on game type and payout ratio
      const potentialWinnings = validatedData.data.bet_amount * gameType.payout_ratio;
      validatedData.data.potential_winnings = potentialWinnings;

      const bet = await storage.createBet(validatedData.data);
      res.status(201).json(bet);
    } catch (error) {
      res.status(500).json({ error: 'Failed to place bet' });
    }
  });

  // Transaction routes
  app.get('/api/users/:id/transactions', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Authorization check
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Users can only see their own transactions
      if (req.session.userRole === 'player' && req.session.userId !== userId) {
        return res.status(403).json({ error: 'You can only view your own transactions' });
      }

      // Subadmins can only see transactions from their users
      if (req.session.userRole === 'subadmin' && req.session.userId !== userId) {
        const user = await storage.getUser(userId);
        if (!user || user.subadmin_id !== req.session.userId) {
          return res.status(403).json({ error: 'You can only view transactions from your users' });
        }
      }

      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Get all transactions (admin/subadmin only)
  app.get('/api/transactions', async (req, res) => {
    try {
      // Only admins and subadmins can view all transactions
      if (!req.session.userId || !['admin', 'subadmin'].includes(req.session.userRole)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      // Get all transactions from all users
      const allTransactions = [];
      const users = req.session.userRole === 'admin' 
        ? await storage.getAllUsers()
        : await storage.getUsersBySubadminId(req.session.userId);
        
      for (const user of users) {
        const userTransactions = await storage.getUserTransactions(user.id);
        allTransactions.push(...userTransactions);
      }
      
      res.json(allTransactions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  app.get('/api/transactions/pending', async (req, res) => {
    try {
      // Only admins and subadmins can view pending transactions
      if (!req.session.userId || !['admin', 'subadmin'].includes(req.session.userRole)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      let pendingTransactions;
      if (req.session.userRole === 'admin') {
        pendingTransactions = await storage.getPendingTransactions();
      } else {
        pendingTransactions = await storage.getPendingTransactions(req.session.userId);
      }

      res.json(pendingTransactions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pending transactions' });
    }
  });

  app.post('/api/transactions', async (req, res) => {
    try {
      // Must be authenticated to create transactions
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = insertTransactionSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }

      // Users can only create transactions for themselves
      if (req.session.userRole === 'player' && validatedData.data.user_id !== req.session.userId) {
        return res.status(403).json({ error: 'You can only create transactions for yourself' });
      }

      // Subadmins can only create transactions for their users or themselves
      if (req.session.userRole === 'subadmin' && validatedData.data.user_id !== req.session.userId) {
        const user = await storage.getUser(validatedData.data.user_id);
        if (!user || user.subadmin_id !== req.session.userId) {
          return res.status(403).json({ error: 'You can only create transactions for your users' });
        }
      }

      // Validate transaction type
      const allowedTypes = ['deposit', 'withdrawal'];
      if (!allowedTypes.includes(validatedData.data.type)) {
        return res.status(400).json({ error: 'Invalid transaction type' });
      }

      // For withdrawals, check wallet balance
      if (validatedData.data.type === 'withdrawal') {
        const user = await storage.getUser(validatedData.data.user_id);
        if (!user || user.wallet_balance < validatedData.data.amount) {
          return res.status(400).json({ error: 'Insufficient funds' });
        }
      }

      // Handle subadmin transactions
      if (req.session.userRole === 'subadmin' && validatedData.data.user_id === req.session.userId) {
        validatedData.data.is_subadmin_transaction = true;
      }

      const transaction = await storage.createTransaction(validatedData.data);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  });

  app.patch('/api/transactions/:id/approve', async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      if (isNaN(transactionId)) {
        return res.status(400).json({ error: 'Invalid transaction ID' });
      }

      // Only admins and subadmins can approve transactions
      if (!req.session.userId || !['admin', 'subadmin'].includes(req.session.userRole)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({ error: 'Transaction is not pending' });
      }

      // Admins can approve any transaction
      if (req.session.userRole === 'admin') {
        const updatedTransaction = await storage.approveTransaction(
          transactionId, 
          req.session.userId,
          req.body.remarks
        );
        return res.json(updatedTransaction);
      }

      // Subadmins can only approve transactions from their users
      const user = await storage.getUser(transaction.user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if it's a subadmin transaction (only admin can approve)
      if (transaction.is_subadmin_transaction) {
        return res.status(403).json({ error: 'Only admins can approve subadmin transactions' });
      }

      // Check if user belongs to this subadmin
      if (user.subadmin_id !== req.session.userId) {
        return res.status(403).json({ error: 'You can only approve transactions from your users' });
      }

      const updatedTransaction = await storage.approveTransaction(
        transactionId, 
        req.session.userId,
        req.body.remarks
      );
      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ error: 'Failed to approve transaction' });
    }
  });

  app.patch('/api/transactions/:id/reject', async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      if (isNaN(transactionId)) {
        return res.status(400).json({ error: 'Invalid transaction ID' });
      }

      // Only admins and subadmins can reject transactions
      if (!req.session.userId || !['admin', 'subadmin'].includes(req.session.userRole)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({ error: 'Transaction is not pending' });
      }

      // Admins can reject any transaction
      if (req.session.userRole === 'admin') {
        const updatedTransaction = await storage.rejectTransaction(
          transactionId, 
          req.session.userId,
          req.body.remarks
        );
        return res.json(updatedTransaction);
      }

      // Subadmins can only reject transactions from their users
      const user = await storage.getUser(transaction.user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if it's a subadmin transaction (only admin can reject)
      if (transaction.is_subadmin_transaction) {
        return res.status(403).json({ error: 'Only admins can reject subadmin transactions' });
      }

      // Check if user belongs to this subadmin
      if (user.subadmin_id !== req.session.userId) {
        return res.status(403).json({ error: 'You can only reject transactions from your users' });
      }

      const updatedTransaction = await storage.rejectTransaction(
        transactionId, 
        req.session.userId,
        req.body.remarks
      );
      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ error: 'Failed to reject transaction' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
