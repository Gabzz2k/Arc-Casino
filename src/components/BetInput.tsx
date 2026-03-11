import React from 'react';
import { Coins } from 'lucide-react';

interface BetInputProps {
  value: string;
  onChange: (value: string) => void;
  max: number;
  disabled?: boolean;
}

export const BetInput = ({ value, onChange, max, disabled }: BetInputProps) => {
  const handleHalf = () => onChange((parseFloat(value || '0') / 2).toString());
  const handleMax = () => onChange(max.toString());

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider">
        <span>Bet Amount</span>
        <span>Balance: {max.toLocaleString()} USDC</span>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
          <Coins className="h-5 w-5" />
        </div>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="0.00"
          className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 py-4 pl-12 pr-32 text-lg font-bold text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 transition-all"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
          <button
            onClick={handleHalf}
            disabled={disabled}
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            1/2
          </button>
          <button
            onClick={handleMax}
            disabled={disabled}
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            MAX
          </button>
        </div>
      </div>
    </div>
  );
};
