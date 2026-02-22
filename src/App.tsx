import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, GameState, Suit, GameStatus } from './types';
import { createDeck, isValidMove, shuffle } from './utils/cardUtils';
import { PlayingCard } from './components/PlayingCard';
import { SuitPicker } from './components/SuitPicker';
import { Trophy, RotateCcw, User, Cpu, Info, Frown, Lock, Megaphone, Pause, Play, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_HAND_SIZE = 8;

const BelialAvatar = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) => {
  const dimensions = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-24 h-24"
  };
  
  return (
    <div className={`${dimensions[size]} ${className} relative flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]">
        <path d="M50 5 L90 40 L85 90 L50 98 L15 90 L10 40 Z" fill="#000" stroke="#450a0a" strokeWidth="2" />
        <path d="M50 10 L70 35 L50 60 L30 35 Z" fill="#991b1b" />
        <path d="M15 45 Q30 50 35 70" fill="none" stroke="#991b1b" strokeWidth="4" />
        <path d="M85 45 Q70 50 65 70" fill="none" stroke="#991b1b" strokeWidth="4" />
        <path d="M25 35 Q40 30 45 45 Q40 60 25 55 Z" fill="#fbbf24" />
        <path d="M75 35 Q60 30 55 45 Q60 60 75 55 Z" fill="#fbbf24" />
        <path d="M40 85 L50 92 L60 85" fill="none" stroke="#991b1b" strokeWidth="3" />
      </svg>
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentSuit: null,
    turn: 'player',
    status: 'menu',
    lastAction: '嘿嘿嘿，我是邪恶贝利亚，想打败我必须通关游戏...',
  });

  const [showSuitPicker, setShowSuitPicker] = useState(false);
  const [pendingEightCard, setPendingEightCard] = useState<Card | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [isStruggling, setIsStruggling] = useState(false);

  const startGame = () => {
    setIsStruggling(true);
    setTimeout(() => {
      setIsStruggling(false);
      initGame();
    }, 1000);
  };

  // Initialize Game
  const initGame = useCallback(() => {
    const fullDeck = createDeck();
    const playerHand = fullDeck.splice(0, INITIAL_HAND_SIZE);
    const aiHand = fullDeck.splice(0, INITIAL_HAND_SIZE);
    
    // Find a non-8 card for the start of discard pile
    let firstDiscardIndex = 0;
    while (fullDeck[firstDiscardIndex].rank === '8') {
      firstDiscardIndex++;
    }
    const firstDiscard = fullDeck.splice(firstDiscardIndex, 1)[0];

    setGameState({
      deck: fullDeck,
      playerHand,
      aiHand,
      discardPile: [firstDiscard],
      currentSuit: null,
      turn: 'player',
      status: 'playing',
      lastAction: '游戏开始！轮到你了。',
    });
    setShowSuitPicker(false);
    setPendingEightCard(null);
  }, []);

  useEffect(() => {
    // Game starts via startGame button in menu
  }, [initGame]);

  const checkWin = (hand: Card[], isPlayer: boolean) => {
    if (hand.length === 0) {
      setGameState(prev => ({
        ...prev,
        status: isPlayer ? 'won' : 'lost',
        lastAction: isPlayer ? '你赢了！' : '邪恶贝利亚 赢了！'
      }));
      if (isPlayer) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      return true;
    }
    return false;
  };

  const drawCard = (isPlayer: boolean) => {
    if (gameState.status !== 'playing') return;
    if (gameState.turn === (isPlayer ? 'ai' : 'player')) return;

    setGameState(prev => {
      if (prev.deck.length === 0) {
        // If deck is empty, reshuffle discard pile (except top card)
        if (prev.discardPile.length <= 1) {
          return { ...prev, turn: isPlayer ? 'ai' : 'player', lastAction: '牌堆已空！跳过此回合。' };
        }
        const newDeck = shuffle(prev.discardPile.slice(0, -1));
        const topCard = prev.discardPile[prev.discardPile.length - 1];
        const drawnCard = newDeck.pop()!;
        
        const newHand = isPlayer ? [...prev.playerHand, drawnCard] : [...prev.aiHand, drawnCard];
        return {
          ...prev,
          deck: newDeck,
          discardPile: [topCard],
          [isPlayer ? 'playerHand' : 'aiHand']: newHand,
          turn: isPlayer ? 'ai' : 'player',
          lastAction: `${isPlayer ? '你' : '邪恶贝利亚'} 摸了一张牌。`
        };
      }

      const newDeck = [...prev.deck];
      const drawnCard = newDeck.pop()!;
      const newHand = isPlayer ? [...prev.playerHand, drawnCard] : [...prev.aiHand, drawnCard];

      return {
        ...prev,
        deck: newDeck,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        turn: isPlayer ? 'ai' : 'player',
        lastAction: `${isPlayer ? '你' : '王翠花'} 摸了一张牌。`
      };
    });
  };

  const playCard = (card: Card, isPlayer: boolean) => {
    if (gameState.status !== 'playing') return;
    if (gameState.turn === (isPlayer ? 'ai' : 'player')) return;

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (!isValidMove(card, topCard, gameState.currentSuit)) return;

    if (card.rank === '8') {
      if (isPlayer) {
        setPendingEightCard(card);
        setShowSuitPicker(true);
        return;
      } else {
        // AI plays 8
        const aiSuits = gameState.aiHand.filter(c => c.id !== card.id).map(c => c.suit);
        const counts: Record<string, number> = {};
        aiSuits.forEach(s => counts[s] = (counts[s] || 0) + 1);
        const bestSuit = (Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || 'hearts') as Suit;
        
        executePlay(card, isPlayer, bestSuit);
      }
    } else {
      executePlay(card, isPlayer, null);
    }
  };

  const executePlay = (card: Card, isPlayer: boolean, newSuit: Suit | null) => {
    setGameState(prev => {
      const handKey = isPlayer ? 'playerHand' : 'aiHand';
      const newHand = prev[handKey].filter(c => c.id !== card.id);
      
      const newState: GameState = {
        ...prev,
        [handKey]: newHand,
        discardPile: [...prev.discardPile, card],
        currentSuit: newSuit,
        turn: isPlayer ? 'ai' : 'player',
        lastAction: `${isPlayer ? '你' : '邪恶贝利亚'} 打出了 ${card.rank} (${card.suit})${newSuit ? ` (新花色: ${newSuit})` : ''}。`
      };

      return newState;
    });
  };

  // AI Turn Logic
  useEffect(() => {
    if (gameState.turn === 'ai' && gameState.status === 'playing' && !isPaused) {
      const timer = setTimeout(() => {
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        const validMoves = gameState.aiHand.filter(c => isValidMove(c, topCard, gameState.currentSuit));

        if (validMoves.length > 0) {
          // AI strategy: play a non-8 if possible, otherwise play 8
          const nonEightMoves = validMoves.filter(c => c.rank !== '8');
          const cardToPlay = nonEightMoves.length > 0 
            ? nonEightMoves[Math.floor(Math.random() * nonEightMoves.length)]
            : validMoves[0];
          
          playCard(cardToPlay, false);
        } else {
          drawCard(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.turn, gameState.status, gameState.aiHand, gameState.discardPile, gameState.currentSuit, isPaused]);

  // Check win condition after state updates
  useEffect(() => {
    if (gameState.status === 'playing') {
      if (gameState.playerHand.length === 0) checkWin([], true);
      else if (gameState.aiHand.length === 0) checkWin([], false);
    }
  }, [gameState.playerHand.length, gameState.aiHand.length, gameState.status]);

  const handleSuitSelect = (suit: Suit) => {
    if (pendingEightCard) {
      executePlay(pendingEightCard, true, suit);
      setPendingEightCard(null);
      setShowSuitPicker(false);
    }
  };

  const [isScreaming, setIsScreaming] = useState(false);

  const handleScream = () => {
    setIsScreaming(true);
    setTimeout(() => setIsScreaming(false), 500);
  };

  return (
    <div className={`min-h-screen bg-black text-white font-sans selection:bg-red-500/30 overflow-hidden flex flex-col ${isScreaming ? 'animate-struggle' : ''}`}>
      <AnimatePresence mode="wait">
        {gameState.status === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-6 relative"
          >
            {/* Blood Drips */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-30">
               <div className="absolute top-0 left-[10%] w-1 h-20 bg-red-600 rounded-full animate-drip" style={{ animationDuration: '7s' }}></div>
               <div className="absolute top-0 left-[30%] w-1.5 h-32 bg-red-700 rounded-full animate-drip" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
               <div className="absolute top-0 left-[60%] w-1 h-24 bg-red-600 rounded-full animate-drip" style={{ animationDuration: '8s', animationDelay: '5s' }}></div>
               <div className="absolute top-0 left-[85%] w-2 h-40 bg-red-800 rounded-full animate-drip" style={{ animationDuration: '12s', animationDelay: '1s' }}></div>
            </div>

            {/* Kidnapping Atmosphere */}
            <div className="absolute inset-0 pointer-events-none z-20 vignette"></div>
            
            {/* Chains */}
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
               <div className="absolute -top-20 left-10 w-4 h-[120%] border-x-4 border-slate-700/40 bg-slate-800/20 animate-swing"></div>
               <div className="absolute -top-40 right-20 w-6 h-[120%] border-x-4 border-slate-700/40 bg-slate-800/20 animate-swing" style={{ animationDelay: '1s' }}></div>
               <div className="absolute -top-10 left-1/3 w-2 h-[120%] border-x-2 border-slate-700/30 bg-slate-800/10 animate-swing" style={{ animationDelay: '0.5s' }}></div>
            </div>

            {/* Struggle Flash */}
            {(isStruggling || isScreaming) && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.1, repeat: Infinity }}
                  className="absolute inset-0 bg-red-600 z-[60] pointer-events-none"
                />
                {isScreaming && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    className="absolute inset-0 z-[70] flex items-center justify-center pointer-events-none"
                  >
                    <span className="text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] uppercase">哈哈哈哈哈</span>
                  </motion.div>
                )}
              </>
            )}

            {/* Background Decoration - More Chaotic */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
               {/* 邪恶贝利亚 Silhouette */}
               <motion.div 
                 animate={{ 
                   opacity: [0.1, 0.3, 0.1],
                   scale: [1, 1.05, 1]
                 }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="absolute bottom-0 right-0 w-[40%] h-[60%] bg-red-900 blur-3xl rounded-full -mr-20 -mb-20"
               />
               
               <motion.div 
                 animate={{ 
                   x: [0, 10, -10, 0], 
                   y: [0, -20, 20, 0],
                   rotate: [12, 45, -12, 12] 
                 }}
                 transition={{ duration: 5, repeat: Infinity }}
                 className="absolute top-10 left-10"
               >
                 <PlayingCard card={{id: '1', suit: 'hearts', rank: 'A'}} />
               </motion.div>
               <motion.div 
                 animate={{ 
                   x: [0, -30, 30, 0], 
                   y: [0, 40, -40, 0],
                   rotate: [-12, -45, 12, -12] 
                 }}
                 transition={{ duration: 7, repeat: Infinity }}
                 className="absolute bottom-20 right-10"
               >
                 <PlayingCard card={{id: '2', suit: 'spades', rank: '8'}} />
               </motion.div>
               <motion.div 
                 animate={{ 
                   scale: [1, 1.2, 0.8, 1],
                   rotate: [-45, 0, 45, -45] 
                 }}
                 transition={{ duration: 6, repeat: Infinity }}
                 className="absolute top-1/2 left-1/4"
               >
                 <PlayingCard card={{id: '3', suit: 'diamonds', rank: 'K'}} />
               </motion.div>
               <motion.div 
                 animate={{ 
                   opacity: [0, 0.2, 0],
                   scale: [0.8, 1, 0.8]
                 }}
                 transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                 className="absolute top-1/4 right-1/4 text-4xl font-black text-red-500/20 select-none rotate-12"
               >
                 求饶吧...
               </motion.div>

               <motion.div 
                 animate={{ 
                   opacity: [0.1, 0.5, 0.1],
                   x: [0, 100, -100, 0]
                 }}
                 transition={{ duration: 10, repeat: Infinity }}
                 className="absolute bottom-1/4 left-1/2 text-98xl font-extrabold text-white/5 select-none"
               >
                 BELIAL
               </motion.div>
            </div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="z-10 text-center relative"
            >
              <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full animate-pulse"></div>
              
              <div className="relative">
                <div className="w-24 h-24 bg-red-900 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-8 ring-8 ring-white/10 rotate-12 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                  <BelialAvatar size="lg" />
                </div>
                
                <h1 className="text-7xl sm:text-9xl font-extrabold tracking-tight mb-4 relative inline-block whitespace-nowrap">
                  <span className="relative z-10">邪恶<span className="text-red-600">贝利亚</span></span>
                  {/* Glitch Layers */}
                  <span className="absolute top-0 left-0 -ml-1 text-red-500 opacity-70 z-0 animate-glitch-1 select-none">邪恶贝利亚</span>
                  <span className="absolute top-0 left-0 ml-1 text-blue-500 opacity-70 z-0 animate-glitch-2 select-none">邪恶贝利亚</span>
                </h1>
              </div>

              <p className="text-white/80 text-xl sm:text-2xl font-extrabold mb-12 tracking-widest uppercase bg-black/40 py-2 px-4 backdrop-blur-sm inline-block skew-x-12 animate-pulse">
                你被 <span className="text-red-500 animate-glitch-1">邪恶贝利亚</span> 绑架了！
              </p>

              <div className="flex flex-col gap-6 items-center mb-12">
                <motion.div 
                  animate={{ 
                    rotate: [0, -5, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-red-600/20 border-2 border-red-500/50 p-4 rounded-xl backdrop-blur-md max-w-xs"
                >
                  <p className="text-red-400 font-bold text-sm leading-relaxed">
                    "嘿嘿嘿，我是邪恶贝利亚，想逃走吗？那就陪我玩一场疯狂的游戏。赢了你就能走，输了...你就永远留在这里陪我！"
                  </p>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={startGame}
                    disabled={isStruggling}
                    className={`group relative px-12 py-5 bg-white text-emerald-900 rounded-2xl font-black text-xl hover:bg-red-600 hover:text-white active:scale-95 transition-all shadow-2xl shadow-black/20 overflow-hidden ${isStruggling ? 'animate-struggle bg-red-600 text-white' : ''}`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isStruggling ? null : <Lock className="w-5 h-5" />}
                      {isStruggling ? '正在挣脱...' : '打败贝利亚吧'}
                    </span>
                    <motion.div 
                      className="absolute inset-0 bg-red-500/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
                    />
                    {/* Blood splatters */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute top-2 left-4 w-2 h-2 bg-red-600 rounded-full blur-[1px]"></div>
                      <div className="absolute bottom-4 right-8 w-3 h-3 bg-red-700 rounded-full blur-[1px]"></div>
                      <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-red-500 rounded-full blur-[1px]"></div>
                    </div>
                  </button>
                  
                  <div className="group relative">
                    <button 
                      onClick={handleScream}
                      className="px-8 py-5 bg-red-900/40 border border-red-500/30 rounded-2xl font-bold text-lg hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 relative overflow-hidden group/scream"
                    >
                      <Megaphone className="w-5 h-5 group-hover/scream:animate-bounce" />
                      大声呼救
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover/scream:opacity-100 transition-opacity">
                        <div className="absolute top-1 left-2 w-1 h-1 bg-red-500 rounded-full"></div>
                        <div className="absolute bottom-2 right-4 w-2 h-2 bg-red-600 rounded-full"></div>
                      </div>
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 p-6 bg-[#f4f1ea] text-slate-900 rounded-sm shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-left border-2 border-slate-300 rotate-1">
                      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600/20 rounded-full blur-md"></div>
                      <h3 className="font-bold mb-2 flex items-center gap-2 text-red-800 underline decoration-wavy">
                        绑架生存法则
                      </h3>
                      <ul className="text-sm space-y-2 text-slate-700 font-mono">
                        <li>• 必须匹配顶牌的 <b>花色</b> 或 <b>点数</b>。</li>
                        <li>• <b>8 是万能牌！</b> 随时可以打出并改变花色。</li>
                        <li>• 如果无牌可出，必须从牌堆 <b>摸一张牌</b>。</li>
                        <li>• 最先清空手牌的一方获胜！</li>
                        <li className="text-red-600 font-bold pt-2">※ 输了就再也回不去了...</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-20 flex items-center gap-8 opacity-40">
               <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">52</span>
                  <span className="text-[10px] uppercase tracking-widest">张牌</span>
               </div>
               <div className="w-px h-8 bg-white/20"></div>
               <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">1V1</span>
                  <span className="text-[10px] uppercase tracking-widest">对决</span>
               </div>
               <div className="w-px h-8 bg-white/20"></div>
               <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">∞</span>
                  <span className="text-[10px] uppercase tracking-widest">乐趣</span>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                <div className="absolute top-2 left-1/4 w-1 h-1 bg-red-600 rounded-full"></div>
                <div className="absolute top-4 left-1/2 w-1.5 h-1.5 bg-red-700 rounded-full"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 overflow-hidden ${gameState.playerHand.length < gameState.aiHand.length ? 'bg-red-500 animate-shake-frustrated' : 'bg-red-900'}`}>
                  <BelialAvatar size="sm" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">邪恶贝利亚</h1>
                  <p className="text-xs text-white/60 uppercase tracking-widest">标准 52 张牌模式</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsPaused(true)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors relative overflow-hidden group/pause"
                  title="暂停游戏"
                >
                  <div className="absolute inset-0 opacity-0 group-hover/pause:opacity-20 pointer-events-none">
                     <div className="absolute top-1 left-1 w-1 h-1 bg-indigo-400 rounded-full"></div>
                  </div>
                  <Pause className="w-5 h-5 relative z-10" />
                </button>

                <button 
                  onClick={() => setGameState(prev => ({ ...prev, status: 'menu' }))}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors relative overflow-hidden group/back"
                  title="返回主菜单"
                >
                  <div className="absolute inset-0 opacity-0 group-hover/back:opacity-20 pointer-events-none">
                     <div className="absolute top-1 left-1 w-1 h-1 bg-red-500 rounded-full"></div>
                  </div>
                  <RotateCcw className="w-5 h-5 relative z-10" />
                </button>
              </div>
            </header>

            {/* Game Area */}
            <main className="flex-1 relative p-4 flex flex-col justify-between max-w-5xl mx-auto w-full">
              
              {/* AI Hand */}
              <div className="flex flex-col items-center gap-2 relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-900/10 blur-3xl rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-2 text-white/60 text-xs font-mono uppercase tracking-widest">
                  <Cpu className="w-3 h-3" />
                  <span>邪恶贝利亚 的手牌 ({gameState.aiHand.length})</span>
                </div>
                <div className="flex -space-x-12 sm:-space-x-16 overflow-visible py-4">
                  {gameState.aiHand.map((card, i) => (
                    <PlayingCard 
                      key={card.id} 
                      card={card} 
                      isFaceUp={false} 
                      className="shadow-xl"
                      style={{ zIndex: i }}
                    />
                  ))}
                </div>
              </div>

              {/* Center Table */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 my-8">
                {/* Draw Pile */}
                <div className="flex flex-col items-center gap-3 relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-red-900/10 blur-xl rounded-full pointer-events-none"></div>
                  <div 
                    onClick={() => !isPaused && drawCard(true)}
                    className={`
                      relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 border-indigo-800 bg-indigo-600 shadow-2xl cursor-pointer
                      hover:scale-105 active:scale-95 transition-transform group
                      ${!isPaused && gameState.turn === 'player' ? 'ring-4 ring-indigo-400/50' : 'opacity-80'}
                    `}
                  >
                    <div className="absolute inset-2 border border-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-white/20 text-2xl font-bold group-hover:scale-110 transition-transform">
                        {gameState.deck.length}
                      </span>
                    </div>
                    {/* Stack effect */}
                    <div className="absolute -top-1 -left-1 w-full h-full rounded-xl border-2 border-indigo-800 bg-indigo-600 -z-10"></div>
                    <div className="absolute -top-2 -left-2 w-full h-full rounded-xl border-2 border-indigo-800 bg-indigo-600 -z-20"></div>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">摸牌堆</span>
                </div>

                {/* Discard Pile */}
                <div className="flex flex-col items-center gap-3 relative">
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-red-900/10 blur-xl rounded-full pointer-events-none"></div>
                  <div className="relative w-20 h-28 sm:w-24 sm:h-36">
                    <AnimatePresence mode="popLayout">
                      {gameState.discardPile.slice(-1).map((card) => (
                        <PlayingCard 
                          key={card.id} 
                          card={card} 
                          className="absolute inset-0 shadow-2xl"
                        />
                      ))}
                    </AnimatePresence>
                    {gameState.currentSuit && (
                      <div className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-indigo-500 animate-bounce overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                           <div className="absolute top-1 left-2 w-1 h-1 bg-red-600 rounded-full"></div>
                        </div>
                        <span className={`text-xl relative z-10 ${gameState.currentSuit === 'hearts' || gameState.currentSuit === 'diamonds' ? 'text-red-500' : 'text-slate-900'}`}>
                          {gameState.currentSuit === 'hearts' ? '♥' : gameState.currentSuit === 'diamonds' ? '♦' : gameState.currentSuit === 'clubs' ? '♣' : '♠'}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">弃牌堆</span>
                </div>

                {/* Game Info */}
                <div className="hidden lg:flex flex-col gap-4 w-48 p-4 bg-black/20 rounded-2xl border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-red-900/10 blur-lg rounded-full pointer-events-none"></div>
                  <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                    <Info className="w-3 h-3" />
                    <span>最近动态</span>
                  </div>
                   <p className="text-sm text-white/80 leading-relaxed italic">
                     "{gameState.lastAction}"
                   </p>
                </div>
              </div>

              {/* Player Hand */}
              <div className="flex flex-col items-center gap-4 relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-900/20 blur-3xl rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-4">
                   <div className={`
                     px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all relative overflow-hidden
                     ${gameState.turn === 'player' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50' : 'bg-white/10 text-white/40'}
                   `}>
                     <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-2 w-1 h-1 bg-red-900 rounded-full"></div>
                     </div>
                     <span className="relative z-10">{gameState.turn === 'player' ? '轮到你了' : "邪恶贝利亚 正在思考..."}</span>
                   </div>
                   <div className="flex items-center gap-2 text-white/60 text-xs font-mono uppercase tracking-widest">
                     <User className="w-3 h-3" />
                     <span>你的手牌 ({gameState.playerHand.length})</span>
                   </div>
                </div>
                
                <div className="flex -space-x-8 sm:-space-x-12 overflow-visible py-6 px-12 max-w-full overflow-x-auto no-scrollbar">
                  {gameState.playerHand.map((card) => (
                    <PlayingCard 
                      key={card.id} 
                      card={card} 
                      isSelectable={!isPaused && gameState.turn === 'player' && isValidMove(card, gameState.discardPile[gameState.discardPile.length - 1], gameState.currentSuit)}
                      onClick={() => playCard(card, true)}
                      className="shadow-xl"
                    />
                  ))}
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showSuitPicker && (
          <SuitPicker onSelect={handleSuitSelect} />
        )}

        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white text-slate-900 rounded-3xl p-10 shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none">
                <div className="absolute top-10 left-10 w-4 h-4 bg-indigo-600 rounded-full blur-sm"></div>
                <div className="absolute bottom-20 right-10 w-6 h-6 bg-indigo-700 rounded-full blur-md"></div>
              </div>

              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                <Pause className="w-10 h-10" />
              </div>

              <h2 className="text-3xl font-black mb-8">游戏暂停</h2>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setIsPaused(false)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  继续游戏
                </button>

                <button
                  onClick={() => {
                    setIsPaused(false);
                    initGame();
                  }}
                  className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  重新开始
                </button>

                <button
                  onClick={() => {
                    setIsPaused(false);
                    setGameState(prev => ({ ...prev, status: 'menu' }));
                  }}
                  className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-lg hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  返回主菜单
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {gameState.status !== 'playing' && gameState.status !== 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white text-slate-900 rounded-3xl p-10 shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none">
                <div className="absolute top-10 left-10 w-4 h-4 bg-red-600 rounded-full blur-sm"></div>
                <div className="absolute bottom-20 right-10 w-6 h-6 bg-red-700 rounded-full blur-md"></div>
              </div>
              {gameState.status === 'won' && (
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500 animate-pulse"></div>
              )}

              <div className="relative mb-6">
                {gameState.status === 'won' ? (
                  <div className="relative w-24 h-24 mx-auto">
                    {/* Steam effects */}
                    <div className="absolute -top-4 left-1/4 w-2 h-2 bg-slate-300 rounded-full animate-steam"></div>
                    <div className="absolute -top-6 left-1/2 w-3 h-3 bg-slate-200 rounded-full animate-steam" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute -top-3 right-1/4 w-2 h-2 bg-slate-300 rounded-full animate-steam" style={{ animationDelay: '0.6s' }}></div>
                    
                    <motion.div 
                      className="w-24 h-24 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 border-4 border-red-200 animate-shake-frustrated overflow-hidden"
                    >
                      <BelialAvatar size="lg" />
                    </motion.div>
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg border border-slate-100">
                      <Frown className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 mx-auto bg-red-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12 overflow-hidden">
                    <BelialAvatar size="lg" />
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-black mb-2">
                {gameState.status === 'won' ? '成功战胜了贝利亚' : '挑战失败'}
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                {gameState.status === 'won' 
                  ? "你成功战胜了贝利亚" 
                  : "你挑战失败重新开始"}
              </p>
              <button
                onClick={initGame}
                className={`w-full py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all shadow-xl ${gameState.status === 'won' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'}`}
              >
                {gameState.status === 'won' ? '再次挑战' : '重新开始'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Last Action Toast */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 pointer-events-none">
         <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-xl text-xs text-center text-white/80 italic">
           {gameState.lastAction}
         </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
