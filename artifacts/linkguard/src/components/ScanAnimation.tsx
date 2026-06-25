import { motion } from "framer-motion";
import { Scan } from "lucide-react";

export default function ScanAnimation() {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg border border-primary/20 overflow-hidden">
      <motion.div 
        className="w-full h-1 bg-primary/50 absolute top-0 left-0 shadow-[0_0_20px_2px_hsl(var(--primary))]"
        animate={{ 
          top: ["0%", "100%", "0%"]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <Scan className="w-16 h-16 text-primary" />
        </motion.div>
        <motion.div 
          className="absolute inset-0 bg-primary rounded-full blur-xl"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <motion.p 
        className="mt-6 text-primary font-mono tracking-widest text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        جاري تحليل التهديدات...
      </motion.p>
    </div>
  );
}