import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Example users API
  app.get('/api/users', async (req, res) => {
    try {
      const users = []; // In a real app, this would be from storage
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
