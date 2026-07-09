export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export interface Card {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  imageType: string; // e.g., 'money-bag', 'piggy-bank', 'broken-heart', 'ai-gem', etc.
  isCustom?: boolean;
  creator?: string;
  createdAt?: number;
}

export interface ExpenseItem {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  budget: number;
  spending: number;
  savedCount: number;
  active: boolean;
  lastSeen: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  message: string;
  timestamp: number;
  system: boolean;
}

export interface PullLog {
  id: string;
  playerName: string;
  playerAvatar: string;
  cardName: string;
  rarity: Rarity;
  timestamp: number;
  isCustom: boolean;
}

export interface PinnedCard {
  id: string;
  playerName: string;
  playerAvatar: string;
  card: Card;
  timestamp: number;
}

export interface LobbyState {
  onlineCount: number;
  players: Player[];
  messages: ChatMessage[];
  recentPulls: PullLog[];
  pinnedCards: PinnedCard[];
}
