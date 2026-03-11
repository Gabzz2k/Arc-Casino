import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/Navbar';
import Lobby from './pages/Lobby';
import CoinFlip from './pages/CoinFlip';
import Roulette from './pages/Roulette';
import Slots from './pages/Slots';

export default function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen bg-black text-zinc-100 selection:bg-purple-500/30">
          <Navbar />
          <main className="mx-auto max-w-7xl">
            <Routes>
              <Route path="/" element={<Lobby />} />
              <Route path="/coinflip" element={<CoinFlip />} />
              <Route path="/roulette" element={<Roulette />} />
              <Route path="/slots" element={<Slots />} />
            </Routes>
          </main>
          
          {/* Footer */}
          <footer className="mt-24 border-t border-white/5 py-12 px-4 text-center">
            <p className="text-sm text-zinc-600">
              &copy; 2026 ARC CASINO. Built for the decentralized future.
            </p>
          </footer>
        </div>
      </Router>
    </GameProvider>
  );
}
