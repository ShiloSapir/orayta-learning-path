import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export const useBlessingToast = () => {
  const { toast } = useToast();

  const showBlessing = (message: string = "חזק וברוך!") => {
    // Trigger confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#B8860B', '#1E3A8A', '#3B82F6']
    });

    toast({
      duration: 3000,
      className: "bg-gradient-to-r from-secondary to-accent border-primary/20",
      description: (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 text-primary font-medium"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: 3, duration: 0.3 }}
          >
            <Sparkles className="h-5 w-5 text-secondary-foreground" />
          </motion.div>
          {message}
        </motion.div>
      ),
    });
  };

  return { showBlessing };
};