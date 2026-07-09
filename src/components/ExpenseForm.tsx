import React, { useState } from 'react';
import { ExpenseItem, Card } from '../types';
import { Plus, Trash2, ShieldCheck, AlertTriangle, Cpu, CircleDollarSign, Calendar, Sparkles, BookOpen, Utensils, Car, Film, Home, MoreHorizontal, Shirt, Wallet } from 'lucide-react';

interface ExpenseFormProps {
  expenses: ExpenseItem[];
  budget: number;
  onSetBudget: (budget: number) => void;
  onAddExpense: (amount: number, category: string, description: string) => void;
  onDeleteExpense: (id: string) => void;
  onClearToday: () => void;
  onGeminiAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
  geminiCritique: {
    critique: string;
    title: string;
    rarity: string;
    description: string;
    savingTips: string[];
  } | null;
  ticketsEarned: {
    standard: number;
    premium: number;
    bankruptcy: number;
  };
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expenses,
  budget,
  onSetBudget,
  onAddExpense,
  onDeleteExpense,
  onClearToday,
  onGeminiAnalyze,
  isAnalyzing,
  geminiCritique,
  ticketsEarned
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('飲食');
  const [description, setDescription] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget.toString());

  const categories = [
    { name: '飲食', icon: <Utensils className="w-4 h-4" />, color: 'bg-orange-500/10 text-orange-400' },
    { name: '衣著', icon: <Shirt className="w-4 h-4" />, color: 'bg-pink-500/10 text-pink-400' },
    { name: '居住', icon: <Home className="w-4 h-4" />, color: 'bg-emerald-500/10 text-emerald-400' },
    { name: '交通', icon: <Car className="w-4 h-4" />, color: 'bg-blue-500/10 text-blue-400' },
    { name: '教育', icon: <BookOpen className="w-4 h-4" />, color: 'bg-violet-500/10 text-violet-400' },
    { name: '娛樂', icon: <Film className="w-4 h-4" />, color: 'bg-purple-500/10 text-purple-400' },
    { name: '其他', icon: <MoreHorizontal className="w-4 h-4" />, color: 'bg-slate-500/10 text-slate-400' },
  ];

  const totalSpending = expenses.reduce((sum, item) => sum + item.amount, 0);
  const isOverBudget = totalSpending > budget;
  const savingPercentage = budget > 0 ? Math.max(0, Math.min(100, ((budget - totalSpending) / budget) * 100)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('請輸入大於 0 的金額');
      return;
    }
    onAddExpense(parsedAmount, category, description);
    setAmount('');
    setDescription('');
  };

  const handleSaveBudget = () => {
    const parsed = parseFloat(tempBudget);
    if (!isNaN(parsed) && parsed >= 0) {
      onSetBudget(parsed);
      setIsEditingBudget(false);
    } else {
      alert('請輸入有效的預算金額');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full" id="expense-form-container">
      {/* LEFT COLUMN: Input Form & Stats */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* 1. Daily Budget Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-md backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] uppercase text-slate-500 tracking-wider font-semibold block">DAILY BUDGET // 今日預算</span>
              {isEditingBudget ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold text-white">$</span>
                  <input
                    type="number"
                    value={tempBudget}
                    onChange={(e) => setTempBudget(e.target.value)}
                    className="w-24 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white font-bold focus:outline-none focus:border-cyan-500/50"
                    autoFocus
                    id="input-budget-edit"
                  />
                  <button
                    onClick={handleSaveBudget}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-colors cursor-pointer"
                    id="btn-budget-save"
                  >
                    儲存
                  </button>
                </div>
              ) : (
                <h3 className="text-2xl font-display font-black text-white mt-1">
                  ${budget} <span className="text-xs text-slate-500 font-normal">/ 日</span>
                  <button
                    onClick={() => {
                      setTempBudget(budget.toString());
                      setIsEditingBudget(true);
                    }}
                    className="ml-3 text-xs text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                    id="btn-budget-edit"
                  >
                    修改預算
                  </button>
                </h3>
              )}
            </div>
            <div className={`p-3 rounded-xl border ${isOverBudget ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'}`}>
              {isOverBudget ? <AlertTriangle className="w-5 h-5 animate-bounce" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-black/40 border border-white/5 h-3 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : savingPercentage > 40 ? 'bg-cyan-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, (totalSpending / (budget || 1)) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>今日已花費: <strong className={isOverBudget ? "text-rose-400" : "text-white"}>${totalSpending}</strong></span>
            <span>
              {isOverBudget ? (
                <span className="text-rose-400 font-bold animate-pulse">// 已超支 ${totalSpending - budget}！</span>
              ) : (
                <span>剩餘可用: <strong className="text-cyan-400">${budget - totalSpending}</strong></span>
              )}
            </span>
          </div>
        </div>

        {/* 2. Add Expense Form */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-md backdrop-blur-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            LOG EXPENDITURE // 新增開銷
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-slate-500 mb-1 ml-1 font-semibold tracking-wider">EXPENSE AMOUNT // 消費金額 *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-cyan-500/50"
                    id="input-expense-amount"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-slate-500 mb-1 ml-1 font-semibold tracking-wider">CATEGORY // 消費分類</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  id="select-expense-category"
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name} className="bg-slate-950 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-slate-500 mb-1 ml-1 font-semibold tracking-wider">DESCRIPTION // 消費明細 / 備註</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例如：午餐排骨飯、冰美式"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                id="input-expense-description"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] cursor-pointer hover:scale-[1.01]"
              id="btn-add-expense"
            >
              <Plus className="w-4 h-4" />
              CONVERT TO TICKETS // 確認記帳換抽卡券
            </button>
          </form>
        </div>

        {/* 3. Tickets Earned Summary Panel */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-md relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-fuchsia-500/5 to-transparent rounded-full pointer-events-none" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
            TICKETS BALANCE // 抽卡券餘額
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center flex flex-col justify-between items-center shadow-inner">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">標準盒券</span>
              <span className="text-2xl font-black text-cyan-400 mt-1 font-mono">{ticketsEarned.standard}</span>
              <span className="text-[9px] text-slate-500 mt-1 font-mono">// 記開銷獲取</span>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center flex flex-col justify-between items-center shadow-inner">
              <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">奢華黃金券</span>
              <span className="text-2xl font-black text-yellow-500 mt-1 font-mono">{ticketsEarned.premium}</span>
              <span className="text-[9px] text-slate-500 mt-1 font-mono">// 守住預算獲得</span>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center flex flex-col justify-between items-center shadow-inner">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">破產預警券</span>
              <span className="text-2xl font-black text-rose-500 mt-1 font-mono">{ticketsEarned.bankruptcy}</span>
              <span className="text-[9px] text-slate-500 mt-1 font-mono">// 超額預防獲得</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Logged Expenses list & Gemini analysis */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* 1. Today's Expense List */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-md flex-1 flex flex-col min-h-[250px] backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              RECENT LOGS // 今日開銷明細
            </h3>
            {expenses.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('確定要清空今天的記帳紀錄嗎？這會重置抽卡券。')) {
                    onClearToday();
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                id="btn-clear-today"
              >
                重置今日
              </button>
            )}
          </div>

          {expenses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-xl">
              <Wallet className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400 font-medium">今天還沒有記帳明細喔！</p>
              <p className="text-[10px] text-slate-500 mt-1">在左側填寫金額與品項開始累積抽卡券！</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[180px] pr-1 flex flex-col gap-2">
              {expenses.map((item) => {
                const catInfo = categories.find((c) => c.name === item.category) || categories[6];
                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-black/40 border border-white/5 hover:bg-white/5 p-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${catInfo.color}`}>
                        {catInfo.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200 leading-none">
                          {item.description || item.category}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-1">
                          分類：{item.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-extrabold text-cyan-400">
                        ${item.amount}
                      </span>
                      <button
                        onClick={() => onDeleteExpense(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                        title="刪除"
                        id={`btn-del-expense-${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Gemini Analysis Trigger Box */}
        <div className="bg-gradient-to-br from-fuchsia-950/20 to-cyan-950/20 border border-white/10 rounded-2xl p-6 shadow-md relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-fuchsia-400 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">
              AI CLINIC // 記帳財富診斷
            </h3>
            <span className="text-[9px] px-2 py-0.5 bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-full font-bold">
              GEMINI PRO
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            讓「富豪與乞丐的守護神」AI 深度診斷！消費完成即時犀利吐嘈或大肆表揚，並<strong className="text-yellow-400 font-bold">獲得一張專屬於你的客製 AI 盲盒卡片</strong>！
          </p>

          <button
            onClick={onGeminiAnalyze}
            disabled={isAnalyzing || expenses.length === 0}
            className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 disabled:border-slate-800 border border-transparent shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            id="btn-gemini-trigger"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                正在深度剖析你的錢包靈魂...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300 animate-bounce" />
                診斷錢包 & 生成 AI 客製卡
              </>
            )}
          </button>

          {/* Gemini Critique Result Showroom */}
          {geminiCritique && !isAnalyzing && (
            <div className="mt-4 p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col gap-3">
              <div>
                <span className="text-[10px] text-fuchsia-400 font-mono tracking-wider block mb-1 uppercase font-bold">// 神之審判書</span>
                <p className="text-xs text-slate-200 leading-relaxed italic bg-white/[0.02] p-2.5 rounded-lg border border-white/5 font-medium">
                  「 {geminiCritique.critique} 」
                </p>
              </div>

              <div>
                <span className="text-[10px] text-cyan-400 font-mono tracking-wider block mb-1.5 uppercase font-bold">// 推薦守護者省錢心法</span>
                <ul className="flex flex-col gap-1">
                  {geminiCritique.savingTips.map((tip, i) => (
                    <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1">
                      <span className="text-fuchsia-400 font-bold font-mono">{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500">獲得專屬客製卡片</span>
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    ✨ [{geminiCritique.title}]
                  </p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  geminiCritique.rarity === 'LEGENDARY' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                  geminiCritique.rarity === 'EPIC' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' :
                  geminiCritique.rarity === 'RARE' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' : 'bg-slate-800/50 border-slate-700/30 text-slate-300'
                }`}>
                  {geminiCritique.rarity}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
