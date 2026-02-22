import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit } from '../types';
import { getSuitSymbol, getSuitColor } from '../utils/cardUtils';

interface SuitPickerProps {
  onSelect: (suit: Suit) => void;
}

export const SuitPicker: React.FC<SuitPickerProps> = ({ onSelect }) => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 bg-red-900/10 blur-xl rounded-full pointer-events-none"></div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 underline decoration-red-500/30">选择花色</h2>
        <div className="grid grid-cols-2 gap-4">
          {suits.map((suit) => {
            const suitNames: Record<Suit, string> = {
              hearts: '红心',
              diamonds: '方块',
              clubs: '梅花',
              spades: '黑桃'
            };
            return (
              <button
                key={suit}
                onClick={() => onSelect(suit)}
                className={`
                  flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group
                  ${getSuitColor(suit)}
                `}
              >
                <span className="text-4xl mb-2 group-hover:scale-125 transition-transform">
                  {getSuitSymbol(suit)}
                </span>
                <span className="text-sm font-semibold uppercase tracking-wider opacity-60">
                  {suitNames[suit]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
