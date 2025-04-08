import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lightbulb, Code, FileText, BookOpen, BrainCircuit } from "lucide-react";

interface EmptyChatProps {
  onNewChat: () => void;
}

export default function EmptyChat({ onNewChat }: EmptyChatProps) {
  const features = [
    {
      icon: <Lightbulb className="text-primary mr-2" />,
      title: "Research Assistant",
      description: "Ask for summaries of academic papers or deep dives into complex topics"
    },
    {
      icon: <Code className="text-primary mr-2" />,
      title: "Coding Partner",
      description: "Debug code, learn new languages, or get help with algorithms"
    },
    {
      icon: <FileText className="text-primary mr-2" />,
      title: "Content Creator",
      description: "Generate blog posts, marketing copy, or creative writing"
    },
    {
      icon: <BookOpen className="text-primary mr-2" />,
      title: "Learning Companion",
      description: "Learn new subjects with guided explanations and interactive lessons"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto mb-8 pt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="text-center mb-8"
        variants={itemVariants}
      >
        <div className="flex justify-center items-center mb-4">
          <BrainCircuit className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Welcome to Groq Chat</h1>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
          Powered by Groq's fast inference API for responsive, high-quality AI conversations.
        </p>

        <Button 
          size="lg" 
          onClick={onNewChat}
          className="mb-8"
        >
          Start a new conversation
        </Button>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        variants={containerVariants}
      >
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            className="bg-card p-4 rounded-lg shadow-sm border border-border"
            variants={itemVariants}
          >
            <div className="flex items-center mb-2">
              {feature.icon}
              <h3 className="font-medium">{feature.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
