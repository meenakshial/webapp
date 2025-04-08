import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

export default function TypingIndicator() {
  return (
    <motion.div
      className="flex items-start space-x-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
        <BrainCircuit className="h-5 w-5 text-primary" />
      </div>
      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg px-4 py-3 shadow-sm">
        <div className="flex space-x-1 items-center h-5 px-2">
          <motion.div
            className="h-2 w-2 bg-muted-foreground rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", times: [0, 0.5, 1] }}
          />
          <motion.div
            className="h-2 w-2 bg-muted-foreground rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", delay: 0.2, times: [0, 0.5, 1] }}
          />
          <motion.div
            className="h-2 w-2 bg-muted-foreground rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", delay: 0.4, times: [0, 0.5, 1] }}
          />
        </div>
      </div>
    </motion.div>
  );
}
