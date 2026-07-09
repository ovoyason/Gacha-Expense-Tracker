import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../types';
import { Sparkles, Crown, Award, Shield, Flame, Wallet, HelpCircle, CupSoda, Trash2, Pin, Calendar, HelpCircle as QuestionIcon, AlertTriangle } from 'lucide-react';

interface CardDisplayProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  isFlipped?: boolean;
  onFlip?: () => void;
  canPin?: boolean;
  onPin?: () => void;
  onDelete?: () => void;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  size = 'md',
  isFlipped = true,
  onFlip,
  canPin = false,
  onPin,
  onDelete
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; //x position within the element
    const y = e.clientY - rect.top;  //y position within the element
    setMousePos({ x, y });
  };

  const getRarityConfig = (rarity: typeof card.rarity) => {
    switch (rarity) {
      case 'MYTHIC':
        return {
          bg: 'bg-gradient-to-br from-rose-950 via-red-600 to-amber-500 text-amber-50 border-amber-400 shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-pulse',
          glow: 'shadow-[0_0_35px_rgba(244,63,94,0.8)]',
          badgeBg: 'bg-red-950/60 text-amber-300 border border-amber-400/40 animate-pulse font-black',
          textMuted: 'text-red-200/90',
          rarityLabel: '榮耀神話 🌟',
          icon: <Flame className="w-8 h-8 text-amber-300 animate-bounce" />
        };
      case 'LEGENDARY':
        return {
          bg: 'bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 text-yellow-950 border-amber-300 shadow-[0_0_20px_rgba(234,179,8,0.4)]',
          glow: 'shadow-[0_0_25px_rgba(234,179,8,0.6)]',
          badgeBg: 'bg-amber-950/40 text-amber-100 border border-amber-300/30',
          textMuted: 'text-yellow-900',
          rarityLabel: '閃耀傳奇 👑',
          icon: <Crown className="w-8 h-8 text-amber-100 animate-pulse" />
        };
      case 'EPIC':
        return {
          bg: 'bg-gradient-to-br from-purple-700 via-fuchsia-600 to-indigo-800 text-purple-50 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]',
          glow: 'shadow-[0_0_25px_rgba(168,85,247,0.6)]',
          badgeBg: 'bg-purple-950/40 text-purple-100 border border-purple-400/30',
          textMuted: 'text-purple-200/80',
          rarityLabel: '史詩金卡 ✨',
          icon: <Award className="w-8 h-8 text-purple-100 animate-pulse" />
        };
      case 'RARE':
        return {
          bg: 'bg-gradient-to-br from-blue-700 via-sky-600 to-indigo-800 text-blue-50 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
          badgeBg: 'bg-blue-950/40 text-blue-100 border border-blue-400/30',
          textMuted: 'text-blue-200/80',
          rarityLabel: '稀有銀卡 💎',
          icon: <Shield className="w-8 h-8 text-blue-100" />
        };
      case 'COMMON':
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-800 via-zinc-700 to-slate-900 text-slate-100 border-slate-600 shadow-md',
          glow: 'shadow-none',
          badgeBg: 'bg-slate-950/40 text-slate-300 border border-slate-600/30',
          textMuted: 'text-slate-400',
          rarityLabel: '普通卡片 ☕',
          icon: <Wallet className="w-8 h-8 text-slate-300" />
        };
    }
  };

  const config = getRarityConfig(card.rarity);

  const getIllustration = (imageType: string, rarity: typeof card.rarity) => {
    // Return a nice stylized vector icon with glowing backdrop
    const classes = "w-14 h-14 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] text-white";
    switch (imageType) {
      case 'mythic-deity':
        return <Sparkles className="w-14 h-14 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] text-yellow-200 animate-spin" style={{ animationDuration: '8s' }} />;
      case 'mythic-monument':
        return <Crown className="w-14 h-14 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)] text-amber-300 animate-pulse" />;
      case 'gold-crown':
        return <Crown className={classes} />;
      case 'gold-graph':
        return <Flame className={classes} />;
      case 'gold-deity':
        return <Sparkles className={classes} />;
      case 'purple-scroll':
        return <Award className={classes} />;
      case 'purple-crosshair':
        return <Flame className={classes} />;
      case 'purple-monk':
        return <Shield className={classes} />;
      case 'blue-shield':
        return <Shield className={classes} />;
      case 'blue-calculator':
        return <Wallet className={classes} />;
      case 'blue-bento':
        return <Sparkles className={classes} />;
      case 'blue-leaf':
        return <Shield className={classes} />;
      case 'gray-cup':
        return <CupSoda className={classes} />;
      case 'gray-bike':
        return <Wallet className={classes} />;
      case 'gray-scissors':
        return <Award className={classes} />;
      case 'gray-warning':
        return <AlertTriangle className={classes} />;
      case 'gray-dirt':
        return <QuestionIcon className={classes} />;
      case 'gray-question':
      default:
        return <QuestionIcon className={classes} />;
    }
  };

  const dimensions = {
    sm: 'w-48 h-72 text-sm',
    md: 'w-64 h-96 text-base',
    lg: 'w-80 h-[480px] text-lg'
  };

  // 3D Tilting rotation effect calculations on hover
  const tiltStyle = isHovered && card.rarity !== 'COMMON' ? {
    rotateX: (mousePos.y - 150) / -10, // Adjust tilt angle
    rotateY: (mousePos.x - 100) / 10,
    transition: 'transform 0.05s ease-out'
  } : {
    rotateX: 0,
    rotateY: 0,
    transition: 'transform 0.4s ease-out'
  };

  const customFoilStyle = isHovered && card.rarity === 'MYTHIC' ? {
    background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,244,220,0.5) 0%, rgba(244,63,94,0.25) 45%, rgba(255,255,255,0) 70%)`,
    pointerEvents: 'none' as const
  } : isHovered && card.rarity === 'LEGENDARY' ? {
    background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 60%)`,
    pointerEvents: 'none' as const
  } : isHovered && card.rarity === 'EPIC' ? {
    background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(216,180,254,0.35) 0%, rgba(255,255,255,0) 50%)`,
    pointerEvents: 'none' as const
  } : undefined;

  return (
    <div 
      className={`perspective-1000 relative select-none ${dimensions[size]}`}
      id={`card-container-${card.id}`}
    >
      <motion.div
        className="w-full h-full transform-style-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 0 : 180 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        onClick={() => {
          if (!isFlipped && onFlip) onFlip();
        }}
        style={{ ...tiltStyle }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* CARD FRONT (Flipped = true) */}
        <div 
          className={`absolute inset-0 backface-hidden w-full h-full rounded-2xl border-4 p-4 flex flex-col justify-between overflow-hidden ${config.bg} foil-shine group`}
          id={`card-front-${card.id}`}
          style={{
            visibility: isFlipped ? 'visible' : 'hidden',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {/* Custom Foil Glow overlay */}
          {customFoilStyle && (
            <div className="absolute inset-0 mix-blend-color-dodge z-10" style={customFoilStyle} />
          )}

          {/* Card Top: Creator / IsCustom and Rarity Badge */}
          <div className="flex justify-between items-center z-10">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${config.badgeBg}`}>
              {config.rarityLabel}
            </span>
            {card.isCustom ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-950/60 text-rose-200 border border-rose-500/30 animate-pulse">
                AI 專屬 🤖
              </span>
            ) : (
              <span className="text-[10px] opacity-70 font-mono tracking-tighter">
                #{card.id.split('-').pop()}
              </span>
            )}
          </div>

          {/* Card Mid: Illustration Stage */}
          <div className="flex-1 flex flex-col items-center justify-center py-4 z-10">
            <div className={`relative p-5 rounded-full bg-black/20 border border-white/10 ${(card.rarity === 'MYTHIC' || card.rarity === 'LEGENDARY') ? 'animate-float' : ''}`}>
              {/* Outer neon halo for epic or legendary */}
              {(card.rarity === 'MYTHIC' || card.rarity === 'LEGENDARY' || card.rarity === 'EPIC') && (
                <div className="absolute inset-0 rounded-full bg-white/10 blur-xl animate-pulse" />
              )}
              {getIllustration(card.imageType, card.rarity)}
            </div>
            
            <h3 className="font-display font-extrabold tracking-wide mt-4 text-center leading-none text-xl sm:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {card.name}
            </h3>
            {card.creator && (
              <p className="text-[10px] mt-1 text-center font-semibold uppercase opacity-75">
                by {card.creator}
              </p>
            )}
          </div>

          {/* Card Bottom: Description & Action overlays */}
          <div className="rounded-xl bg-black/25 border border-white/5 p-3 flex flex-col justify-center min-h-[72px] z-10 backdrop-blur-xs">
            <p className="text-xs font-sans font-medium text-center leading-relaxed text-white">
              {card.description}
            </p>
          </div>

          {/* Small Date Indicator at very bottom */}
          {card.createdAt && (
            <div className="text-[9px] text-center opacity-60 font-mono flex items-center justify-center gap-1 mt-1 z-10">
              <Calendar className="w-2.5 h-2.5" />
              {new Date(card.createdAt).toLocaleDateString()}
            </div>
          )}

          {/* Hover Overlay Buttons if card is flipped */}
          {isFlipped && (canPin || onDelete) && (
            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-20 bg-black/90 p-1.5 rounded-lg border border-white/10">
              {canPin && onPin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin();
                  }}
                  className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-white/10 rounded transition-colors cursor-pointer"
                  title="展示到大廳公布欄"
                  id={`btn-pin-${card.id}`}
                >
                  <Pin className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`確定要刪除卡片 [${card.name}] 嗎？`)) {
                      onDelete();
                    }
                  }}
                  className="p-1 text-rose-400 hover:text-rose-300 hover:bg-white/10 rounded transition-colors cursor-pointer"
                  title="回收此卡片"
                  id={`btn-delete-${card.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* CARD BACK (Flipped = false) */}
        <div 
          className="absolute inset-0 backface-hidden w-full h-full rounded-2xl bg-gradient-to-br from-[#050608] via-zinc-900 to-[#050608] text-slate-200 border-4 border-fuchsia-500/40 shadow-[0_0_20px_rgba(217,70,239,0.2)] p-6 flex flex-col justify-between items-center rotate-y-180"
          id={`card-back-${card.id}`}
        >
          {/* Glowing center design */}
          <div className="w-full flex justify-between items-center border-b border-fuchsia-500/20 pb-2 text-[10px] font-mono tracking-widest text-fuchsia-400">
            <span>GACHA GAME</span>
            <span>MYSTERY BOX</span>
          </div>

          <div className="relative flex flex-col items-center justify-center flex-1 my-4">
            <div className="absolute w-28 h-28 rounded-full bg-fuchsia-500/5 blur-2xl animate-pulse" />
            <div className="w-20 h-20 rounded-2xl border-2 border-fuchsia-500/30 flex items-center justify-center bg-fuchsia-950/20 text-fuchsia-400 animate-float shadow-inner">
              <Sparkles className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <p className="text-[10px] font-mono font-black text-fuchsia-300 mt-5 tracking-widest animate-pulse uppercase">
              TAP TO UNVEIL // 點擊翻開卡盒
            </p>
          </div>

          <div className="w-full text-center border-t border-fuchsia-500/20 pt-2 text-[9px] text-fuchsia-500/50 font-mono uppercase tracking-wider">
            FORTUNE & EXPENSE // GACHA 1.0
          </div>
        </div>
      </motion.div>
    </div>
  );
};
