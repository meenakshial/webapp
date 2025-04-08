import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { callGroqAPI } from "./groqClient";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";

const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Get current user's chats
  app.get("/api/chats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const chats = await storage.getChats(userId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching chats" });
    }
  });

  // Create a new chat
  app.post("/api/chats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const parsed = insertChatSchema.parse({ ...req.body, userId });
      const chat = await storage.createChat(parsed);
      res.status(201).json(chat);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        res.status(400).json({ message: formattedError.message });
        return;
      }
      res.status(500).json({ message: "Error creating chat" });
    }
  });

  // Get a specific chat
  app.get("/api/chats/:id", isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      if (chat.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to access this chat" });
      }

      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: "Error fetching chat" });
    }
  });

  // Delete a chat
  app.delete("/api/chats/:id", isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      if (chat.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this chat" });
      }

      await storage.deleteChat(chatId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting chat" });
    }
  });

  // Update chat title
  app.patch("/api/chats/:id", isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      if (chat.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this chat" });
      }

      const { title } = req.body;
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ message: "Title is required" });
      }

      const updatedChat = await storage.updateChatTitle(chatId, title);
      res.json(updatedChat);
    } catch (error) {
      res.status(500).json({ message: "Error updating chat" });
    }
  });

  // Get messages for a chat
  app.get("/api/chats/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      if (chat.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to access this chat" });
      }

      const messages = await storage.getMessages(chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  // Send a message to a chat and get a response from Groq
  app.post("/api/chats/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      if (chat.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to send messages to this chat" });
      }

      // Parse and validate the message
      const parsed = insertMessageSchema.parse({
        ...req.body,
        chatId,
        role: "user"
      });

      // Store the user message
      const userMessage = await storage.createMessage(parsed);

      // Get all messages for this chat to send as context
      const chatMessages = await storage.getMessages(chatId);
      
      // Format messages for Groq API
      const groqMessages = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call Groq API
      const groqResponse = await callGroqAPI(groqMessages);

      // Store the assistant response
      const assistantMessage = await storage.createMessage({
        chatId,
        role: "assistant",
        content: groqResponse.content
      });

      // Respond with both messages and usage info
      res.status(201).json({
        userMessage,
        assistantMessage,
        usage: groqResponse.usage,
        model: groqResponse.model
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        res.status(400).json({ message: formattedError.message });
        return;
      }
      console.error("Error sending message:", error);
      res.status(500).json({ 
        message: "Error sending message", 
        details: (error as Error).message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
