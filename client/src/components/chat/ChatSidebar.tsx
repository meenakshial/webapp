import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chat, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Plus, 
  X, 
  MoreVertical, 
  Pencil, 
  Trash, 
  Settings,
  LogOut,
  Search
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit } from "lucide-react";

interface ChatSidebarProps {
  user: User | null;
  chats: Chat[];
  loading: boolean;
  isOpen: boolean;
  selectedChatId?: number;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (chatId: number) => void;
  onUpdateChatTitle: (chatId: number, title: string) => void;
}

export default function ChatSidebar({
  user,
  chats,
  loading,
  isOpen,
  selectedChatId,
  onClose,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onUpdateChatTitle,
}: ChatSidebarProps) {
  const { logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Start editing a chat title
  const startEditingChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  // Save the edited chat title
  const saveEditedChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChatId && editingTitle.trim()) {
      onUpdateChatTitle(editingChatId, editingTitle.trim());
      setEditingChatId(null);
    }
  };

  // Cancel editing a chat title
  const cancelEditing = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Sidebar animations
  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            className={cn(
              "fixed md:relative w-72 bg-background border-r border-border h-full flex flex-col z-50",
              "md:translate-x-0 md:z-0"
            )}
            initial={{ x: "-100%" }}
            animate={isOpen ? "open" : "closed"}
            exit={{ x: "-100%" }}
            variants={sidebarVariants}
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center">
                <BrainCircuit className="text-primary h-5 w-5 mr-2" />
                <h1 className="text-lg font-semibold">Groq Chat</h1>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* New chat button */}
            <div className="p-4">
              <Button 
                className="w-full flex items-center justify-center"
                onClick={onNewChat}
              >
                <Plus className="mr-2 h-4 w-4" />
                New chat
              </Button>
            </div>
            
            {/* Search chats */}
            <div className="px-4 py-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Chat list */}
            <div className="overflow-y-auto flex-1">
              <div className="p-2">
                <h2 className="text-xs uppercase text-muted-foreground font-semibold px-2 mb-2">
                  Recent chats
                </h2>
                
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="px-2 py-2 mb-1">
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  ))
                ) : filteredChats.length > 0 ? (
                  // Chat list
                  filteredChats.map((chat) => (
                    <div key={chat.id} className="relative mb-1">
                      {editingChatId === chat.id ? (
                        // Edit mode
                        <form onSubmit={saveEditedChat} className="flex px-2 py-1">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            autoFocus
                            className="flex-1"
                          />
                          <Button 
                            size="sm" 
                            type="submit" 
                            className="ml-1"
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            type="button" 
                            variant="ghost" 
                            onClick={cancelEditing}
                            className="ml-1"
                          >
                            Cancel
                          </Button>
                        </form>
                      ) : (
                        // View mode
                        <Button
                          variant={selectedChatId === chat.id ? "secondary" : "ghost"}
                          className="w-full justify-start px-2 py-5 h-auto"
                          onClick={() => onSelectChat(chat)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{chat.title}</span>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="ml-auto h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => startEditingChat(chat, e)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteChat(chat.id);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  // Empty state
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    {searchQuery ? (
                      <p>No chats matching "{searchQuery}"</p>
                    ) : (
                      <p>No chats yet. Start a new conversation!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* User profile and settings */}
            <div className="p-4 border-t border-border mt-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserAvatar user={user} />
                  <div className="ml-2">
                    <div className="text-sm font-medium truncate max-w-[120px]">
                      {user?.name || user?.username || "User"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {user?.username}
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <ThemeToggle />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-1">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
