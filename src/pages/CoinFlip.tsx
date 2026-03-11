import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import { BetInput } from '../components/BetInput';
import { ResultDisplay } from '../components/ResultDisplay';
import { CoinFlipOutcome, sendCoinFlipTransaction, waitForCoinFlipOutcome } from '../lib/blockchain';
import type { CoinResult } from '../lib/mockGameLogic';
import { cn } from '../lib/utils';

export default function CoinFlip() {
  const { balance, setBalance, isWalletConnected } = useGame();
  const [betAmount, setBetAmount] = useState('');
  const [selection, setSelection] = useState<CoinResult | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ type: 'win' | 'loss'; amount: number; message: string } | null>(null);
  const [coinSide, setCoinSide] = useState<CoinResult>('heads');
  const [error, setError] = useState<string | null>(null);

  const handleFlip = async () => {
    const bet = parseFloat(betAmount);
    if (!bet || bet <= 0 || bet > balance || !selection || isSpinning) return;

    setResult(null);
    setError(null);
    try {
      const { tx, casino } = await sendCoinFlipTransaction(selection === 'heads', betAmount);

      // Start animation only after the user has signed the transaction
      setIsSpinning(true);

      const outcome: CoinFlipOutcome = await waitForCoinFlipOutcome(tx, casino);
      const resultSide: CoinResult = outcome.resultIsHeads ? 'heads' : 'tails';
      setCoinSide(resultSide);

      if (outcome.win) {
        setBalance(prev => prev + outcome.payout);
        setResult({
          type: 'win',
          amount: outcome.payout,
          message: `It's ${resultSide.toUpperCase()}! You won ${outcome.payout.toFixed(4)} USDC.`,
        });
      } else {
        setBalance(prev => prev - bet);
        setResult({
          type: 'loss',
          amount: bet,
          message: `It's ${resultSide.toUpperCase()}. Better luck next time.`,
        });
      }
    } catch (e: any) {
      if (e?.code === 'ACTION_REJECTED') {
        setError('Transaction rejected in wallet');
      } else {
        setError(e?.message || 'Transaction failed');
      }
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-[40px] bg-zinc-900 border border-white/5 p-8 sm:p-12 shadow-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-2">COIN FLIP</h1>
          <p className="text-zinc-500">Pick a side and flip for glory</p>
        </div>

        {/* Coin Animation */}
        <div className="flex justify-center mb-16 perspective-1000">
          <motion.div
            animate={isSpinning ? {
              rotateY: [0, 1800],
              y: [0, -150, 0]
            } : { rotateY: coinSide === 'heads' ? 0 : 180 }}
            transition={isSpinning ? {
              duration: 2,
              ease: "easeInOut"
            } : { duration: 0.5 }}
            className="relative h-48 w-48 preserve-3d"
          >
            {/* Heads Side */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-8 border-yellow-300 shadow-[0_0_30px_rgba(234,179,8,0.4)] backface-hidden">
              <span className="text-6xl font-black text-yellow-900">H</span>
            </div>
            {/* Tails Side */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-zinc-400 to-zinc-600 border-8 border-zinc-300 shadow-[0_0_30px_rgba(161,161,170,0.4)] rotate-y-180 backface-hidden">
              <span className="text-6xl font-black text-zinc-900">T</span>
            </div>
          </motion.div>
        </div>

        {/* Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setSelection('heads')}
            disabled={isSpinning}
            className={cn(
              "rounded-2xl border-2 py-6 text-xl font-black transition-all",
              selection === 'heads' 
                ? "bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]" 
                : "bg-zinc-800/50 border-transparent text-zinc-500 hover:bg-zinc-800"
            )}
          >
            HEADS
          </button>
          <button
            onClick={() => setSelection('tails')}
            disabled={isSpinning}
            className={cn(
              "rounded-2xl border-2 py-6 text-xl font-black transition-all",
              selection === 'tails' 
                ? "bg-zinc-400/10 border-zinc-400 text-zinc-400 shadow-[0_0_20px_rgba(161,161,170,0.2)]" 
                : "bg-zinc-800/50 border-transparent text-zinc-500 hover:bg-zinc-800"
            )}
          >
            TAILS
          </button>
        </div>

        {/* Bet Controls */}
        <div className="space-y-6">
          <BetInput
            value={betAmount}
            onChange={setBetAmount}
            max={balance}
            disabled={isSpinning}
          />

          <button
            onClick={handleFlip}
            disabled={!isWalletConnected || !selection || !betAmount || isSpinning || parseFloat(betAmount) > balance}
            className="w-full rounded-2xl bg-purple-600 py-5 text-xl font-black text-white shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? 'FLIPPING...' : !isWalletConnected ? 'CONNECT WALLET' : 'FLIP COIN'}
          </button>
        </div>

        <ResultDisplay result={result} />
        {error && (
          <p className="mt-4 text-sm text-rose-400 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
