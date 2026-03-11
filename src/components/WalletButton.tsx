import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { connectWallet, getUserBalance } from '../lib/blockchain';

export const WalletButton = () => {
  const { isWalletConnected, setIsWalletConnected, setBalance, walletAddress, setWalletAddress } = useGame();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (isWalletConnected && walletAddress) {
      // Simple disconnect in UI only
      setIsWalletConnected(false);
      setWalletAddress(null);
      setBalance(0);
      setError(null);
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      const { address, balance } = await connectWallet();
      setIsWalletConnected(true);
      setWalletAddress(address);
      setBalance(balance);
    } catch (e: any) {
      setError(e?.message || 'Failed to connect wallet');
      setIsWalletConnected(false);
      setWalletAddress(null);
      setBalance(0);
    } finally {
      setIsConnecting(false);
    }
  };

  const shortAddress =
    walletAddress && walletAddress.length > 8
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : walletAddress;

  // keep balance in sync when already connected and wallet changes network/balance
  React.useEffect(() => {
    if (!walletAddress || !isWalletConnected || !window.ethereum) return;

    const updateBalance = async () => {
      try {
        const newBalance = await getUserBalance(walletAddress);
        setBalance(newBalance);
      } catch {
        // ignore
      }
    };

    updateBalance();

    const handler = () => {
      updateBalance();
    };

    window.ethereum.on?.('accountsChanged', handler);
    window.ethereum.on?.('chainChanged', handler);

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handler);
      window.ethereum?.removeListener?.('chainChanged', handler);
    };
  }, [walletAddress, isWalletConnected, setBalance]);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95",
          isWalletConnected
            ? "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
            : "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]",
          isConnecting && "opacity-60 cursor-wait"
        )}
      >
        <Wallet className="h-4 w-4" />
        {isConnecting
          ? 'Connecting...'
          : isWalletConnected && shortAddress
          ? shortAddress
          : 'Connect Wallet'}
      </button>
      {error && (
        <span className="text-[10px] text-rose-400 max-w-xs text-right">
          {error}
        </span>
      )}
    </div>
  );
};

