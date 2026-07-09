import React, { useState, useRef, useEffect } from 'react';
import { Player, ChatMessage, PullLog, PinnedCard, Card } from '../types';
import { Send, Users, MessageSquare, Flame, Trophy, Pin, Sparkles, Star, ShieldAlert } from 'lucide-react';
import { CardDisplay } from './CardDisplay';

interface LobbyRoomProps {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  onlineCount: number;
  players: Player[];
  messages: ChatMessage[];
  recentPulls: PullLog[];
  pinnedCards: PinnedCard[];
  onSendMessage: (msg: string) => void;
  onPinCard: (card: Card) => void;
}

export const LobbyRoom: React.FC<LobbyRoomProps> = ({
  playerId,
  playerName,
  playerAvatar,
  onlineCount,
  players,
  messages,
  recentPulls,
  pinnedCards,
  onSendMessage,
  onPinCard
}) => {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll chat room to the bottom when new message arrives
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'text-yellow-400 font-extrabold drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]';
      case 'EPIC': return 'text-purple-400 font-extrabold';
      case 'RARE': return 'text-blue-400 font-bold';
      default: return 'text-slate-300';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300';
      case 'EPIC': return 'bg-purple-500/15 border-purple-500/30 text-purple-300';
      case 'RARE': return 'bg-blue-500/15 border-blue-500/30 text-blue-300';
      default: return 'bg-slate-800/50 border-slate-700/30 text-slate-300';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full" id="lobby-room-container">
      
      {/* 1. TOP FULL-WIDTH: Real-Time Pull Stream (Marquee) */}
      <div className="lg:col-span-12 bg-white/[0.03] border border-white/10 rounded-2xl p-4 overflow-hidden shadow-md backdrop-blur-sm">
        <h4 className="text-[10px] text-fuchsia-400 font-mono tracking-widest uppercase mb-2 flex items-center gap-1.5 leading-none font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-fuchsia-400" style={{ animationDuration: '4s' }} />
          LIVE STREAM // 即時廣播大廳：最新卡片抽取動態
        </h4>
        <div className="relative flex items-center h-8">
          {recentPulls.length === 0 ? (
            <span className="text-xs text-slate-500">大廳目前很安靜，快去記帳抽盒來打破沈默吧！</span>
          ) : (
            <div className="flex gap-8 overflow-x-auto whitespace-nowrap scrollbar-none py-1 w-full animate-fadeIn">
              {recentPulls.map((pull) => (
                <div 
                  key={pull.id} 
                  className="inline-flex items-center gap-2 text-xs bg-slate-800/40 border border-slate-700/50 px-3 py-1 rounded-full shrink-0"
                >
                  <span className="text-base">{pull.playerAvatar}</span>
                  <span className="font-bold text-slate-200">{pull.playerName}</span>
                  <span className="text-slate-400">抽中了</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRarityBg(pull.rarity)}`}>
                    {pull.rarity === 'LEGENDARY' ? '👑' : pull.rarity === 'EPIC' ? '✨' : pull.rarity === 'RARE' ? '💎' : '☕'} {pull.cardName}
                  </span>
                  {pull.isCustom && (
                    <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 rounded border border-rose-500/30 font-bold">
                      AI 定製
                    </span>
                  )}
                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(pull.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. LEFT SECTION: Chat Room (6 cols on lg) */}
      <div className="lg:col-span-4 flex flex-col h-[520px] bg-white/[0.03] border border-white/10 rounded-2xl shadow-md overflow-hidden backdrop-blur-sm">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-fuchsia-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">LOBBY CHAT // 大廳聊天室</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{onlineCount} 人在線</span>
          </div>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 min-h-0 bg-black/20">
          {messages.map((msg) => {
            if (msg.system) {
              return (
                <div key={msg.id} className="text-center py-1 select-none animate-fadeIn">
                  <span className="inline-block bg-white/[0.04] text-[10px] text-slate-400 px-3 py-1 rounded-full border border-white/5 max-w-[90%] break-words leading-relaxed font-medium">
                    {msg.playerAvatar} {msg.message}
                  </span>
                </div>
              );
            }

            const isSelf = msg.playerId === playerId;
            return (
              <div 
                key={msg.id} 
                className={`flex gap-2 w-full max-w-[85%] animate-fadeIn ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 select-none text-base">
                  {msg.playerAvatar}
                </div>
                
                {/* Text Block */}
                <div>
                  <div className={`flex items-baseline gap-1.5 ${isSelf ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-bold text-slate-300">
                      {msg.playerName}
                    </span>
                    <span className="text-[8px] text-slate-600 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`mt-1 p-2.5 rounded-xl text-xs break-words leading-relaxed ${
                    isSelf 
                      ? 'bg-fuchsia-600 text-white rounded-tr-none shadow-[0_0_12px_rgba(217,70,239,0.25)]' 
                      : 'bg-white/[0.04] text-slate-200 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendChat} className="p-3 bg-white/[0.01] border-t border-white/10 flex gap-2 shrink-0">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="說點什麼..."
            maxLength={100}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-fuchsia-500/50"
            id="input-chat-msg"
          />
          <button
            type="submit"
            className="p-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl transition-all shadow-[0_0_12px_rgba(217,70,239,0.3)] cursor-pointer"
            id="btn-send-chat"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 3. MID SECTION: Global Showoff Gallery Wall (5 cols on lg) */}
      <div className="lg:col-span-5 flex flex-col h-[520px] bg-white/[0.03] border border-white/10 rounded-2xl shadow-md overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-white/10 bg-white/[0.01] flex items-center gap-2 shrink-0">
          <Pin className="w-5 h-5 text-fuchsia-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white">PINNED SHOWCASE // 展示牆</h3>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-black/20 flex flex-col gap-4">
          {pinnedCards.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-xl my-4">
              <Star className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
              <p className="text-xs text-slate-400 font-bold">目前展示牆上空空如也！</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                去「我的卡包」中，滑鼠移到卡片上，點擊右上角的 <strong className="text-fuchsia-400">Pin</strong> 按鈕來向全球玩家炫耀你的稀有收穫！
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {pinnedCards.map((pinned) => (
                <div 
                  key={pinned.id} 
                  className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:bg-white/5 transition-all shadow-md hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5 mb-2 text-[10px] text-slate-400 select-none">
                    <span className="text-sm">{pinned.playerAvatar}</span>
                    <span className="font-bold text-slate-200 truncate max-w-[80px]">{pinned.playerName}</span>
                    <span className="shrink-0 text-[8px] uppercase tracking-wider text-fuchsia-400 font-bold">// PIN</span>
                  </div>
                  
                  {/* Miniature Card presentation */}
                  <div className="flex-1 flex flex-col justify-center text-center py-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full inline-block mx-auto font-black uppercase mb-1.5 ${getRarityBg(pinned.card.rarity)}`}>
                      {pinned.card.rarity}
                    </span>
                    <h4 className={`text-xs font-black truncate ${getRarityColor(pinned.card.rarity)}`}>
                      {pinned.card.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 px-1">
                      {pinned.card.description}
                    </p>
                    {pinned.card.isCustom && (
                      <span className="text-[8px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.5 rounded mt-1.5 inline-block mx-auto font-bold animate-pulse">
                        AI 定製卡 🤖
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. RIGHT SECTION: Online Saving Leaderboard (3 cols on lg) */}
      <div className="lg:col-span-3 flex flex-col h-[520px] bg-white/[0.03] border border-white/10 rounded-2xl shadow-md overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-white/10 bg-white/[0.01] flex items-center gap-2 shrink-0">
          <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white">LEADERBOARD // 榮光榜</h3>
        </div>

        <div className="flex-1 p-3 overflow-y-auto bg-black/20 flex flex-col gap-2">
          {players.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-center p-4">
              <span className="text-xs text-slate-500">尚無玩家紀錄</span>
            </div>
          ) : (
            [...players]
              .sort((a, b) => {
                const aSaved = a.budget - a.spending;
                const bSaved = b.budget - b.spending;
                return bSaved - aSaved;
              })
              .map((p, index) => {
                const savedAmount = p.budget - p.spending;
                const isOver = p.spending > p.budget;
                
                let rankBadge = `${index + 1}`;
                if (index === 0) rankBadge = '🥇';
                else if (index === 1) rankBadge = '🥈';
                else if (index === 2) rankBadge = '🥉';

                return (
                  <div 
                    key={p.id}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                      p.id === playerId 
                        ? 'bg-fuchsia-500/10 border-fuchsia-500/30 shadow-[0_0_12px_rgba(217,70,239,0.15)]' 
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm font-mono font-bold w-5 text-center shrink-0">{rankBadge}</span>
                      <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 text-base">
                        {p.avatar}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-200 leading-none truncate">
                          {p.name}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-1 font-mono">
                          PULLS: {p.savedCount || 0}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-mono font-bold block ${isOver ? 'text-rose-400' : 'text-cyan-400'}`}>
                        {isOver ? `超支 $${p.spending - p.budget}` : `省下 $${savedAmount}`}
                      </span>
                      <span className="text-[8px] text-slate-600 block mt-0.5 font-mono">
                        EXP: ${p.spending}
                      </span>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

    </div>
  );
};
