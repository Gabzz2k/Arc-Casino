import React from 'react';
import { useGame } from '../context/GameContext';
import { Coins } from 'lucide-react';

export const BalanceDisplay = () => {
  const { balance, isWalletConnected } = useGame();

  if (!isWalletConnected) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl bg-zinc-900/50 border border-zinc-800 px-3 py-1.5">
      <div className="rounded-full bg-yellow-500/20 p-1">
        <Coins className="h-3.5 w-3.5 text-yellow-500" />
      </div>
      <span className="text-sm font-bold text-zinc-100">
        {balance.toLocaleString()} <span className="text-zinc-500 font-normal">USDC</span>
      </span>
    </div>
  );
};
