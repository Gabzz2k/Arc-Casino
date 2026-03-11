import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResultDisplayProps {
  result: {
    type: 'win' | 'loss';
    amount?: number;
    message: string;
  } | null;
}

export const ResultDisplay = ({ result }: ResultDisplayProps) => {
  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={cn(
            "mt-8 flex flex-col items-center rounded-3xl border p-8 text-center shadow-2xl",
            result.type === 'win' 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          )}
        >
          <div className={cn(
            "mb-4 rounded-full p-4",
            result.type === 'win' ? "bg-emerald-500/20" : "bg-rose-500/20"
          )}>
            {result.type === 'win' ? (
              <Trophy className="h-12 w-12" />
            ) : (
              <XCircle className="h-12 w-12" />
            )}
          </div>
          
          <h2 className="text-3xl font-black uppercase tracking-tighter sm:text-4xl">
            {result.type === 'win' ? 'You Won!' : 'Better Luck Next Time'}
          </h2>
          
          <p className="mt-2 text-lg font-medium opacity-80">
            {result.message}
          </p>
          
          {result.amount !== undefined && result.amount > 0 && (
            <div className="mt-4 text-2xl font-bold">
              +{result.amount.toLocaleString()} USDC
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
