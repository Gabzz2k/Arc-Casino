import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletButton } from './WalletButton';
import { BalanceDisplay } from './BalanceDisplay';
import { Dice5 } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Lobby', path: '/' },
    { name: 'Coin Flip', path: '/coinflip' },
    { name: 'Roulette', path: '/roulette' },
    { name: 'Slots', path: '/slots' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="rounded-lg bg-purple-600 p-2 group-hover:bg-purple-500 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.5)]">
            <Dice5 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            ARC <span className="text-purple-500">CASINO</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                location.pathname === link.path ? 'text-purple-500' : 'text-zinc-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <BalanceDisplay />
          <WalletButton />
        </div>
      </div>
    </nav>
  );
};
