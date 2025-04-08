import { useState } from "react";
import { format } from "date-fns";
import { Message } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BrainCircuit, ThumbsUp, ThumbsDown, RotateCcw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CodeBlock from "@/components/ui/code-block";

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  userInitials: string;
}

export default function MessageBubble({ message, isUser, userInitials }: MessageBubbleProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Format the timestamp with validation
  const formattedTime = message.timestamp 
    ? format(new Date(message.timestamp), "h:mm a")
    : format(new Date(), "h:mm a");
  
  // Copy message content to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Message content copied to clipboard",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Process message content to extract code blocks
  const processMessageContent = (content: string) => {
    // Handle undefined, null, or empty content
    if (!content) {
      console.log("Message content is empty or undefined");
      return [{ type: 'text', content: '' }];
    }
    
    try {
      const codeBlockRegex = /```([a-zA-Z]*)?\s*\n([\s\S]*?)\n```/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = codeBlockRegex.exec(content)) !== null) {
        // Add text before code block
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            content: content.slice(lastIndex, match.index)
          });
        }
        
        // Add code block with default language if undefined
        parts.push({
          type: 'code',
          language: match[1] ? match[1] : 'text',
          content: match[2]
        });
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text after last code block
      if (lastIndex < content.length) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex)
        });
      }
      
      return parts.length > 0 ? parts : [{ type: 'text', content }];
    } catch (error) {
      console.error("Error processing message content:", error);
      return [{ type: 'text', content: content || '' }];
    }
  };
  
  const contentParts = processMessageContent(message.content || '');
  
  return (
    <motion.div
      className={cn(
        "flex items-start space-x-4",
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div className={cn(
        "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center",
        isUser ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700"
      )}>
        {isUser ? (
          <span className="text-sm font-medium">{userInitials}</span>
        ) : (
          <BrainCircuit className="h-5 w-5 text-primary" />
        )}
      </div>
      
      {/* Message content */}
      <div className="flex-1">
        <div className={cn(
          "rounded-lg px-4 py-3 shadow-sm",
          isUser
            ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            : "bg-gray-100 dark:bg-gray-900"
        )}>
          {contentParts.map((part, index) => (
            part.type === 'text' ? (
              <div key={index} className="mb-3 last:mb-0 whitespace-pre-wrap">
                {part.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <CodeBlock 
                key={index} 
                language={part.language || 'text'} 
                code={part.content || ''} 
                className="my-3"
              />
            )
          ))}
        </div>
        
        {/* Message actions */}
        <div className="flex items-center mt-1 text-xs text-muted-foreground">
          <span>{formattedTime}</span>
          
          {!isUser && (
            <div className="flex items-center ml-4 space-x-1">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                <ThumbsUp className="h-3 w-3" />
              </span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                <ThumbsDown className="h-3 w-3" />
              </span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                <RotateCcw className="h-3 w-3" />
              </span>
              <span 
                className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
