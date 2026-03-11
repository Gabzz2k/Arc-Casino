import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { BetInput } from '../components/BetInput';
import { ResultDisplay } from '../components/ResultDisplay';
import { SlotSymbol, SLOT_SYMBOLS } from '../lib/mockGameLogic';
import { playSlots, SlotsOutcome } from '../lib/blockchain';
import { cn } from '../lib/utils';

export default function Slots() {
  const { balance, setBalance, isWalletConnected } = useGame();
  const [betAmount, setBetAmount] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ type: 'win' | 'loss'; amount: number; message: string } | null>(null);
  const [reels, setReels] = useState<[SlotSymbol, SlotSymbol, SlotSymbol]>(['💎', '💎', '💎']);
  const [error, setError] = useState<string | null>(null);

  const handleSpin = async () => {
    const bet = parseFloat(betAmount);
    if (!bet || bet <= 0 || bet > balance || isSpinning) return;

    setIsSpinning(true);
    setResult(null);
    setError(null);

    // Simulate reel spinning effect
    const spinInterval = setInterval(() => {
      setReels([
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      ]);
    }, 100);

    try {
      const outcome: SlotsOutcome = await playSlots(betAmount);
      const mappedSymbols: [SlotSymbol, SlotSymbol, SlotSymbol] = [
        SLOT_SYMBOLS[outcome.symbols[0] % SLOT_SYMBOLS.length],
        SLOT_SYMBOLS[outcome.symbols[1] % SLOT_SYMBOLS.length],
        SLOT_SYMBOLS[outcome.symbols[2] % SLOT_SYMBOLS.length],
      ];
      clearInterval(spinInterval);
      setReels(mappedSymbols);

      if (outcome.win && outcome.payout > 0) {
        setBalance(prev => prev + outcome.payout);
        setResult({
          type: 'win',
          amount: outcome.payout,
          message: `You won ${outcome.payout.toFixed(4)} USDC!`,
        });
      } else {
        setBalance(prev => prev - bet);
        setResult({
          type: 'loss',
          amount: bet,
          message: 'No luck this time. Spin again!',
        });
      }
    } catch (e: any) {
      clearInterval(spinInterval);
      setError(e?.message || 'Transaction failed');
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-[40px] bg-zinc-900 border border-white/5 p-8 sm:p-12 shadow-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-2">SLOT MACHINE</h1>
          <p className="text-zinc-500">Match 3 symbols for massive rewards</p>
        </div>

        {/* Slot Reels */}
        <div className="flex justify-center gap-4 mb-16">
          {reels.map((symbol, i) => (
            <motion.div
              key={i}
              animate={isSpinning ? {
                y: [0, -20, 20, 0],
                scale: [1, 1.1, 0.9, 1]
              } : {}}
              transition={{
                repeat: isSpinning ? Infinity : 0,
                duration: 0.2,
                delay: i * 0.1
              }}
              className="h-32 w-24 sm:h-48 sm:w-36 rounded-3xl bg-zinc-950 border-4 border-zinc-800 flex items-center justify-center text-5xl sm:text-7xl shadow-inner"
            >
              {symbol}
            </motion.div>
          ))}
        </div>

        {/* Payout Table (Mini) */}
        <div className="mb-8 rounded-2xl bg-zinc-800/30 p-4 border border-zinc-800">
          <div className="grid grid-cols-3 gap-4 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <div>3x 🍒 = 5x</div>
            <div>3x 🍋 = 10x</div>
            <div>3x 🔔 = 20x</div>
            <div>3x 💎 = 50x</div>
            <div>3x 7️⃣ = 100x</div>
            <div>Any 2 = 1.5x</div>
          </div>
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
            onClick={handleSpin}
            disabled={!isWalletConnected || !betAmount || isSpinning || parseFloat(betAmount) > balance}
            className="w-full rounded-2xl bg-rose-600 py-5 text-xl font-black text-white shadow-[0_0_30px_rgba(225,29,72,0.3)] transition-all hover:bg-rose-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? 'SPINNING...' : !isWalletConnected ? 'CONNECT WALLET' : 'PULL LEVER'}
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
