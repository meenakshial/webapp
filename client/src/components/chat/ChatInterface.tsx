import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Chat, Message } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import EmptyChat from "./EmptyChat";
import TypingIndicator from "@/components/ui/typing-indicator";
import { Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  selectedChat: Chat | null;
  onNewChat: () => void;
  updateTokenCount: (tokens: number) => void;
  totalTokens: number;
}

export default function ChatInterface({
  selectedChat,
  onNewChat,
  updateTokenCount,
  totalTokens
}: ChatInterfaceProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentModel, setCurrentModel] = useState("llama3-70b-8192");
  
  // Get messages for the selected chat
  const { 
    data: messages = [], 
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages 
  } = useQuery<Message[]>({
    queryKey: ["/api/chats", selectedChat?.id, "messages"],
    enabled: !!selectedChat?.id,
    queryFn: async () => {
      if (!selectedChat?.id) return [];
      console.log(`Fetching messages for chat ${selectedChat.id}`);
      const res = await fetch(`/api/chats/${selectedChat.id}/messages`, {
        credentials: 'include'
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch messages');
      }
      const data = await res.json();
      console.log("Received messages:", data);
      return data;
    }
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, content }: { chatId: number; content: string }) => {
      const res = await apiRequest("POST", `/api/chats/${chatId}/messages`, { content });
      return res.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: async (data) => {
      // Clear input and stop typing indicator
      setCurrentMessage("");
      setIsTyping(false);
      
      // Update token count
      if (data.usage && data.usage.totalTokens) {
        updateTokenCount(data.usage.totalTokens);
      }
      
      // Update model info if provided
      if (data.model) {
        setCurrentModel(data.model);
      }
      
      // Explicitly refetch messages to ensure latest data
      await refetchMessages();
      
      // Also invalidate the cache for good measure
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chats", selectedChat?.id, "messages"] 
      });
    },
    onError: (error: Error) => {
      setIsTyping(false);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!selectedChat || !currentMessage.trim()) return;
    
    console.log("Sending message:", currentMessage, "to chat:", selectedChat.id);
    
    try {
      await sendMessageMutation.mutate({
        chatId: selectedChat.id,
        content: currentMessage,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  // Scroll to bottom of messages on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Fetch messages when selected chat changes
  useEffect(() => {
    if (selectedChat?.id) {
      refetchMessages();
    }
  }, [selectedChat?.id, refetchMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  // Handle errors
  useEffect(() => {
    if (messagesError) {
      toast({
        title: "Failed to load messages",
        description: (messagesError as Error).message,
        variant: "destructive",
      });
    }
  }, [messagesError, toast]);
  
  // Format user display name
  const userDisplayName = user?.name || user?.username || "User";
  const userInitials = userDisplayName
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
  
  // Show loading state when fetching messages
  if (selectedChat && messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <>
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6" id="chat-container">
        {selectedChat ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {Array.isArray(messages) && messages.length > 0 ? (
              messages.map((message: Message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isUser={message.role === "user"}
                  userInitials={userInitials}
                />
              ))
            ) : (
              <EmptyChat onNewChat={onNewChat} />
            )}
            
            {/* Typing indicator */}
            {isTyping && (
              <TypingIndicator />
            )}
            
            {/* Auto-scroll reference point */}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <EmptyChat onNewChat={onNewChat} />
        )}
      </div>
      
      {/* Chat input area */}
      <ChatInput
        disabled={!selectedChat || isTyping}
        value={currentMessage}
        onChange={setCurrentMessage}
        onSend={handleSendMessage}
        tokenCount={totalTokens}
        modelName={currentModel}
      />
    </>
  );
}
