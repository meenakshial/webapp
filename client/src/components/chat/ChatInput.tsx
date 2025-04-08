import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  tokenCount: number;
  modelName: string;
}

export default function ChatInput({
  disabled,
  value,
  onChange,
  onSend,
  tokenCount,
  modelName
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);
  
  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    
    // Calculate new height (capped at 5 rows)
    const lineHeight = 24; // Approximate line height
    const maxRows = 5;
    const newRows = Math.min(
      Math.max(Math.ceil(textarea.scrollHeight / lineHeight), 1),
      maxRows
    );
    
    setRows(newRows);
    textarea.style.height = `${newRows * lineHeight}px`;
  };
  
  // Auto-resize when content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend();
    }
  };
  
  // Handle Enter key (but allow Shift+Enter for new lines)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };
  
  // Format model name for display
  const formattedModelName = modelName
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .replace(/(\d+)b/i, "$1B"); // Capitalize the "B" in xxB models
  
  return (
    <div className="border-t border-border p-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message Groq..."
            rows={rows}
            disabled={disabled}
            className="w-full border border-input rounded-lg px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background resize-none transition-all"
            style={{ 
              minHeight: '56px',
              maxHeight: '120px'
            }}
          />
          <div className="absolute right-3 bottom-3 flex items-center">
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              <Button
                type="submit"
                size="icon"
                disabled={!value.trim() || disabled}
                className="h-8 w-8"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </form>
        <div className="text-xs text-muted-foreground mt-2 flex justify-between items-center">
          <div>
            <span className="font-medium">Model:</span> 
            <span className="text-primary ml-1">{formattedModelName}</span>
          </div>
          <div id="token-counter">
            <span>Tokens used: <span className="font-medium">{tokenCount}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
