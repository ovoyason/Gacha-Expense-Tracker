import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// 🛡️ IN-MEMORY LOBBY DATABASE & MULTIPLAYER COORDINATOR
// ==========================================
// Since this application is stateless and runs in Cloud Run, we establish 
// an in-memory collection to track online players, chat logs, pull histories, 
// and pinned showcases. Real-time updates are streamed downstream to all
// active players using Server-Sent Events (SSE).

let players: { [id: string]: { id: string; name: string; avatar: string; budget: number; spending: number; savedCount: number; active: boolean; lastSeen: number } } = {};
let chatMessages: any[] = [];
let recentPulls: any[] = [];
let pinnedCards: any[] = [];

// SSE Clients currently listening to the event stream
let sseClients: { id: string; res: Response }[] = [];

/**
 * Broadcasts an event and JSON payload to all connected EventSource streams.
 * Automatically catches and discards writes to dead sockets.
 */
function broadcast(event: string, data: any) {
  const payload = JSON.stringify({ event, data });
  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // client connection likely dead, handled gracefully
    }
  });
}

// Keep-alive for SSE stream (prevent timeouts)
setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.res.write(`: keep-alive\n\n`);
    } catch (e) {}
  });
}, 15000);

// Cleanup inactive players every 10 seconds
setInterval(() => {
  const now = Date.now();
  let changed = false;
  Object.keys(players).forEach((id) => {
    if (players[id].active && now - players[id].lastSeen > 25000) {
      players[id].active = false;
      changed = true;
      // Broadcast system message
      const sysMsg = {
        id: `sys-${now}-${id}`,
        playerId: "system",
        playerName: "系統公告",
        playerAvatar: "🔔",
        message: `玩家 ${players[id].name} 悄悄地離開了盲盒大廳...`,
        timestamp: now,
        system: true
      };
      chatMessages.push(sysMsg);
      if (chatMessages.length > 50) chatMessages.shift();
      broadcast("chat:message", sysMsg);
    }
  });
  if (changed) {
    broadcast("lobby:update", getLobbyState());
  }
}, 10000);

// Helper to extract lobby status
function getLobbyState() {
  const activePlayers = Object.values(players).filter(p => p.active);
  return {
    onlineCount: activePlayers.length,
    players: activePlayers,
    messages: chatMessages,
    recentPulls: recentPulls,
    pinnedCards: pinnedCards
  };
}

// --- API Endpoints ---

// 1. SSE Stream
app.get("/api/lobby/stream", (req: Request, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  sseClients.push({ id: clientId, res });

  // Send initial lobby state
  const initialPayload = JSON.stringify({ event: "init", data: getLobbyState() });
  res.write(`data: ${initialPayload}\n\n`);

  req.on("close", () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// 2. Join Lobby
app.post("/api/lobby/join", (req: Request, res: Response) => {
  const { id, name, avatar, budget, spending, savedCount } = req.body;
  if (!id || !name) {
    res.status(400).json({ error: "Missing player info" });
    return;
  }

  const isNew = !players[id] || !players[id].active;
  players[id] = {
    id,
    name,
    avatar: avatar || "🐱",
    budget: budget || 150,
    spending: spending || 0,
    savedCount: savedCount || 0,
    active: true,
    lastSeen: Date.now()
  };

  if (isNew) {
    const sysMsg = {
      id: `sys-${Date.now()}-${id}`,
      playerId: "system",
      playerName: "系統公告",
      playerAvatar: "🔔",
      message: `歡迎玩家 ${name} 進入了盲盒大廳！一起省錢抽大獎！`,
      timestamp: Date.now(),
      system: true
    };
    chatMessages.push(sysMsg);
    if (chatMessages.length > 50) chatMessages.shift();
    broadcast("chat:message", sysMsg);
  }

  broadcast("lobby:update", getLobbyState());
  res.json({ success: true, lobby: getLobbyState() });
});

// 3. Heartbeat
app.post("/api/lobby/heartbeat", (req: Request, res: Response) => {
  const { id, budget, spending, savedCount } = req.body;
  if (id && players[id]) {
    players[id].lastSeen = Date.now();
    players[id].budget = budget !== undefined ? budget : players[id].budget;
    players[id].spending = spending !== undefined ? spending : players[id].spending;
    players[id].savedCount = savedCount !== undefined ? savedCount : players[id].savedCount;
    if (!players[id].active) {
      players[id].active = true;
      broadcast("lobby:update", getLobbyState());
    }
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Player not found" });
  }
});

// 4. Send Message
app.post("/api/lobby/chat", (req: Request, res: Response) => {
  const { playerId, message } = req.body;
  const player = players[playerId];
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const chatMsg = {
    id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    playerId,
    playerName: player.name,
    playerAvatar: player.avatar,
    message: message.substring(0, 150), // Limit message length
    timestamp: Date.now(),
    system: false
  };

  chatMessages.push(chatMsg);
  if (chatMessages.length > 50) chatMessages.shift();

  broadcast("chat:message", chatMsg);
  res.json({ success: true });
});

// 5. BroadCast Pull
app.post("/api/lobby/pull", (req: Request, res: Response) => {
  const { playerId, cardName, rarity, isCustom } = req.body;
  const player = players[playerId];
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const pullLog = {
    id: `pull-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    playerName: player.name,
    playerAvatar: player.avatar,
    cardName,
    rarity,
    timestamp: Date.now(),
    isCustom: !!isCustom
  };

  recentPulls.unshift(pullLog);
  if (recentPulls.length > 30) recentPulls.pop();

  broadcast("gacha:pull", pullLog);
  broadcast("lobby:update", getLobbyState());
  res.json({ success: true });
});

// 6. Pin Card to Showcase Wall
app.post("/api/lobby/pin", (req: Request, res: Response) => {
  const { playerId, card } = req.body;
  const player = players[playerId];
  if (!player || !card) {
    res.status(400).json({ error: "Missing parameters" });
    return;
  }

  // Remove existing pin for this player to avoid clutter
  pinnedCards = pinnedCards.filter((p) => p.playerName !== player.name);

  const pinned = {
    id: `pin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    playerName: player.name,
    playerAvatar: player.avatar,
    card,
    timestamp: Date.now()
  };

  pinnedCards.unshift(pinned);
  if (pinnedCards.length > 20) pinnedCards.pop();

  broadcast("card:pinned", pinned);
  broadcast("lobby:update", getLobbyState());
  res.json({ success: true });
});

// ==========================================
// 🧠 SERVER-SIDE GEMINI 3.5 FLASH COGNITIVE ENGINE
// ==========================================
// Securely proxies financial data (budget, items) to the Google Gen AI API.
// Generates a JSON response matching the required schema structure:
// critique (text), title (string), rarity (string enum), description (text), savingTips (string array).
app.post("/api/gemini/analyze", async (req: Request, res: Response) => {
  const { budget, expenses, playerName } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: "API金鑰未設定",
      details: "系統後台尚未設定 GEMINI_API_KEY，無法啟用AI財富診斷。請先至 Settings > Secrets 設定金鑰。"
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const totalSpending = expenses.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const itemDetails = expenses.map((item: any) => `- ${item.description || item.category}: $${item.amount} (${item.category})`).join("\n");

    const prompt = `
你是一位幽默毒舌但富有智慧的理財分析大師（名為「富豪與乞丐的守護神」）。
請根據這位使用者的今日記帳數據，進行一次爆笑、諷刺或極度讚賞的財富診斷，並為其客製化生成一張專屬盲盒卡片。

使用者名稱: ${playerName || "無名省錢兵"}
今日預算限制: $${budget}
實際總花費: $${totalSpending}
記帳明細:
${itemDetails || "(今天沒有任何花費紀錄)"}

請根據花費與預算比例、花費類型（例如手搖、外送、昂貴奢侈品等）來決定分析語氣：
- 如果花費遠低於預算（省了超多錢）：大加讚賞，稱其為省錢至尊。
- 如果剛好在預算邊緣：幽默提醒，稱其為精算大師。
- 如果超支，甚至嚴重超支：毫不留情地幽默毒舌、犀利吐嘈他的衝動消費。

請使用 JSON 格式嚴格輸出以下欄位：
1. critique: 給使用者的幽默理財診斷報告（約 80-120 字，帶有一點吐槽或讚美，使用繁體中文）。
2. title: 為使用者產生的客製化專屬卡片名稱（例如：「星巴克忠實股東」、「今日最速剁手狂人」、「無欲無求空氣吸食者」，需切合其花費特徵，不超過8字）。
3. rarity: 卡片的稀有度等級，必須是這四者之一："COMMON", "RARE", "EPIC", "LEGENDARY"。如果是極度省錢或極度超支等極端情況，可以給 EPIC 或 LEGENDARY。
4. description: 這張專屬卡片的趣味說明文字（約 40-60 字，符合卡片名稱的敘述）。
5. savingTips: 針對今日花費提供的 3 個超實用、幽默或諷刺的省錢具體建議（陣列，每個建議 15-25 字）。
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            critique: { type: Type.STRING, description: "Humorous budget analysis and critique" },
            title: { type: Type.STRING, description: "Custom card name based on daily spending habits" },
            rarity: { type: Type.STRING, description: "Rarity rating: COMMON, RARE, EPIC, or LEGENDARY" },
            description: { type: Type.STRING, description: "Custom card funny background story description" },
            savingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 humorous but practical saving advice items"
            }
          },
          required: ["critique", "title", "rarity", "description", "savingTips"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gemini returned an empty response.");
    }

    const parsedData = JSON.parse(resultText.trim());
    res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    res.status(500).json({
      error: "AI 診斷暫時失效",
      details: error.message || "未知錯誤"
    });
  }
});


// Vite / Static files middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
