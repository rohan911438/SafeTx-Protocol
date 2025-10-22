import express from 'express';
import cors from 'cors';
import { Connection, clusterApiUrl } from '@solana/web3.js';

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY || null; // Optional: set to enable simple API key auth

app.use(cors());
app.use(express.json());

// Connect to Solana devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// In-memory queue for transactions
let transactionQueue = [];
let retryCount = 0;
let tpsHistory = [];
let recentTransactions = [];

// Optional API key auth middleware (companies can enable via env: API_KEY)
app.use((req, res, next) => {
  if (!API_KEY) return next();

  // Always allow health without key
  if (req.path === '/api/health') return next();

  // For SSE, allow ?key=... as EventSource can't send headers cross-origin easily
  if (req.path === '/api/events/stream') {
    const key = req.get('x-api-key') || req.query.key;
    if (key === API_KEY) return next();
    return res.status(401).json({ error: 'Unauthorized (missing/invalid API key)' });
  }

  const key = req.get('x-api-key');
  if (key === API_KEY) return next();
  return res.status(401).json({ error: 'Unauthorized (missing/invalid API key)' });
});

// Helper: Calculate TPS from recent blocks
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
        if (block) {
          totalTxs += block.transactions.length;
          validBlocks++;
        }
      } catch (e) {
        // Skip blocks that don't exist
        continue;
      }
    }

    // Average TPS (assuming ~0.4s per slot)
    const avgTxPerBlock = validBlocks > 0 ? totalTxs / validBlocks : 0;
    return Math.round(avgTxPerBlock * 2.5); // ~2.5 blocks per second
  } catch (error) {
    console.error('TPS calculation error:', error.message);
    return 0;
  }
}

// Helper: Get slot time
async function getSlotTime() {
  try {
    const slot = await connection.getSlot();
    const blockTime1 = await connection.getBlockTime(slot);
    const blockTime2 = await connection.getBlockTime(slot - 1);
    
    if (blockTime1 && blockTime2) {
      return Math.abs(blockTime1 - blockTime2);
    }
    return 0.4; // Default Solana target
  } catch (error) {
    console.error('Slot time error:', error.message);
    return 0.4;
  }
}

// Helper: Calculate success rate
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
    console.error('Success rate error:', error.message);
    return 100;
  }
}

// Helper: Get current leader
async function getCurrentLeader() {
  try {
    const slot = await connection.getSlot();
    const leaderSchedule = await connection.getLeaderSchedule(slot);
    
    if (leaderSchedule) {
      // Get first validator from schedule as approximation
      const validators = Object.keys(leaderSchedule);
      if (validators.length > 0) {
        const leader = validators[0];
        return `${leader.slice(0, 5)}...${leader.slice(-3)}`;
      }
    }
    return 'Unknown';
  } catch (error) {
    console.error('Leader fetch error:', error.message);
    return 'Val???...???';
  }
}

// Helper: Get recent transactions
async function getRecentTransactions() {
  try {
    const slot = await connection.getSlot();
    const block = await connection.getBlock(slot, {
      maxSupportedTransactionVersion: 0,
    });

    if (!block || !block.transactions.length) return [];

    const txs = block.transactions.slice(0, 5).map((tx, idx) => {
      const signature = tx.transaction.signatures[0];
      const shortSig = `${signature.slice(0, 5)}..${signature.slice(-3)}`;
      const status = tx.meta?.err ? 'failed' : 'processed';
      const now = new Date();
      now.setSeconds(now.getSeconds() - idx * 2);
      const time = now.toLocaleTimeString('en-US', { hour12: false });

      return {
        tx_id: shortSig,
        status,
        time,
      };
    });

    return txs;
  } catch (error) {
    console.error('Recent transactions error:', error.message);
    return [];
  }
}

// Build a single metrics snapshot (used by REST and SSE)
async function getMetricsSnapshot() {
  const [tps, slotTime, successRate, latestSlot, currentLeader, recentTxs] = await Promise.all([
    calculateTPS(),
    getSlotTime(),
    getSuccessRate(),
    connection.getSlot(),
    getCurrentLeader(),
    getRecentTransactions(),
  ]);

  // Update TPS history (keep last 6 values)
  tpsHistory.push(tps);
  if (tpsHistory.length > 6) tpsHistory.shift();

  // Update recent transactions cache
  recentTransactions = recentTxs;

  // Determine network status
  let networkStatus = 'green';
  if (tps < 500 || successRate < 95) {
    networkStatus = 'red';
  } else if (tps < 1000 || successRate < 98) {
    networkStatus = 'yellow';
  }

  return {
    tps,
    slot_time: Number(Number(slotTime).toFixed(2)),
    success_rate: successRate,
    queue_size: transactionQueue.length,
    retry_count: retryCount,
    latest_slot: latestSlot,
    current_leader: currentLeader,
    network_status: networkStatus,
    tps_history: tpsHistory.length >= 6 ? tpsHistory : [tps, tps, tps, tps, tps, tps],
    recent_transactions: recentTransactions.length > 0 ? recentTransactions : [
      { tx_id: 'Wait...', status: 'queued', time: new Date().toLocaleTimeString('en-US', { hour12: false }) },
    ],
  };
}

// Main metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    console.log('Fetching Solana metrics...');
    const metrics = await getMetricsSnapshot();
    console.log('✓ Metrics fetched:', { tps: metrics.tps, slotTime: metrics.slot_time, successRate: metrics.success_rate, latestSlot: metrics.latest_slot });
    res.json(metrics);
  } catch (error) {
    console.error('❌ Metrics fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch metrics',
      message: error.message 
    });
  }
});

// Server-Sent Events: unified live metrics stream
app.get('/api/events/stream', async (req, res) => {
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let alive = true;
  let timer; // Declare timer before using it in close handler
  req.on('close', () => { alive = false; if (timer) clearInterval(timer); });

  // Send an initial ping to open the stream on some proxies
  res.write(': connected\n\n');

  const sendOnce = async () => {
    try {
      const metrics = await getMetricsSnapshot();
      res.write(`data: ${JSON.stringify(metrics)}\n\n`);
    } catch (e) {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: 'metrics_error', error: String(e?.message || e) })}\n\n`);
    }
  };

  await sendOnce();
  const intervalMs = Number(process.env.METRICS_INTERVAL || 2000);
  timer = setInterval(() => { if (alive) sendOnce(); }, intervalMs);
});

// Queue transaction endpoint
app.post('/api/queue', (req, res) => {
  try {
    const { tx_id, sender, type = 'Transfer', fee = '0.000005 SOL' } = req.body;

    if (!tx_id || !sender) {
      return res.status(400).json({ error: 'tx_id and sender are required' });
    }

    const transaction = {
      tx_id,
      sender,
      type,
      fee,
      status: 'queued',
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      timestamp: Date.now(),
    };

    transactionQueue.push(transaction);
    console.log(`✓ Transaction queued: ${tx_id}`);

    res.json({
      success: true,
      queue_size: transactionQueue.length,
      transaction,
    });
  } catch (error) {
    console.error('❌ Queue error:', error);
    res.status(500).json({ error: 'Failed to queue transaction' });
  }
});

// Retry pending transactions
app.post('/api/retry', (req, res) => {
  try {
    const queuedCount = transactionQueue.length;
    
    // Simulate retry: clear queue and increment retry count
    retryCount += queuedCount;
    transactionQueue = [];

    console.log(`✓ Retried ${queuedCount} transactions`);

    res.json({
      success: true,
      retried: queuedCount,
      retry_count: retryCount,
      queue_size: 0,
    });
  } catch (error) {
    console.error('❌ Retry error:', error);
    res.status(500).json({ error: 'Failed to retry transactions' });
  }
});

// Flush queue
app.post('/api/flush', (req, res) => {
  try {
    const flushedCount = transactionQueue.length;
    transactionQueue = [];

    console.log(`✓ Flushed ${flushedCount} transactions`);

    res.json({
      success: true,
      flushed: flushedCount,
      queue_size: 0,
    });
  } catch (error) {
    console.error('❌ Flush error:', error);
    res.status(500).json({ error: 'Failed to flush queue' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Get queue status
app.get('/api/queue', (req, res) => {
  res.json({
    queue_size: transactionQueue.length,
    retry_count: retryCount,
    transactions: transactionQueue,
  });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`\n🚀 SafeTx Backend running on http://localhost:${PORT}`);
  console.log(`📊 Metrics endpoint: http://localhost:${PORT}/api/metrics`);
  console.log(`📡 SSE stream: http://localhost:${PORT}/api/events/stream`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health\n`);
});

// Handle port already in use
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`\nTo fix this, either:`);
    console.error(`  1. Kill the process: netstat -ano | findstr :${PORT}`);
    console.error(`     Then: taskkill /F /PID <PID>`);
    console.error(`  2. Use a different port: set PORT=5001 && node server.js\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down SafeTx backend...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n👋 Received SIGTERM, shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
