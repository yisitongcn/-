import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType } from '../types';
import { getSuitSymbol, getSuitColor } from '../utils/cardUtils';

interface PlayingCardProps {
  card: CardType;
  isFaceUp?: boolean;
  onClick?: () => void;
  isSelectable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isFaceUp = true,
  onClick,
  isSelectable = false,
  className = '',
  style = {},
}) => {
  const symbol = getSuitSymbol(card.suit);
  const colorClass = getSuitColor(card.suit);
  const isEight = card.rank === '8';

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={isSelectable ? { y: -10, scale: 1.05 } : {}}
      whileTap={isSelectable ? { scale: 0.95 } : {}}
      onClick={isSelectable ? onClick : undefined}
      style={style}
      className={`
        relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 shadow-md flex flex-col justify-between p-2 cursor-pointer transition-all duration-300
        ${isFaceUp 
          ? (isEight ? 'bg-gradient-to-br from-amber-50 via-white to-amber-100 border-amber-400 shadow-amber-200/50' : 'bg-white border-slate-200') 
          : 'bg-slate-950 border-red-900'}
        ${isSelectable ? (isEight ? 'hover:border-amber-500 hover:shadow-amber-400/30 hover:shadow-xl' : 'hover:border-red-500 hover:shadow-red-500/20 hover:shadow-xl') : ''}
        ${className}
      `}
    >
      {isFaceUp ? (
        <>
          {/* Background Texture for 8s */}
          {isEight && (
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent"></div>
              <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(45deg, #fbbf24 25%, transparent 25%, transparent 50%, #fbbf24 50%, #fbbf24 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }}></div>
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              />
            </div>
          )}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-red-900 rounded-full"></div>
            <div className="absolute bottom-1/3 right-1/4 w-0.5 h-0.5 bg-red-900 rounded-full"></div>
          </div>
          <div className={`flex flex-col items-start leading-none ${isEight ? 'text-amber-700' : colorClass}`}>
            <span className="text-lg sm:text-xl font-bold">{card.rank}</span>
            <span className="text-sm sm:text-base">{symbol}</span>
          </div>
          
          <div className={`absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl opacity-20 ${isEight ? 'text-amber-600' : colorClass}`}>
            {symbol}
          </div>

          <div className={`flex flex-col items-end leading-none rotate-180 ${isEight ? 'text-amber-700' : colorClass}`}>
            <span className="text-lg sm:text-xl font-bold">{card.rank}</span>
            <span className="text-sm sm:text-base">{symbol}</span>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-lg">
          {/* Background Texture Layers */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-transparent to-transparent"></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #450a0a 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
          </div>
          
          {/* Ornate Corners */}
          <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-red-500/30 rounded-tl-sm"></div>
          <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-red-500/30 rounded-tr-sm"></div>
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-red-500/30 rounded-bl-sm"></div>
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-red-500/30 rounded-br-sm"></div>

          {/* Center Icon */}
          <div className="relative group/back">
            <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 group-hover/back:opacity-40 transition-opacity"></div>
            <div className="w-12 h-16 sm:w-16 sm:h-24 border border-red-500/40 rounded-lg flex flex-col items-center justify-center bg-red-950/40 backdrop-blur-sm relative z-10">
               <div className="absolute inset-1 border border-red-500/10 rounded-md"></div>
               <div className="relative w-10 h-14 sm:w-12 sm:h-18 flex items-center justify-center">
                 {/* Stylized Belial Face SVG */}
                 <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                   {/* Head Shape */}
                   <path d="M50 10 L85 40 L80 85 L50 95 L20 85 L15 40 Z" fill="#000" stroke="#450a0a" strokeWidth="2" />
                   {/* Red Patterns */}
                   <path d="M50 15 L65 35 L50 55 L35 35 Z" fill="#991b1b" />
                   <path d="M20 45 Q30 50 35 65" fill="none" stroke="#991b1b" strokeWidth="3" />
                   <path d="M80 45 Q70 50 65 65" fill="none" stroke="#991b1b" strokeWidth="3" />
                   {/* Iconic Sharp Yellow Eyes */}
                   <path d="M30 40 Q40 35 45 45 Q40 55 30 50 Z" fill="#fbbf24" className="animate-pulse" />
                   <path d="M70 40 Q60 35 55 45 Q60 55 70 50 Z" fill="#fbbf24" className="animate-pulse" />
                   {/* Mouth/Chin detail */}
                   <path d="M45 80 L50 85 L55 80" fill="none" stroke="#991b1b" strokeWidth="2" />
                 </svg>
               </div>
               <div className="flex gap-1 mt-2">
                 <div className="w-1 h-1 bg-red-500/40 rounded-full"></div>
                 <div className="w-1 h-1 bg-red-500/40 rounded-full"></div>
                 <div className="w-1 h-1 bg-red-500/40 rounded-full"></div>
               </div>
            </div>
          </div>

          {/* Floating Particles */}
          <motion.div 
            animate={{ 
              y: [0, -40],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-1/4 w-1 h-1 bg-red-500 rounded-full blur-[1px]"
          />
          <motion.div 
            animate={{ 
              y: [0, -30],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
            className="absolute bottom-0 right-1/3 w-0.5 h-0.5 bg-red-400 rounded-full blur-[1px]"
          />
        </div>
      )}
    </motion.div>
  );
};
