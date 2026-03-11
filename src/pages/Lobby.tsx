import React from 'react';
import { motion } from 'motion/react';
import { GameCard } from '../components/GameCard';
import { Coins, RotateCcw, LayoutGrid } from 'lucide-react';

export default function Lobby() {
  const games = [
    {
      title: 'Coin Flip',
      description: 'Double your money with a 50/50 chance. Heads or Tails, you decide.',
      icon: <Coins className="h-8 w-8" />,
      path: '/coinflip',
      color: 'bg-blue-600',
    },
    {
      title: 'Roulette',
      description: 'The classic casino experience. Bet on colors, numbers, or properties.',
      icon: <RotateCcw className="h-8 w-8" />,
      path: '/roulette',
      color: 'bg-purple-600',
    },
    {
      title: 'Slot Machine',
      description: 'Spin the reels and match symbols for massive payouts up to 100x.',
      icon: <LayoutGrid className="h-8 w-8" />,
      path: '/slots',
      color: 'bg-rose-600',
    },
  ];

  return (
    <div className="relative min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mx-auto max-w-4xl text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl mb-6">
            THE FUTURE OF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              DECENTRALIZED GAMING
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Experience the thrill of the casino with provably fair games and instant payouts. 
            Connect your wallet to start winning today.
          </p>
        </motion.div>
      </div>

      {/* Games Grid */}
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              <GameCard {...game} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
