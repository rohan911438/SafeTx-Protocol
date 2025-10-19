import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: '.env.magicblock' });

const app = express();
const PORT = process.env.PORT || 5000;
const METRICS_INTERVAL = parseInt(process.env.METRICS_INTERVAL) || 2000;
const ENV = process.env.ENV || 'development';
const DEBUG_MODE = (process.env.DEBUG_MODE === 'true');

// Middleware
app.use(cors());
app.use(express.json());

// Solana Connection
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl('devnet');
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// MagicBlock Configuration - Using Public Router
const MAGICBLOCK_ROUTER = process.env.MAGICBLOCK_ROUTER || 'https://devnet-router.magicblock.app';

// Storage for MagicBlock routes and metrics
let magicBlockRoutesRaw = [];
let magicBlockRoutes = []; // normalized as URL strings
let lastRouteRefresh = null;
const ROUTE_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// In-memory storage for metrics
let latestMetrics = {
  tps: 0,
  slot: 0,
  blockTime: 0,
  slotTime: 0,
  successRate: 100,
  timestamp: Date.now(),
  magicblockStatus: 'disconnected',
  lastMagicBlockRoute: null,
};

let metricsHistory = [];
const MAX_HISTORY = 100;

// SSE clients for /metrics/stream
const sseClients = new Set();

// ═══════════════════════════════════════════════════════════
// SOLANA METRICS CALCULATION
// ═══════════════════════════════════════════════════════════

/**
 * Calculate TPS from recent blocks
 */
async function calculateTPS(numBlocks = 5) {
  try {
    const slot = await connection.getSlot();
    let totalTxs = 0;
    let validBlocks = 0;

    for (let i = 0; i < numBlocks; i++) {
      try {
        const block = await connection.getBlock(slot - i, {
          maxSupportedTransactionVersion: 0,
        });
        if (block && block.transactions) {
          totalTxs += block.transactions.length;
          validBlocks++;
        }
      } catch (e) {
        continue;
      }
    }

    const avgTxPerBlock = validBlocks > 0 ? totalTxs / validBlocks : 0;
    return Math.round(avgTxPerBlock * 2.5); // ~2.5 blocks per second on Solana
  } catch (error) {
    if (DEBUG_MODE) console.error('TPS calculation error:', error.message);
    return 0;
  }
}

/**
 * Get current slot and block time
 */
async function getSlotAndBlockTime() {
  try {
    const slot = await connection.getSlot();
    const blockTime = await connection.getBlockTime(slot);
    
    return {
      slot,
      blockTime: blockTime || Date.now() / 1000,
    };
  } catch (error) {
    if (DEBUG_MODE) console.error('Slot/BlockTime error:', error.message);
    return {
      slot: 0,
      blockTime: Date.now() / 1000,
    };
  }
}

/**
 * Calculate slot time (time between consecutive blocks)
 */
async function calculateSlotTime() {
  try {
    const slot = await connection.getSlot();
    const blockTime1 = await connection.getBlockTime(slot);
    const blockTime2 = await connection.getBlockTime(slot - 1);
    
    if (blockTime1 && blockTime2) {
      return Math.abs(blockTime1 - blockTime2);
    }
    return 0.4; // Default Solana target
  } catch (error) {
    if (DEBUG_MODE) console.error('Slot time error:', error.message);
    return 0.4;
  }
}

/**
 * Calculate success rate from latest block
 */
async function getSuccessRate() {
  try {
    const slot = await connection.getSlot();
    const block = await connection.getBlock(slot, {
      maxSupportedTransactionVersion: 0,
    });

    if (!block || !block.transactions.length) return 100;

    const successfulTxs = block.transactions.filter(tx => !tx.meta?.err).length;
    return Number(((successfulTxs / block.transactions.length) * 100).toFixed(2));
  } catch (error) {
    if (DEBUG_MODE) console.error('Success rate error:', error.message);
    return 100;
  }
}

/**
 * Fetch all Solana metrics
 */
async function fetchSolanaMetrics() {
  try {
    const [tps, slotData, slotTime, successRate] = await Promise.all([
      calculateTPS(),
      getSlotAndBlockTime(),
      calculateSlotTime(),
      getSuccessRate(),
    ]);

    return {
      tps,
      slot: slotData.slot,
      blockTime: slotData.blockTime,
      slotTime: Number(slotTime.toFixed(2)),
      successRate,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('❌ Error fetching Solana metrics:', error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// MAGICBLOCK EPHEMERAL ROLLUPS INTEGRATION
// ═══════════════════════════════════════════════════════════

/**
 * Fetch available MagicBlock routes from public router
 */
async function fetchMagicBlockRoutes() {
  try {
    console.log('🔍 Fetching MagicBlock routes from router...');
    
    const response = await axios.post(
      MAGICBLOCK_ROUTER,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'getRoutes',
        params: [],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.result) {
      // Some routers return { result: [...] } or { result: { routes: [...] } }
      const raw = Array.isArray(response.data.result)
        ? response.data.result
        : (response.data.result.routes || []);

      magicBlockRoutesRaw = raw;

      // Normalize to URL strings
      const normalizeEntry = (entry) => {
        if (!entry) return null;
        if (typeof entry === 'string') return entry;
        if (typeof entry === 'object') {
          // Try common fields
          const candidates = [
            entry.url,
            entry.endpoint,
            entry.rpc,
            entry.address,
            entry.http,
            entry.https,
            entry.httpUrl,
            entry.httpsUrl,
            entry.fqdn,
            entry.host,
            entry.hostname,
          ].filter(Boolean);
          if (candidates.length) {
            let u = String(candidates[0]).trim();
            // If fqdn or hostname lacks scheme, default to https
            if (!/^https?:\/\//i.test(u)) {
              u = `https://${u}`;
            }
            return u;
          }
          return null;
        }
        return null;
      };

      const urls = raw
        .map(normalizeEntry)
        .filter((u) => typeof u === 'string')
        .map((u) => u.trim());

      // Validate URLs
      const validUrls = [];
      for (const u of urls) {
        try {
          const parsed = new URL(u);
          if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            validUrls.push(parsed.toString().replace(/\/$/, ''));
          }
        } catch (_) {
          // skip invalid URL
        }
      }

      // De-duplicate
      magicBlockRoutes = Array.from(new Set(validUrls));
      lastRouteRefresh = Date.now();
      console.log(`✅ Fetched ${magicBlockRoutes.length} MagicBlock routes`);
      if (magicBlockRoutesRaw.length > 0) {
        console.log(`📍 Sample route (raw): ${JSON.stringify(magicBlockRoutesRaw[0])}`);
      }
      if (magicBlockRoutes.length > 0) {
        console.log(`🔗 Sample route (url): ${magicBlockRoutes[0]}`);
      }
      return { success: true, routes: magicBlockRoutes };
    } else {
      console.error('⚠️  No routes in response:', response.data);
      return { success: false, reason: 'no_routes_in_response' };
    }
  } catch (error) {
    console.error('❌ Error fetching MagicBlock routes:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Get a random MagicBlock route
 */
function getRandomRoute() {
  if (!Array.isArray(magicBlockRoutes) || magicBlockRoutes.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * magicBlockRoutes.length);
  return magicBlockRoutes[randomIndex];
}

/**
 * Send metrics to a random MagicBlock Ephemeral Rollup node
 */
async function sendToMagicBlock(metrics) {
  try {
    // Refresh routes if needed
    if (!lastRouteRefresh || Date.now() - lastRouteRefresh > ROUTE_REFRESH_INTERVAL) {
      await fetchMagicBlockRoutes();
    }

    const route = getRandomRoute();
    if (!route) {
      console.error('❌ No MagicBlock routes available');
      return { success: false, reason: 'no_routes' };
    }

    // Validate route URL
    let routeUrl = null;
    try {
      const parsed = new URL(route);
      routeUrl = parsed.toString();
    } catch (_) {
      console.error('❌ Selected route is not a valid URL:', route);
      return { success: false, reason: 'invalid_route_url' };
    }

    // Prepare payload
    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'submitMetrics',
      params: {
        source: 'safetx-solana-monitor',
        network: 'devnet',
        timestamp: metrics.timestamp,
        metrics: {
          tps: metrics.tps,
          slot: metrics.slot,
          blockTime: metrics.blockTime,
          slotTime: metrics.slotTime,
          successRate: metrics.successRate,
        },
      },
    };

    // Send to MagicBlock ER node
    const response = await axios.post(routeUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });

    console.log(`✅ Sent to MagicBlock ER [${routeUrl}]:`, {
      tps: metrics.tps,
      slot: metrics.slot,
      status: response.status,
    });

    return { 
      success: true, 
      route: routeUrl, 
      response: response.data 
    };
  } catch (error) {
    console.error('❌ MagicBlock ER send error:', error.message);
    return { 
      success: false, 
      reason: 'request_failed', 
      error: error.message 
    };
  }
}

// ═══════════════════════════════════════════════════════════
// STREAMING LOGIC
// ═══════════════════════════════════════════════════════════

/**
 * Start streaming metrics to MagicBlock ER
 */
function startMetricsStream() {
  console.log(`\n🚀 Starting metrics stream (every ${METRICS_INTERVAL}ms)`);
  console.log(`📊 Solana RPC: ${SOLANA_RPC_URL}`);
  console.log(`🔮 MagicBlock Router: ${MAGICBLOCK_ROUTER}\n`);

  setInterval(async () => {
    try {
      // Fetch Solana metrics
      const metrics = await fetchSolanaMetrics();
      
      if (!metrics) {
        console.log('⚠️  Failed to fetch metrics, skipping...');
        return;
      }

      // Update latest metrics
      latestMetrics = { ...metrics };

      // Add to history
      metricsHistory.push(metrics);
      if (metricsHistory.length > MAX_HISTORY) {
        metricsHistory.shift();
      }

      // Send to MagicBlock ER
      const mbResult = await sendToMagicBlock(metrics);
      latestMetrics.magicblockStatus = mbResult.success ? 'connected' : 'error';
      latestMetrics.lastMagicBlockRoute = mbResult.route || null;

      // Broadcast to SSE clients
      if (sseClients.size > 0) {
        const sseData = JSON.stringify(latestMetrics);
        sseClients.forEach(client => {
          try {
            client.write(`data: ${sseData}\n\n`);
          } catch (err) {
            console.error('SSE write error:', err.message);
            sseClients.delete(client);
          }
        });
      }

      // Console output
      console.log(
        `📊 [${new Date().toLocaleTimeString()}] ` +
        `TPS: ${metrics.tps}, Slot: ${metrics.slot}, ` +
        `MB: ${mbResult.success ? '✅' : '❌'}`
      );
    } catch (error) {
      console.error('❌ Stream error:', error.message);
    }
  }, METRICS_INTERVAL);
}

// ═══════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: ENV,
    magicblock: {
      router: MAGICBLOCK_ROUTER,
      routesAvailable: magicBlockRoutes.length,
      lastRefresh: lastRouteRefresh ? new Date(lastRouteRefresh).toISOString() : null,
      status: latestMetrics.magicblockStatus,
    },
    solana: {
      rpc: SOLANA_RPC_URL,
      network: 'devnet',
    },
    sseClients: sseClients.size,
  });
});

// Get current Solana metrics snapshot
app.get('/metrics', (req, res) => {
  res.json({
    ...latestMetrics,
    routesAvailable: magicBlockRoutes.length,
  });
});

// Get available MagicBlock ephemeral rollup routes
app.get('/magicblock/routes', async (req, res) => {
  try {
    // Force refresh if requested
    if (req.query.refresh === 'true') {
      await fetchMagicBlockRoutes();
    }
    
    res.json({
      success: true,
      count: magicBlockRoutes.length,
      routes: magicBlockRoutes,
      raw: magicBlockRoutesRaw,
      lastRefresh: lastRouteRefresh ? new Date(lastRouteRefresh).toISOString() : null,
      router: MAGICBLOCK_ROUTER,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Server-Sent Events endpoint for real-time metric streaming
app.get('/metrics/stream', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial data
  res.write(`data: ${JSON.stringify(latestMetrics)}\n\n`);

  // Add client to set
  sseClients.add(res);
  console.log(`📡 SSE client connected (total: ${sseClients.size})`);

  // Remove client on disconnect
  req.on('close', () => {
    sseClients.delete(res);
    console.log(`📡 SSE client disconnected (total: ${sseClients.size})`);
  });
});

// Get metrics history
app.get('/metrics/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  res.json({
    metrics: metricsHistory.slice(-limit),
    count: metricsHistory.length,
  });
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════

app.listen(PORT, async () => {
  console.log(`\n╔════════════════════════════════════════════════════════╗`);
  console.log(`║  🚀 SafeTx + MagicBlock ER Server                      ║`);
  console.log(`╠════════════════════════════════════════════════════════╣`);
  console.log(`║  📡 API Server:        http://localhost:${PORT}           ║`);
  console.log(`║  🔮 MagicBlock Router: ${MAGICBLOCK_ROUTER.substring(0, 35)}...║`);
  console.log(`║  ⏱️  Stream Interval:   ${METRICS_INTERVAL}ms                        ║`);
  console.log(`║  🌍 Environment:       ${ENV}                           ║`);
  console.log(`╠════════════════════════════════════════════════════════╣`);
  console.log(`║  Endpoints:                                            ║`);
  console.log(`║    GET  /health                                        ║`);
  console.log(`║    GET  /metrics                                       ║`);
  console.log(`║    GET  /metrics/stream (SSE)                          ║`);
  console.log(`║    GET  /metrics/history                               ║`);
  console.log(`║    GET  /magicblock/routes                             ║`);
  console.log(`╚════════════════════════════════════════════════════════╝\n`);

  // Fetch MagicBlock routes on startup
  await fetchMagicBlockRoutes();

  // Periodically refresh routes
  setInterval(() => {
    fetchMagicBlockRoutes().catch((e) => {
      if (DEBUG_MODE) console.error('Route refresh error:', e?.message || e);
    });
  }, ROUTE_REFRESH_INTERVAL);

  // Start streaming
  startMetricsStream();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down SafeTx + MagicBlock ER server...');
  
  // Close all SSE connections
  sseClients.forEach(client => {
    try {
      client.end();
    } catch (err) {
      // Ignore
    }
  });
  sseClients.clear();
  
  process.exit(0);
});
