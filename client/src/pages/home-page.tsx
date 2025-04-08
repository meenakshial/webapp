import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Chat } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatInterface from "@/components/chat/ChatInterface";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [totalTokens, setTotalTokens] = useState(0);
  
  // Get all chats for the user
  const { 
    data: chats = [], 
    isLoading: chatsLoading,
    error: chatsError 
  } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
  });
  
  // Create a new chat
  const createChatMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/chats", { title });
      return res.json();
    },
    onSuccess: (newChat: Chat) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setSelectedChat(newChat);
      toast({
        title: "Chat created",
        description: "Your new chat has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create chat",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete a chat
  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: number) => {
      await apiRequest("DELETE", `/api/chats/${chatId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      if (selectedChat) {
        setSelectedChat(null);
      }
      toast({
        title: "Chat deleted",
        description: "The chat has been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete chat",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update a chat's title
  const updateChatTitleMutation = useMutation({
    mutationFn: async ({ chatId, title }: { chatId: number; title: string }) => {
      const res = await apiRequest("PATCH", `/api/chats/${chatId}`, { title });
      return res.json();
    },
    onSuccess: (updatedChat: Chat) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setSelectedChat(updatedChat);
      toast({
        title: "Chat updated",
        description: "The chat title has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update chat",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle starting a new chat
  const handleNewChat = () => {
    createChatMutation.mutate(`New Chat ${chats.length + 1}`);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  // Handle selecting a chat
  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  // Handle deleting a chat
  const handleDeleteChat = (chatId: number) => {
    deleteChatMutation.mutate(chatId);
  };
  
  // Handle updating a chat title
  const handleUpdateChatTitle = (chatId: number, title: string) => {
    updateChatTitleMutation.mutate({ chatId, title });
  };
  
  // Toggle the sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  // Update token counter from chat interactions
  const updateTokenCount = (tokens: number) => {
    setTotalTokens(prev => prev + tokens);
  };
  
  // Auto-select first chat when loaded if none selected
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);
  
  // Handle errors
  useEffect(() => {
    if (chatsError) {
      toast({
        title: "Failed to load chats",
        description: (chatsError as Error).message,
        variant: "destructive",
      });
    }
  }, [chatsError, toast]);
  
  // Adjust sidebar visibility on screen size change
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <ChatSidebar
        user={user}
        chats={chats}
        loading={chatsLoading}
        isOpen={sidebarOpen}
        selectedChatId={selectedChat?.id}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onUpdateChatTitle={handleUpdateChatTitle}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile header with menu button */}
        {isMobile && (
          <div className="border-b border-border p-4 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="font-semibold">
              {selectedChat ? selectedChat.title : "Groq Chat"}
            </div>
          </div>
        )}
        
        {/* Chat interface */}
        <ChatInterface 
          selectedChat={selectedChat}
          onNewChat={handleNewChat}
          updateTokenCount={updateTokenCount}
          totalTokens={totalTokens}
        />
      </div>
    </div>
  );
}
