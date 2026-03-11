import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { BetInput } from '../components/BetInput';
import { ResultDisplay } from '../components/ResultDisplay';
import { playRoulette, RouletteOutcome } from '../lib/blockchain';
import { cn } from '../lib/utils';

type BetType = 'red' | 'black' | 'even' | 'odd' | number;

export default function Roulette() {
  const { balance, setBalance, isWalletConnected } = useGame();
  const [betAmount, setBetAmount] = useState('');
  const [betType, setBetType] = useState<BetType | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ type: 'win' | 'loss'; amount: number; message: string } | null>(null);
  const [lastNumber, setLastNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSpin = async () => {
    const bet = parseFloat(betAmount);
    if (!bet || bet <= 0 || bet > balance || betType === null || isSpinning) return;

    setIsSpinning(true);
    setResult(null);
    setError(null);

    try {
      const typeIndex =
        typeof betType === 'number'
          ? 4
          : betType === 'red'
          ? 0
          : betType === 'black'
          ? 1
          : betType === 'even'
          ? 2
          : 3;

      const chosenNumber = typeof betType === 'number' ? betType : 0;

      const outcome: RouletteOutcome = await playRoulette(typeIndex, chosenNumber, betAmount);
      setLastNumber(outcome.resultNumber);

      if (outcome.win) {
        setBalance(prev => prev + outcome.payout);
        setResult({
          type: 'win',
          amount: outcome.payout,
          message: `The ball landed on ${outcome.resultNumber}! You won ${outcome.payout.toFixed(4)} USDC.`,
        });
      } else {
        setBalance(prev => prev - bet);
        setResult({
          type: 'loss',
          amount: bet,
          message: `The ball landed on ${outcome.resultNumber}.`,
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Transaction failed');
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="rounded-[40px] bg-zinc-900 border border-white/5 p-8 sm:p-12 shadow-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-2">ROULETTE</h1>
          <p className="text-zinc-500">Place your bets on the wheel of fortune</p>
        </div>

        {/* Roulette Wheel Placeholder */}
        <div className="flex justify-center mb-16">
          <div className="relative h-64 w-64 rounded-full border-8 border-zinc-800 bg-zinc-950 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <motion.div
              animate={isSpinning ? { rotate: 3600 } : { rotate: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Decorative Wheel Spokes */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-full w-1 bg-zinc-800"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                />
              ))}
            </motion.div>
            
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Result</span>
              <div className={cn(
                "h-20 w-20 rounded-full flex items-center justify-center text-4xl font-black text-white transition-colors",
                lastNumber === null ? "bg-zinc-800" : 
                lastNumber === 0 ? "bg-emerald-600" : 
                [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(lastNumber) ? "bg-rose-600" : "bg-zinc-900"
              )}>
                {lastNumber ?? '?'}
              </div>
            </div>
          </div>
        </div>

        {/* Betting Board */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => setBetType('red')}
            disabled={isSpinning}
            className={cn(
              "rounded-xl py-4 font-bold transition-all border-2",
              betType === 'red' ? "bg-rose-600 border-rose-400 text-white" : "bg-rose-900/20 border-rose-900/40 text-rose-500 hover:bg-rose-900/30"
            )}
          >
            RED
          </button>
          <button
            onClick={() => setBetType('black')}
            disabled={isSpinning}
            className={cn(
              "rounded-xl py-4 font-bold transition-all border-2",
              betType === 'black' ? "bg-zinc-800 border-zinc-600 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800"
            )}
          >
            BLACK
          </button>
          <button
            onClick={() => setBetType('even')}
            disabled={isSpinning}
            className={cn(
              "rounded-xl py-4 font-bold transition-all border-2",
              betType === 'even' ? "bg-purple-600 border-purple-400 text-white" : "bg-purple-900/20 border-purple-900/40 text-purple-500 hover:bg-purple-900/30"
            )}
          >
            EVEN
          </button>
          <button
            onClick={() => setBetType('odd')}
            disabled={isSpinning}
            className={cn(
              "rounded-xl py-4 font-bold transition-all border-2",
              betType === 'odd' ? "bg-purple-600 border-purple-400 text-white" : "bg-purple-900/20 border-purple-900/40 text-purple-500 hover:bg-purple-900/30"
            )}
          >
            ODD
          </button>
        </div>

        {/* Number Grid (Simplified) */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Direct Number (35x)</span>
            {typeof betType === 'number' && (
              <span className="text-xs font-bold text-purple-400">Selected: {betType}</span>
            )}
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
            <button
              onClick={() => setBetType(0)}
              disabled={isSpinning}
              className={cn(
                "col-span-1 rounded-lg py-2 text-xs font-bold transition-all border",
                betType === 0 ? "bg-emerald-600 border-emerald-400 text-white" : "bg-emerald-900/20 border-emerald-900/40 text-emerald-500"
              )}
            >
              0
            </button>
            {[...Array(36)].map((_, i) => {
              const n = i + 1;
              const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(n);
              return (
                <button
                  key={n}
                  onClick={() => setBetType(n)}
                  disabled={isSpinning}
                  className={cn(
                    "rounded-lg py-2 text-xs font-bold transition-all border",
                    betType === n 
                      ? "bg-purple-600 border-purple-400 text-white" 
                      : isRed 
                        ? "bg-rose-900/10 border-rose-900/20 text-rose-500" 
                        : "bg-zinc-800/50 border-zinc-800 text-zinc-500"
                  )}
                >
                  {n}
                </button>
              );
            })}
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
            disabled={!isWalletConnected || betType === null || !betAmount || isSpinning || parseFloat(betAmount) > balance}
            className="w-full rounded-2xl bg-purple-600 py-5 text-xl font-black text-white shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? 'SPINNING...' : !isWalletConnected ? 'CONNECT WALLET' : 'SPIN WHEEL'}
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
