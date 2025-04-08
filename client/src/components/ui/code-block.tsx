import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Code } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export default function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    
    // Reset after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  // Format the language display
  const displayLanguage = language || "plaintext";

  return (
    <div className={cn("code-block rounded-md overflow-hidden", className)}>
      <div className="flex justify-between items-center px-4 py-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 text-xs font-mono">
        <div className="flex items-center">
          <Code className="h-3 w-3 mr-2" />
          <span>{displayLanguage}</span>
        </div>
        <motion.div
          onClick={copyToClipboard}
          whileTap={{ scale: 0.95 }}
          className="hover:bg-gray-300 dark:hover:bg-gray-700 p-1 rounded-md cursor-pointer"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </motion.div>
      </div>
      <pre className="p-4 overflow-x-auto bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}
