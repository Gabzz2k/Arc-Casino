import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

export const GameCard = ({ title, description, icon, path, color }: GameCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 p-8 transition-all hover:border-purple-500/50"
    >
      {/* Background Glow */}
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${color}`} />
      
      <div className="relative z-10">
        <div className={`mb-6 inline-flex rounded-2xl p-4 text-white shadow-lg ${color}`}>
          {icon}
        </div>
        
        <h3 className="mb-2 text-2xl font-bold text-white">{title}</h3>
        <p className="mb-8 text-zinc-400 leading-relaxed">{description}</p>
        
        <Link
          to={path}
          className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 group-hover:gap-3"
        >
          Play Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
};
