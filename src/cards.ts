import { Card, Rarity } from './types';

export const STANDARD_CARDS: Card[] = [
  // --- MYTHIC (榮耀神話) ---
  {
    id: 'std-m-01',
    name: '宇宙節流主宰',
    rarity: 'MYTHIC',
    description: '掌控宇宙經濟規律的至高存在。今天你竟達成了神話級的極致省錢，財富之神降臨，為你冠上不朽的節約王冕！',
    imageType: 'mythic-deity'
  },
  {
    id: 'std-m-02',
    name: '黃金存摺永恆碑',
    rarity: 'MYTHIC',
    description: '你的存款餘額已超越時間和空間的限制。這不是一張簡單的卡牌，而是刻在財富聖殿上的永恆豐碑。',
    imageType: 'mythic-monument'
  },

  // --- LEGENDARY (閃耀傳奇) ---
  {
    id: 'std-l-01',
    name: '省錢至尊',
    rarity: 'LEGENDARY',
    description: '今日支出竟為0元！你超脫了肉體凡胎，心靈財富達到宇宙最高境界，連空氣都是甜的。',
    imageType: 'gold-crown'
  },
  {
    id: 'std-l-02',
    name: '巴菲特傳人',
    rarity: 'LEGENDARY',
    description: '極致理性消費，花在刀口，精準投資。未來的世界級富豪名單已默默為你預留一席。',
    imageType: 'gold-graph'
  },
  {
    id: 'std-l-03',
    name: '無欲無求財神爺',
    rarity: 'LEGENDARY',
    description: '自帶財氣卻毫無物慾。你不是在省錢，你是在為世界各地的財富築起一道堅不可摧的防護牆。',
    imageType: 'gold-deity'
  },

  // --- EPIC (史詩金卡) ---
  {
    id: 'std-e-01',
    name: '記帳小天才',
    rarity: 'EPIC',
    description: '每一分、每一毫的流向都瞭若指掌。你的財務透明度連瑞士銀行看了都自嘆不如！',
    imageType: 'purple-scroll'
  },
  {
    id: 'std-e-02',
    name: '打折獵手',
    rarity: 'EPIC',
    description: '哪裡有優惠，哪裡就有你！精準狙擊、降維打擊，絕不買貴，是商家的噩夢、錢包的救星。',
    imageType: 'purple-crosshair'
  },
  {
    id: 'std-e-03',
    name: '自律苦行僧',
    rarity: 'EPIC',
    description: '面對無數花里胡哨的消費誘惑，你心如止水，雙手合十。恭喜你今天成功抵抗誘惑！',
    imageType: 'purple-monk'
  },

  // --- RARE (稀有銀卡) ---
  {
    id: 'std-r-01',
    name: '省錢達人',
    rarity: 'RARE',
    description: '完美控制每日預算，游刃有餘地在都市中生存。省錢對你來說，只是一種呼吸般的日常。',
    imageType: 'blue-shield'
  },
  {
    id: 'std-r-02',
    name: '精打細算',
    rarity: 'RARE',
    description: '買任何東西都要經過三思、四思、五思。雖然耗費腦細胞，但保住了可愛的鈔票。',
    imageType: 'blue-calculator'
  },
  {
    id: 'std-r-03',
    name: '自製便當大師',
    rarity: 'RARE',
    description: '親自下廚，兼顧美味、健康與荷包。用親手做的溫度，擊退邪惡的外送附加費。',
    imageType: 'blue-bento'
  },
  {
    id: 'std-r-04',
    name: '環保衛士',
    rarity: 'RARE',
    description: '不買塑料袋，自備環保杯，自備餐具。省下的小錢，正在為地球多積累一片綠葉。',
    imageType: 'blue-leaf'
  },

  // --- COMMON (普通鐵卡) ---
  {
    id: 'std-c-01',
    name: '手搖飲成癮者',
    rarity: 'COMMON',
    description: '「今天辛苦了，來杯大杯微糖微冰吧！」錢包在流淚，但大口吸珍珠的你正笑得燦爛。',
    imageType: 'gray-cup'
  },
  {
    id: 'std-c-02',
    name: '外送依賴症',
    rarity: 'COMMON',
    description: '「好懶得動...」點開外送軟體，餐點加外送費加平台費...恭喜你又幫外送員買了半個便當。',
    imageType: 'gray-bike'
  },
  {
    id: 'std-c-03',
    name: '千手觀音剁手黨',
    rarity: 'COMMON',
    description: '看到「限時特賣」、「最後一件」就控制不住。買的時候多爽快，月底吃土時就有多無奈。',
    imageType: 'gray-scissors'
  },
  {
    id: 'std-c-04',
    name: '破產邊緣',
    rarity: 'COMMON',
    description: '今日預算嚴重拉警報！你正漫步在財務的鋼絲線上，一陣微風（比如一杯咖啡）就能讓你跌入深淵。',
    imageType: 'gray-warning'
  },
  {
    id: 'std-c-05',
    name: '吃土邊緣',
    rarity: 'COMMON',
    description: '花費嚴重超標。你已經開始認真研究哪種類型的泥土比較鬆軟好入口，呼吸新鮮空氣成了主食。',
    imageType: 'gray-dirt'
  },
  {
    id: 'std-c-06',
    name: '衝動消費大師',
    rarity: 'COMMON',
    description: '買完看著帳單，發呆了五分鐘。那件奇奇怪怪的擺飾，或許它唯一的用途就是嘲笑你的衝動。',
    imageType: 'gray-question'
  }
];

export const getRandomCard = (type: 'STANDARD' | 'BANKRUPTCY' | 'PREMIUM'): Card => {
  const rand = Math.random() * 100;
  let rarity: Rarity = 'COMMON';

  if (type === 'PREMIUM') {
    // Premium ticket: 0.5% Mythic, 10% Legendary, 30% Epic, 59.5% Rare
    if (rand < 0.5) rarity = 'MYTHIC';
    else if (rand < 10.5) rarity = 'LEGENDARY';
    else if (rand < 40.5) rarity = 'EPIC';
    else rarity = 'RARE';
  } else if (type === 'BANKRUPTCY') {
    // Overspend ticket: 0% Mythic, 0% Legendary, 5% Epic, 15% Rare, 80% Common
    if (rand < 5) rarity = 'EPIC';
    else if (rand < 20) rarity = 'RARE';
    else rarity = 'COMMON';
  } else {
    // Standard ticket: 0.1% Mythic, 2% Legendary, 10% Epic, 28% Rare, 59.9% Common
    if (rand < 0.1) rarity = 'MYTHIC';
    else if (rand < 2.1) rarity = 'LEGENDARY';
    else if (rand < 12.1) rarity = 'EPIC';
    else if (rand < 40.1) rarity = 'RARE';
    else rarity = 'COMMON';
  }

  const pool = STANDARD_CARDS.filter((c) => c.rarity === rarity);
  if (pool.length === 0) {
    // Fallback if rarity pool is empty
    return STANDARD_CARDS[Math.floor(Math.random() * STANDARD_CARDS.length)];
  }
  return {
    ...pool[Math.floor(Math.random() * pool.length)],
    id: `pulled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
};
