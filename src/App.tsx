import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, ExpenseItem, Player, ChatMessage, PullLog, PinnedCard } from './types';
import { STANDARD_CARDS, getRandomCard } from './cards';
import { CardDisplay } from './components/CardDisplay';
import { GachaModal } from './components/GachaModal';
import { ExpenseForm } from './components/ExpenseForm';
import { LobbyRoom } from './components/LobbyRoom';
import { Wallet, Sparkles, Trophy, Users, Heart, Coins, ArrowRight, User, Settings, Check, RefreshCw, Star, X } from 'lucide-react';

const CUTE_NAMES = [
  '精算刺蝟', '省錢海獺', '暴躁小羊', '理財熊貓', '打折無尾熊', 
  '記帳小熊', '發財柴犬', '勤儉蜜獾', '富豪金絲猴', '吃土小香豬'
];

const EMOTE_AVATARS = ['🦦', '🦔', '🐑', '🐼', '🐨', '🐻', '🐕', '🦡', '🐒', '🐷'];

export default function App() {
  // ==========================================
  // 🎮 CORE STATE ENGINE & ARCHITECTURE COMMENTS
  // ==========================================
  // The application follows a "Cyber-Luxury Arcade" design language.
  // Colors: Jet black background (#050608), Neon Fuchsia glow accents (#d946ef), 
  // and Electric Cyan highlights (#06b6d4) with translucent borders.
  // State elements below power the core mechanics: Profile, Budget/Tickets, Gacha, and SSE.

  // --- Profile State ---
  // Tracks local player session identifier, customizable name and avatar emoji.
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerAvatar, setPlayerAvatar] = useState<string>('🦦');
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);

  // --- Expenses & Budget State ---
  // Core financial ledger. Tracks current budget limit and daily recorded expenses list.
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [budget, setBudget] = useState<number>(150);

  // --- Tickets State ---
  // standard: Earned by simply logging a purchase (+1 standard ticket per log).
  // premium: Earned when the player is currently under-budget (+1 premium ticket).
  // bankruptcy: Earned when the player is currently over-budget (+1 bankruptcy ticket).
  const [standardTickets, setStandardTickets] = useState<number>(3);
  const [premiumTickets, setPremiumTickets] = useState<number>(1);
  const [bankruptcyTickets, setBankruptcyTickets] = useState<number>(0);

  // --- Collection State ---
  // The player's private inventory of pulled/collected trading cards (includes standard & Gemini cards).
  const [cardsCollection, setCardsCollection] = useState<Card[]>([]);

  // --- Navigation & UI State ---
  // Switches views between Tracker & Exchange, Live Lobby, and Card Binder.
  const [activeTab, setActiveTab] = useState<'tracker' | 'lobby' | 'binder'>('tracker');
  const [isGachaOpen, setIsGachaOpen] = useState<boolean>(false);

  // --- Gemini AI State ---
  // Holds current wallet review text, generated card title, rarity, and custom tip checklists.
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [geminiCritique, setGeminiCritique] = useState<{
    critique: string;
    title: string;
    rarity: string;
    description: string;
    savingTips: string[];
  } | null>(null);

  // --- Multiplayer Lobby State ---
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [lobbyPlayers, setLobbyPlayers] = useState<Player[]>([]);
  const [lobbyMessages, setLobbyMessages] = useState<ChatMessage[]>([]);
  const [recentPulls, setRecentPulls] = useState<PullLog[]>([]);
  const [pinnedCards, setPinnedCards] = useState<PinnedCard[]>([]);

  const sseRef = useRef<EventSource | null>(null);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    // Player ID
    let pid = localStorage.getItem('gacha_player_id');
    if (!pid) {
      pid = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('gacha_player_id', pid);
    }
    setPlayerId(pid);

    // Player Name
    const pName = localStorage.getItem('gacha_player_name') || CUTE_NAMES[Math.floor(Math.random() * CUTE_NAMES.length)];
    setPlayerName(pName);

    // Player Avatar
    const pAvatar = localStorage.getItem('gacha_player_avatar') || EMOTE_AVATARS[Math.floor(Math.random() * EMOTE_AVATARS.length)];
    setPlayerAvatar(pAvatar);

    // Expenses
    const savedExpenses = localStorage.getItem('gacha_expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }

    // Budget
    const savedBudget = localStorage.getItem('gacha_budget');
    if (savedBudget) {
      setBudget(Number(savedBudget));
    }

    // Tickets
    const savedStandard = localStorage.getItem('gacha_tickets_standard');
    const savedPremium = localStorage.getItem('gacha_tickets_premium');
    const savedBankruptcy = localStorage.getItem('gacha_tickets_bankruptcy');
    if (savedStandard) setStandardTickets(Number(savedStandard));
    if (savedPremium) setPremiumTickets(Number(savedPremium));
    if (savedBankruptcy) setBankruptcyTickets(Number(savedBankruptcy));

    // Cards Collection
    const savedCards = localStorage.getItem('gacha_collection');
    if (savedCards) {
      setCardsCollection(JSON.parse(savedCards));
    } else {
      // Give initial starter cards
      const starter: Card[] = [
        {
          id: 'starter-1',
          name: '記帳初心者',
          rarity: 'COMMON',
          description: '恭喜你邁出了理財的第一步！這是你冒險旅程的起點。',
          imageType: 'gray-question',
          createdAt: Date.now()
        }
      ];
      setCardsCollection(starter);
      localStorage.setItem('gacha_collection', JSON.stringify(starter));
    }
  }, []);

  // 2. Persist Local Data to LocalStorage on changes
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem('gacha_expenses', JSON.stringify(expenses));
    } else {
      localStorage.removeItem('gacha_expenses');
    }
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('gacha_budget', budget.toString());
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('gacha_tickets_standard', standardTickets.toString());
    localStorage.setItem('gacha_tickets_premium', premiumTickets.toString());
    localStorage.setItem('gacha_tickets_bankruptcy', bankruptcyTickets.toString());
  }, [standardTickets, premiumTickets, bankruptcyTickets]);

  useEffect(() => {
    if (cardsCollection.length > 0) {
      localStorage.setItem('gacha_collection', JSON.stringify(cardsCollection));
    } else {
      localStorage.removeItem('gacha_collection');
    }
  }, [cardsCollection]);

  // 3. Setup Server-Sent Events (SSE) for Multiplayer Sync
  useEffect(() => {
    if (!playerId || !playerName) return;

    const joinLobby = async () => {
      try {
        const totalSpending = expenses.reduce((sum, item) => sum + item.amount, 0);
        await fetch('/api/lobby/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: playerId,
            name: playerName,
            avatar: playerAvatar,
            budget: budget,
            spending: totalSpending,
            savedCount: cardsCollection.length
          })
        });
      } catch (err) {
        console.error('Lobby join error:', err);
      }
    };

    joinLobby();

    // SSE connection
    const sse = new EventSource('/api/lobby/stream');
    sseRef.current = sse;

    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { event: eventName, data } = payload;

        if (eventName === 'init' || eventName === 'lobby:update') {
          setOnlineCount(data.onlineCount);
          setLobbyPlayers(data.players);
          setLobbyMessages(data.messages);
          setRecentPulls(data.recentPulls);
          setPinnedCards(data.pinnedCards);
        } else if (eventName === 'chat:message') {
          setLobbyMessages((prev) => {
            const list = [...prev, data];
            return list.slice(-50);
          });
        } else if (eventName === 'gacha:pull') {
          setRecentPulls((prev) => {
            const list = [data, ...prev];
            return list.slice(-30);
          });
        } else if (eventName === 'card:pinned') {
          setPinnedCards((prev) => {
            const filtered = prev.filter(c => c.playerName !== data.playerName);
            const list = [data, ...filtered];
            return list.slice(-20);
          });
        }
      } catch (err) {
        console.error('SSE parsing error:', err);
      }
    };

    sse.onerror = () => {
      console.warn('SSE disconnected, reconnecting...');
    };

    // Heartbeat every 15 seconds to keep session alive and sync leaderboards
    const heartbeatTimer = setInterval(async () => {
      try {
        const totalSpending = expenses.reduce((sum, item) => sum + item.amount, 0);
        await fetch('/api/lobby/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: playerId,
            budget: budget,
            spending: totalSpending,
            savedCount: cardsCollection.length
          })
        });
      } catch (err) {}
    }, 15000);

    return () => {
      clearInterval(heartbeatTimer);
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, [playerId, playerName, playerAvatar, expenses, budget, cardsCollection.length]);

  // --- Handlers ---

  // Profile Save
  const handleSaveProfile = (name: string, avatar: string) => {
    if (!name.trim()) return;
    setPlayerName(name);
    setPlayerAvatar(avatar);
    localStorage.setItem('gacha_player_name', name);
    localStorage.setItem('gacha_player_avatar', avatar);
    setIsEditingProfile(false);
  };

  // Add Expense
  const handleAddExpense = (amount: number, category: string, description: string) => {
    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      amount,
      category,
      description,
      date: new Date().toLocaleDateString()
    };
    setExpenses((prev) => [...prev, newItem]);
    // Award 1 standard ticket immediately for keeping logs
    setStandardTickets((prev) => prev + 1);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    // Deduct standard ticket
    setStandardTickets((prev) => Math.max(0, prev - 1));
  };

  // Clear Expenses today & Close out the ledger ritual
  const handleClearTodayAndResolve = () => {
    const totalSpending = expenses.reduce((sum, item) => sum + item.amount, 0);
    const isOver = totalSpending > budget;

    // Award tickets on day wrap up
    if (totalSpending > 0) {
      if (isOver) {
        setBankruptcyTickets((prev) => prev + 1);
      } else {
        setPremiumTickets((prev) => prev + 1);
      }
    }

    setExpenses([]);
    setGeminiCritique(null);
  };

  // Chat Submission
  const handleSendMessage = async (message: string) => {
    try {
      await fetch('/api/lobby/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, message })
      });
    } catch (err) {
      console.error('Chat send error:', err);
    }
  };

  // Spend Gacha ticket
  const handleSpendTicket = (type: 'STANDARD' | 'PREMIUM' | 'BANKRUPTCY'): Card | null => {
    if (type === 'STANDARD' && standardTickets > 0) {
      setStandardTickets((prev) => prev - 1);
      return getRandomCard('STANDARD');
    } else if (type === 'PREMIUM' && premiumTickets > 0) {
      setPremiumTickets((prev) => prev - 1);
      return getRandomCard('PREMIUM');
    } else if (type === 'BANKRUPTCY' && bankruptcyTickets > 0) {
      setBankruptcyTickets((prev) => prev - 1);
      return getRandomCard('BANKRUPTCY');
    }
    return null;
  };

  // Add drawn card to personal collection binder
  const handleAddCardToCollection = async (card: Card) => {
    const decoratedCard = {
      ...card,
      createdAt: Date.now()
    };
    setCardsCollection((prev) => [decoratedCard, ...prev]);

    // Broadcast pull to lobby
    try {
      await fetch('/api/lobby/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          cardName: card.name,
          rarity: card.rarity,
          isCustom: !!card.isCustom
        })
      });
    } catch (err) {}
  };

  // Pin a card to lobby showcasing board
  const handlePinCardToLobby = async (card: Card) => {
    try {
      await fetch('/api/lobby/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, card })
      });
      alert(`成功將卡片 [${card.name}] 展示在公開展示牆上！`);
    } catch (err) {
      alert('展示失敗，請稍後重試');
    }
  };

  // Delete a card from personal collection
  const handleDeleteCardFromCollection = (id: string) => {
    setCardsCollection((prev) => prev.filter(c => c.id !== id));
  };

  // ==========================================
  // 🧠 GEMINI AI REASSESSMENT & CUSTOM MINTING ENGINE
  // ==========================================
  // Calls the server-side Gemini 3.5 proxy endpoint with current ledger state.
  // The AI evaluates the budget vs. purchases, produces an analytical critique,
  // and dynamically generates a personalized card payload.
  // We then "mint" this dynamically created card directly into the player's Collection Binder.
  const handleGeminiAnalyze = async () => {
    if (expenses.length === 0) return;
    setIsAnalyzing(true);
    setGeminiCritique(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          expenses,
          playerName
        })
      });
      const data = await response.json();
      if (response.ok) {
        setGeminiCritique(data);
        
        // Assemble a custom virtual Card based on Gemini's assessment
        const customCard: Card = {
          id: `ai-${Date.now()}`,
          name: data.title,
          rarity: data.rarity as any,
          description: data.description,
          imageType: 'gold-deity', // Represents special AI-generated radiant glow
          isCustom: true,
          creator: '富豪與乞丐守護神',
          createdAt: Date.now()
        };
        
        // Add the custom AI card to player collection, which automatically uploads the event
        handleAddCardToCollection(customCard);
      } else {
        alert(data.details || data.error || 'AI 診斷分析失敗');
      }
    } catch (err) {
      console.error('Gemini call error:', err);
      alert('呼叫 AI 服務時發生錯誤，請稍後重試');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate unique collection stats
  const collectionStats = {
    total: cardsCollection.length,
    unique: new Set(cardsCollection.map((c) => c.name)).size,
    mythic: cardsCollection.filter((c) => c.rarity === 'MYTHIC').length,
    legendary: cardsCollection.filter((c) => c.rarity === 'LEGENDARY').length,
    epic: cardsCollection.filter((c) => c.rarity === 'EPIC').length,
    rare: cardsCollection.filter((c) => c.rarity === 'RARE').length,
    common: cardsCollection.filter((c) => c.rarity === 'COMMON').length
  };

  const totalTodaySpending = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 flex flex-col font-sans selection:bg-fuchsia-500/30 selection:text-white pb-10 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/15 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* 1. TOP HEADER BRAND BAR */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-fuchsia-600/20 ring-2 ring-white/20">
              🎰
            </div>
            <div>
              <h1 className="text-lg font-display font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                富豪與乞丐 <span className="text-xs text-fuchsia-400 font-mono font-normal">BLIND BOX EXPENSE</span>
              </h1>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                // 多人線上盲盒記帳小遊戲・邊省邊抽，衝刺理財王座
              </p>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 select-none backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tracker' 
                  ? 'bg-fuchsia-600 text-white font-extrabold shadow-[0_0_15px_rgba(217,70,239,0.35)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              id="tab-tracker"
            >
              <Wallet className="w-3.5 h-3.5" />
              記帳抽盲盒
            </button>
            <button
              onClick={() => setActiveTab('lobby')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'lobby' 
                  ? 'bg-fuchsia-600 text-white font-extrabold shadow-[0_0_15px_rgba(217,70,239,0.35)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              id="tab-lobby"
            >
              <Users className="w-3.5 h-3.5" />
              線上盲盒大廳
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-white font-mono font-bold text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center scale-90 shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                {onlineCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('binder')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'binder' 
                  ? 'bg-fuchsia-600 text-white font-extrabold shadow-[0_0_15px_rgba(217,70,239,0.35)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              id="tab-binder"
            >
              <Trophy className="w-3.5 h-3.5" />
              我的卡包 ({cardsCollection.length})
            </button>
          </div>

          {/* User Profile display widget */}
          <div className="flex items-center gap-3">
            {isEditingProfile ? (
              <ProfileEditor 
                name={playerName} 
                avatar={playerAvatar} 
                onSave={handleSaveProfile} 
                onCancel={() => setIsEditingProfile(false)} 
              />
            ) : (
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3.5 py-1.5 rounded-xl backdrop-blur-sm shadow-sm">
                <div className="text-xl shrink-0 select-none">{playerAvatar}</div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white max-w-[80px] truncate leading-none">
                    {playerName}
                  </p>
                  <p className="text-[9px] text-fuchsia-400 font-mono mt-1 font-semibold uppercase tracking-wider">
                    // ONLINE
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="p-1 text-slate-500 hover:text-fuchsia-400 transition-colors cursor-pointer"
                  title="修改暱稱頭像"
                  id="btn-edit-profile"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 2. MAIN BODY WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 flex-1 w-full flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: TRACKER & GACHA STAGE */}
          {activeTab === 'tracker' && (
            <motion.div
              key="tracker-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Quick Actions & Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.03] border border-white/10 p-5 rounded-2xl backdrop-blur-sm shadow-md">
                <div>
                  <h2 className="text-lg font-display font-extrabold text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
                    🛒 理財記帳 & 抽取券兌換
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    記帳每一筆開銷都可得 1 張「標準幸運券」。守住預算今日還能獲得「黃金盲盒券」！
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsGachaOpen(true)}
                    className="py-2.5 px-5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white rounded-xl text-xs font-black shadow-lg shadow-fuchsia-600/20 hover:shadow-fuchsia-600/30 hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
                    id="btn-open-gacha-modal"
                  >
                    🎮 進入理財盲盒抽卡機
                  </button>
                  {expenses.length > 0 && (
                    <button
                      onClick={() => {
                        const word = totalTodaySpending > budget ? '超支獲得破產券' : '省錢獲得黃金券';
                        if (confirm(`確定結算今天嗎？結算後將清空今日帳本並發放盲盒券（今日${word}）。`)) {
                          handleClearTodayAndResolve();
                          alert('今日結算完成！相應盲盒券已存入你的卡包。');
                        }
                      }}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1"
                      id="btn-resolve-today"
                    >
                      ✅ 結算今日並領券
                    </button>
                  )}
                </div>
              </div>

              {/* Expense Ledger tracker & Form Row */}
              <ExpenseForm
                expenses={expenses}
                budget={budget}
                onSetBudget={setBudget}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                onClearToday={() => {
                  setExpenses([]);
                  setGeminiCritique(null);
                }}
                onGeminiAnalyze={handleGeminiAnalyze}
                isAnalyzing={isAnalyzing}
                geminiCritique={geminiCritique}
                ticketsEarned={{
                  standard: standardTickets,
                  premium: premiumTickets,
                  bankruptcy: bankruptcyTickets
                }}
              />
            </motion.div>
          )}

          {/* TAB 2: MULTIPLAYER LOBBY */}
          {activeTab === 'lobby' && (
            <motion.div
              key="lobby-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <LobbyRoom
                playerId={playerId}
                playerName={playerName}
                playerAvatar={playerAvatar}
                onlineCount={onlineCount}
                players={lobbyPlayers}
                messages={lobbyMessages}
                recentPulls={recentPulls}
                pinnedCards={pinnedCards}
                onSendMessage={handleSendMessage}
                onPinCard={handlePinCardToLobby}
              />
            </motion.div>
          )}

          {/* TAB 3: BINDER COLLECTION */}
          {activeTab === 'binder' && (
            <motion.div
              key="binder-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Binder Stats Header */}
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-3 bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl">
                <div className="text-center p-2 rounded-xl bg-slate-800/20 col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">總收藏張數</p>
                  <p className="text-xl font-display font-black text-white mt-1">{collectionStats.total} <span className="text-xs text-slate-500 font-normal">張</span></p>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-800/20 col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">卡種解鎖度</p>
                  <p className="text-xl font-display font-black text-indigo-400 mt-1">
                    {collectionStats.unique} <span className="text-xs text-slate-500 font-normal">/ {STANDARD_CARDS.length}</span>
                  </p>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-800/20">
                  <p className="text-[10px] text-rose-500 font-bold uppercase">榮耀神話 (M)</p>
                  <p className="text-xl font-display font-black text-rose-500 mt-1">{collectionStats.mythic} <span className="text-xs text-slate-500 font-normal">張</span></p>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-800/20">
                  <p className="text-[10px] text-amber-500 font-bold uppercase">閃耀傳奇 (L)</p>
                  <p className="text-xl font-display font-black text-amber-500 mt-1">{collectionStats.legendary} <span className="text-xs text-slate-500 font-normal">張</span></p>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-800/20">
                  <p className="text-[10px] text-purple-400 font-bold uppercase">史詩金卡 (E)</p>
                  <p className="text-xl font-display font-black text-purple-400 mt-1">{collectionStats.epic} <span className="text-xs text-slate-500 font-normal">張</span></p>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-800/20">
                  <p className="text-[10px] text-blue-400 font-bold uppercase">稀有銀卡 (R)</p>
                  <p className="text-xl font-display font-black text-blue-400 mt-1">{collectionStats.rare} <span className="text-xs text-slate-500 font-normal">張</span></p>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-800/20">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">普通鐵卡 (C)</p>
                  <p className="text-xl font-display font-black text-slate-400 mt-1">{collectionStats.common} <span className="text-xs text-slate-500 font-normal">張</span></p>
                </div>
              </div>

              {/* Cards Grid */}
              {cardsCollection.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-800 rounded-3xl min-h-[350px]">
                  <Trophy className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                  <h3 className="text-base font-bold text-slate-300">你的卡包空空如也！</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                    去「記帳抽盲盒」中累積開箱，開啟你的理財收藏冒險吧！
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-400">
                      點擊卡片右上角按鈕可以 <strong className="text-indigo-400">Pin</strong> 到大廳展示牆或回收卡片。
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('警告：確定要回收所有的卡片收藏嗎？這將是無法逆轉的操作！')) {
                          setCardsCollection([]);
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-bold underline"
                      id="btn-clear-collection"
                    >
                      重置所有卡包
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                    {cardsCollection.map((card) => (
                      <CardDisplay
                        key={card.id}
                        card={card}
                        size="sm"
                        canPin={true}
                        onPin={() => handlePinCardToLobby(card)}
                        onDelete={() => handleDeleteCardFromCollection(card.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 3. GACHA BLIND BOX MACHINE MODAL */}
      <GachaModal
        isOpen={isGachaOpen}
        onClose={() => setIsGachaOpen(false)}
        standardTickets={standardTickets}
        premiumTickets={premiumTickets}
        bankruptcyTickets={bankruptcyTickets}
        onSpendTicket={handleSpendTicket}
        onAddCard={handleAddCardToCollection}
      />
    </div>
  );
}

// --- MINI PROFILE EDITOR SUB-COMPONENT ---
interface ProfileEditorProps {
  name: string;
  avatar: string;
  onSave: (name: string, avatar: string) => void;
  onCancel: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ name, avatar, onSave, onCancel }) => {
  const [editedName, setEditedName] = useState(name);
  const [editedAvatar, setEditedAvatar] = useState(avatar);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedName.trim().length > 0) {
      onSave(editedName.trim().substring(0, 10), editedAvatar);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
      {/* Avatar Picker Select */}
      <select
        value={editedAvatar}
        onChange={(e) => setEditedAvatar(e.target.value)}
        className="bg-slate-800 border border-slate-700 text-lg rounded px-1.5 py-0.5 focus:outline-none"
        id="select-avatar-edit"
      >
        {EMOTE_AVATARS.map((emoji) => (
          <option key={emoji} value={emoji}>
            {emoji}
          </option>
        ))}
      </select>

      {/* Nickname Input */}
      <input
        type="text"
        required
        value={editedName}
        onChange={(e) => setEditedName(e.target.value)}
        maxLength={10}
        placeholder="更換暱稱"
        className="bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1 w-24 focus:outline-none focus:border-indigo-500 font-bold"
        id="input-name-edit"
      />

      <div className="flex gap-1 shrink-0">
        <button
          type="submit"
          className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
          title="確定"
          id="btn-profile-submit"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-slate-500 hover:bg-slate-800 rounded animate-none"
          title="取消"
          id="btn-profile-cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
};
