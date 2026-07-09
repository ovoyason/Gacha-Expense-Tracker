import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Rarity } from '../types';
import { CardDisplay } from './CardDisplay';
import { Sparkles, X, Gift, AlertTriangle, ArrowRight, Star } from 'lucide-react';
import { getRandomCard } from '../cards';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  standardTickets: number;
  premiumTickets: number;
  bankruptcyTickets: number;
  onSpendTicket: (type: 'STANDARD' | 'PREMIUM' | 'BANKRUPTCY') => Card | null;
  onAddCard: (card: Card) => void;
}

export const GachaModal: React.FC<GachaModalProps> = ({
  isOpen,
  onClose,
  standardTickets,
  premiumTickets,
  bankruptcyTickets,
  onSpendTicket,
  onAddCard
}) => {
  const [selectedType, setSelectedType] = useState<'STANDARD' | 'PREMIUM' | 'BANKRUPTCY' | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [isMultiDraw, setIsMultiDraw] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number; delay: number }>>([]);

  if (!isOpen) return null;

  // 取得卡包中最高的稀有度
  const getHighestRarity = (cards: Card[]): Rarity => {
    const ranks: Record<Rarity, number> = {
      'COMMON': 1,
      'RARE': 2,
      'EPIC': 3,
      'LEGENDARY': 4,
      'MYTHIC': 5
    };
    let highest: Rarity = 'COMMON';
    for (const card of cards) {
      if (ranks[card.rarity] > ranks[highest]) {
        highest = card.rarity;
      }
    }
    return highest;
  };

  const pulledCard = pulledCards[0] || null;

  // 開始抽卡（支援單抽與十連抽）
  const handleStartDraw = (type: 'STANDARD' | 'PREMIUM' | 'BANKRUPTCY', count: number = 1) => {
    setSelectedType(type);
    setIsOpening(true);
    setPulledCards([]);
    setIsFlipped(false);
    setParticles([]);
    setShowFlash(false);
    setIsMultiDraw(count > 1);

    // 1. 搖晃盲盒箱子動畫（1.8秒，營造開箱驚喜感）
    setTimeout(() => {
      // 2. 實際執行抽卡程序
      const cards: Card[] = [];
      for (let i = 0; i < count; i++) {
        const card = onSpendTicket(type);
        if (card) {
          cards.push(card);
          // 將新卡自動加入玩家的個人圖鑑收藏夾
          onAddCard(card);
        }
      }

      if (cards.length > 0) {
        setPulledCards(cards);
        setIsOpening(false);
      } else {
        // 券數不足等防禦性退場
        setIsOpening(false);
        setSelectedType(null);
      }
    }, 1800);
  };

  // 翻開並揭曉卡片，觸發亮瞎眼閃光特效與滿天彩色絢彩粒子
  const handleReveal = () => {
    setIsFlipped(true);

    if (pulledCards.length > 0) {
      const highestRarity = getHighestRarity(pulledCards);

      // 觸發超亮螢幕白光/金光/粉光一閃特效
      setShowFlash(true);
      setTimeout(() => {
        setShowFlash(false);
      }, 800);

      // 根據抽到最高稀有度等級，自訂生成絢麗粒子的噴灑數量與色彩
      const newParticles = [];
      const particleCount = 
        highestRarity === 'MYTHIC' ? 90 :
        highestRarity === 'LEGENDARY' ? 70 : 
        highestRarity === 'EPIC' ? 50 : 
        highestRarity === 'RARE' ? 30 : 15;
      
      const colors = 
        highestRarity === 'MYTHIC' ? ['#f43f5e', '#ef4444', '#f59e0b', '#ffffff', '#ffe4e6'] :
        highestRarity === 'LEGENDARY' ? ['#fbbf24', '#f59e0b', '#d97706', '#ffffff', '#fffbeb'] :
        highestRarity === 'EPIC' ? ['#c084fc', '#a855f7', '#8b5cf6', '#ffffff', '#fae8ff'] :
        highestRarity === 'RARE' ? ['#38bdf8', '#0ea5e9', '#0284c7', '#ffffff', '#f0f9ff'] :
        ['#94a3b8', '#64748b', '#475569', '#ffffff'];

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        // 發散距離
        const distance = 40 + Math.random() * 200;
        newParticles.push({
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 3 + Math.random() * 8,
          delay: Math.random() * 0.15,
        });
      }
      setParticles(newParticles);
    }
  };

  // 重置並返回盲盒選擇介面
  const handleReset = () => {
    setSelectedType(null);
    setPulledCards([]);
    setIsFlipped(false);
    setParticles([]);
    setShowFlash(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/90 backdrop-blur-md">
      <div 
        className="relative w-full max-w-4xl bg-[#050608]/80 border border-white/10 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl flex flex-col items-center backdrop-blur-lg"
        id="gacha-modal-card"
      >
        {/* 粒子與炫光裝飾背景 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 頂部標題（僅在未處於開箱或展示卡片狀態時顯示） */}
        {!selectedType && (
          <div className="w-full flex justify-between items-center mb-6 z-10 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-black tracking-widest text-white flex items-center gap-2 uppercase">
                <Gift className="w-6 h-6 text-fuchsia-400 animate-bounce" />
                GACHA CHAMBER // 理財盲盒抽卡機
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                根據你的記帳表現，解鎖不同箱子獲取專屬收藏卡片！
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-full transition-all cursor-pointer"
              id="close-gacha-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 主內容展示區域 */}
        <div className="w-full flex flex-col items-center justify-center min-h-[400px] z-10 py-4">
          <AnimatePresence mode="wait">
            
            {/* 第一階段：選擇抽卡盒子 */}
            {!selectedType && (
              <motion.div 
                key="choose-box"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl"
              >
                {/* 1. 標準幸運盒 */}
                <div className="bg-white/[0.02] border border-white/10 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between items-center transition-all group hover:bg-white/[0.05]">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Gift className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-cyan-400 transition-colors">標準幸運盒</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      一般記帳時獲得。有機會抽中所有標準卡片！
                    </p>
                  </div>
                  <div className="w-full mt-6">
                    <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono uppercase">
                      <span>擁有券數:</span>
                      <span className="font-bold text-cyan-400">{standardTickets} 張</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleStartDraw('STANDARD', 1)}
                        disabled={standardTickets <= 0}
                        className="w-full py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:bg-slate-900 disabled:text-slate-600 disabled:border-white/5 border border-transparent shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all flex items-center justify-center gap-1 cursor-pointer"
                        id="btn-draw-standard"
                      >
                        單抽 (消耗 1 券)
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStartDraw('STANDARD', 10)}
                        disabled={standardTickets < 10}
                        className="w-full py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white disabled:bg-slate-900/40 disabled:text-slate-600 disabled:border-white/5 border border-transparent hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-1 cursor-pointer"
                        id="btn-draw-standard-10"
                      >
                        十連抽 ⚡ (消耗 10 券)
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. 奢華黃金盒 */}
                <div className="bg-white/[0.02] border border-white/10 hover:border-yellow-500/50 rounded-2xl p-5 flex flex-col justify-between items-center transition-all group hover:bg-white/[0.05] shadow-[0_0_20px_rgba(234,179,8,0.05)]">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-500 group-hover:scale-110 transition-transform animate-pulse">
                      <Star className="w-8 h-8 fill-yellow-500/20" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-yellow-400 transition-colors">奢華黃金盒</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      今日「省錢成功」獲得！<strong className="text-yellow-400">排除普通卡</strong>，高機率獲得史詩或傳奇！
                    </p>
                  </div>
                  <div className="w-full mt-6">
                    <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono uppercase">
                      <span>擁有券數:</span>
                      <span className="font-bold text-yellow-400">{premiumTickets} 張</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleStartDraw('PREMIUM', 1)}
                        disabled={premiumTickets <= 0}
                        className="w-full py-2 px-4 rounded-xl text-xs font-black uppercase text-yellow-950 tracking-wider bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-white/5 border border-transparent shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all flex items-center justify-center gap-1 cursor-pointer"
                        id="btn-draw-premium"
                      >
                        單抽 (消耗 1 券)
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStartDraw('PREMIUM', 10)}
                        disabled={premiumTickets < 10}
                        className="w-full py-2 px-4 rounded-xl text-xs font-black uppercase text-yellow-950 tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 disabled:bg-slate-900/40 disabled:text-slate-600 disabled:border-white/5 border border-transparent hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-1 cursor-pointer animate-pulse"
                        id="btn-draw-premium-10"
                      >
                        十連抽 ✨ (消耗 10 券)
                        <Sparkles className="w-4 h-4 text-rose-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. 破產預警盒 */}
                <div className="bg-white/[0.02] border border-white/10 hover:border-rose-500/50 rounded-2xl p-5 flex flex-col justify-between items-center transition-all group hover:bg-white/[0.05]">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-rose-400 transition-colors">破產預警盒</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      今日「預算超支」獲得。高機率開出令人哭笑不得的剁手與吃土卡。
                    </p>
                  </div>
                  <div className="w-full mt-6">
                    <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono uppercase">
                      <span>擁有券數:</span>
                      <span className="font-bold text-rose-400">{bankruptcyTickets} 張</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleStartDraw('BANKRUPTCY', 1)}
                        disabled={bankruptcyTickets <= 0}
                        className="w-full py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white disabled:bg-slate-900 disabled:text-slate-600 disabled:border-white/5 border border-transparent shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all flex items-center justify-center gap-1 cursor-pointer"
                        id="btn-draw-bankruptcy"
                      >
                        單抽 (消耗 1 券)
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStartDraw('BANKRUPTCY', 10)}
                        disabled={bankruptcyTickets < 10}
                        className="w-full py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white disabled:bg-slate-900/40 disabled:text-slate-600 disabled:border-white/5 border border-transparent hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-1 cursor-pointer"
                        id="btn-draw-bankruptcy-10"
                      >
                        十連抽 🔥 (消耗 10 券)
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STAGE 2: SHAKING ANIMATION */}
            {isOpening && selectedType && (
              <motion.div 
                key="opening-box"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center"
              >
                <motion.div 
                  className="w-44 h-44 bg-gradient-to-br from-fuchsia-600 to-pink-700 border-4 border-fuchsia-400/40 rounded-3xl flex items-center justify-center shadow-2xl relative"
                  animate={{ 
                    rotate: [0, -10, 10, -10, 10, -5, 5, -2, 2, 0],
                    scale: [1, 1.1, 1.1, 1.15, 1.15, 1.2, 1.2, 1.25, 1.25, 1.1],
                  }}
                  transition={{ 
                    duration: 1.6, 
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: "easeInOut"
                  }}
                >
                  {/* Glowing core and flying sparkles */}
                  <div className="absolute inset-2 bg-black/80 rounded-2xl flex items-center justify-center border border-white/10">
                    {selectedType === 'PREMIUM' ? (
                      <Star className="w-16 h-16 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                    ) : selectedType === 'BANKRUPTCY' ? (
                      <AlertTriangle className="w-16 h-16 text-rose-500 animate-pulse" />
                    ) : (
                      <Gift className="w-16 h-16 text-cyan-400 animate-bounce" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-fuchsia-500/20 blur-xl animate-pulse rounded-full" />
                </motion.div>
                <h3 className="text-sm font-black mt-8 text-white tracking-widest animate-pulse uppercase">
                  UNBOXING DECK // 正在解鎖盲盒卡盒中...
                </h3>
                <p className="text-[10px] text-fuchsia-400 uppercase font-mono mt-2 font-semibold tracking-wider">
                  // CALCULATING SACRED VALUE //
                </p>
              </motion.div>
            )}

            {/* 第三階段：揭曉卡片 */}
            {!isOpening && pulledCards.length > 0 && selectedType && (
              <motion.div 
                key="reveal-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center relative w-full"
              >
                {/* 卡牌後方的彩色炫光背影效果，顏色取決於卡包中的最高稀有度 */}
                <div className={`absolute w-80 h-80 rounded-full blur-3xl opacity-40 mix-blend-screen pointer-events-none -z-10 ${
                  getHighestRarity(pulledCards) === 'MYTHIC' ? 'bg-rose-500 animate-pulse shadow-[0_0_80px_rgba(244,63,94,0.7)]' :
                  getHighestRarity(pulledCards) === 'LEGENDARY' ? 'bg-amber-500 animate-pulse shadow-[0_0_50px_rgba(245,158,11,0.5)]' :
                  getHighestRarity(pulledCards) === 'EPIC' ? 'bg-fuchsia-500 animate-pulse' :
                  getHighestRarity(pulledCards) === 'RARE' ? 'bg-cyan-500' : 'bg-slate-500'
                }`} />

                {/* 翻開揭曉時的彩色粒子大噴發特效 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 overflow-visible">
                  {particles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                      animate={{ 
                        x: p.x, 
                        y: p.y, 
                        opacity: 0,
                        scale: [1, 1.5, 0],
                        rotate: Math.random() * 360
                      }}
                      transition={{ 
                        duration: 1.0 + Math.random() * 0.8, 
                        delay: p.delay,
                        ease: "easeOut" 
                      }}
                      className="absolute rounded-full"
                      style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        boxShadow: `0 0 12px ${p.color}, 0 0 4px #ffffff`,
                      }}
                    />
                  ))}
                </div>

                {/* 翻卡揭曉時的全螢幕彩光一閃（根據最高稀有度自適應） */}
                <AnimatePresence>
                  {showFlash && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`absolute inset-[-100px] pointer-events-none z-40 rounded-3xl ${
                        getHighestRarity(pulledCards) === 'MYTHIC' ? 'bg-rose-500/50 shadow-[0_0_120px_rgba(244,63,94,0.7)]' :
                        getHighestRarity(pulledCards) === 'LEGENDARY' ? 'bg-yellow-400/40 shadow-[0_0_100px_rgba(251,191,36,0.5)]' :
                        getHighestRarity(pulledCards) === 'EPIC' ? 'bg-fuchsia-400/40 shadow-[0_0_100px_rgba(232,121,249,0.5)]' :
                        getHighestRarity(pulledCards) === 'RARE' ? 'bg-cyan-400/30 shadow-[0_0_100px_rgba(34,211,238,0.5)]' : 'bg-white/20'
                      } backdrop-blur-[1px]`}
                    />
                  )}
                </AnimatePresence>

                {/* 渲染抽卡成果：支援「十連抽網格」或「單抽單卡」 */}
                {isMultiDraw ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-h-[460px] overflow-y-auto p-4 bg-white/[0.02] border border-white/5 rounded-3xl w-full justify-items-center">
                    {pulledCards.map((card, idx) => (
                      <motion.div
                        key={card.id + '-' + idx}
                        initial={{ opacity: 0, scale: 0.6, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.08, type: 'spring', stiffness: 100 }}
                      >
                        <CardDisplay 
                          card={card} 
                          size="sm" 
                          isFlipped={isFlipped} 
                          onFlip={handleReveal}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <CardDisplay 
                    card={pulledCard!} 
                    size="md" 
                    isFlipped={isFlipped} 
                    onFlip={handleReveal}
                  />
                )}

                {/* 控制按鈕區 */}
                <div className="mt-8 flex flex-col gap-3 items-center justify-center z-20 w-full max-w-xs">
                  {!isFlipped ? (
                    <button
                      onClick={handleReveal}
                      className="w-full py-3 px-8 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all flex items-center justify-center gap-2 animate-bounce cursor-pointer"
                      id="btn-reveal-flip"
                    >
                      <Sparkles className="w-5 h-5" />
                      {isMultiDraw ? 'FLIP ALL // 翻開十連抽揭曉' : 'FLIP CARD // 翻開揭曉'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleReset}
                        className="w-full py-2.5 px-6 rounded-full text-xs font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer text-center"
                        id="btn-draw-again"
                      >
                        DRAW AGAIN // 再抽一次
                      </button>
                      <button
                        onClick={() => {
                          handleReset();
                          onClose();
                        }}
                        className="w-full py-2.5 px-8 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all cursor-pointer text-center"
                        id="btn-keep-card"
                      >
                        LEAVE // 離開
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
