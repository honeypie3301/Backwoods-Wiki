import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface WikiStats {
  uniqueCount: number;
  repeatCount: number;
  totalCount: number;
  visitorIds: string[];
  pageViews: Record<string, number>;
  logs: Array<{
    timestamp: string;
    type: 'unique' | 'repeat';
    slug: string;
    visitorId: string;
  }>;
}

const STATS_FILE = path.join(process.cwd(), 'data', 'stats.json');

function ensureStatsDir() {
  const dir = path.dirname(STATS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadStats(): WikiStats {
  ensureStatsDir();
  if (fs.existsSync(STATS_FILE)) {
    try {
      const data = fs.readFileSync(STATS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading stats file, resetting:", e);
    }
  }
  return {
    uniqueCount: 0,
    repeatCount: 0,
    totalCount: 0,
    visitorIds: [],
    pageViews: {},
    logs: []
  };
}

function saveStats(stats: WikiStats) {
  ensureStatsDir();
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf8');
  } catch (e) {
    console.error("Failed to save stats file:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get(["/api/stats", "*/api/stats"], (req, res) => {
    const stats = loadStats();
    res.json({
      uniqueCount: stats.uniqueCount,
      repeatCount: stats.repeatCount,
      totalCount: stats.totalCount,
      pageViews: stats.pageViews,
      logs: stats.logs
    });
  });

  app.post(["/api/visit", "*/api/visit"], (req, res) => {
    const { visitorId, slug } = req.body;
    if (!visitorId || typeof visitorId !== 'string') {
      return res.status(400).json({ error: 'visitorId is required' });
    }
    const s = slug || 'home';

    const stats = loadStats();
    const isUnique = !stats.visitorIds.includes(visitorId);

    if (isUnique) {
      stats.visitorIds.push(visitorId);
      stats.uniqueCount += 1;
    } else {
      stats.repeatCount += 1;
    }
    stats.totalCount += 1;
    stats.pageViews[s] = (stats.pageViews[s] || 0) + 1;

    // Add to logs (limit to 50)
    stats.logs.unshift({
      timestamp: new Date().toISOString(),
      type: isUnique ? 'unique' : 'repeat',
      slug: s,
      visitorId: visitorId.substring(0, 12)
    });
    if (stats.logs.length > 50) {
      stats.logs = stats.logs.slice(0, 50);
    }

    saveStats(stats);
    res.json({
      success: true,
      stats: {
        uniqueCount: stats.uniqueCount,
        repeatCount: stats.repeatCount,
        totalCount: stats.totalCount
      }
    });
  });

  // Serve static assets and/or Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
