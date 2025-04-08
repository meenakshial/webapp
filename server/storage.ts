import { users, chats, messages, type User, type InsertUser, type Chat, type InsertChat, type Message, type InsertMessage } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getChats(userId: number): Promise<Chat[]>;
  getChat(id: number): Promise<Chat | undefined>;
  createChat(chat: InsertChat): Promise<Chat>;
  deleteChat(id: number): Promise<void>;
  updateChatTitle(id: number, title: string): Promise<Chat | undefined>;
  
  getMessages(chatId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  sessionStore: any; // Express session store
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Express session store

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getChats(userId: number): Promise<Chat[]> {
    return await db.select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.createdAt));
  }

  async getChat(id: number): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat;
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const [chat] = await db.insert(chats).values(insertChat).returning();
    return chat;
  }

  async deleteChat(id: number): Promise<void> {
    // Using cascading deletes in the schema will automatically remove messages
    await db.delete(chats).where(eq(chats.id, id));
  }

  async updateChatTitle(id: number, title: string): Promise<Chat | undefined> {
    const [updatedChat] = await db
      .update(chats)
      .set({ title })
      .where(eq(chats.id, id))
      .returning();
    return updatedChat;
  }

  async getMessages(chatId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.timestamp);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
