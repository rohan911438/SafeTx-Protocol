import { useEffect, useState } from "react";
import { Activity, Zap, Clock, CheckCircle, Layers, Box, Server, Coins, Users } from "lucide-react";
import { StatusBanner } from "@/components/StatusBanner";
import { MetricsCard } from "@/components/MetricsCard";
import { MultiChart } from "@/components/MultiChart";
import { DetailedTransactionTable } from "@/components/DetailedTransactionTable";
import { BlockMonitor } from "@/components/BlockMonitor";
import { ValidatorStats } from "@/components/ValidatorStats";
import { AlertSystem } from "@/components/AlertSystem";
import { NetworkTimeline } from "@/components/NetworkTimeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SafeTxPanel } from "@/components/SafeTxPanel";
import mockDataRaw from "@/data/mockMetrics.json";
import { getStoredPubkey } from "@/lib/wallet";
import { fetchMetrics, retryPendingTransactions, flushQueue, type MetricsData, subscribeMagicblockSSE, mapMagicblockToMetricsData, getMagicblockHealth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const mockData = mockDataRaw as MetricsData;

const Index = () => {
  const [metrics, setMetrics] = useState(mockData);
  const [useLiveData, setUseLiveData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const { toast } = useToast();
  const [blockHeight, setBlockHeight] = useState(metrics.latest_slot - 1);
  const [epoch, setEpoch] = useState(532);
  const [networkCapacity, setNetworkCapacity] = useState(82);
  const [activeValidators, setActiveValidators] = useState(1852);
  const [successRateHistory, setSuccessRateHistory] = useState([98.2, 98.5, 97.9, 98.8, 98.1, 98.4]);
  const [slotTimeHistory, setSlotTimeHistory] = useState([0.41, 0.39, 0.43, 0.38, 0.44, 0.42]);
  const [autoRetry, setAutoRetry] = useState(true);
  const [useSSE, setUseSSE] = useState(false);
  const [magicblockStatus, setMagicblockStatus] = useState<'connected'|'error'|'disconnected'>('disconnected');
  const [lastMBRoute, setLastMBRoute] = useState<string | null>(null);

  const [alerts, setAlerts] = useState([
    {
      id: "1",
      type: "warning" as const,
      message: "Network congestion detected in slots 245789200-245789210",
      timestamp: "2 minutes ago",
    },
    {
      id: "2",
      type: "info" as const,
      message: "Epoch 532 started successfully with 1852 active validators",
      timestamp: "15 minutes ago",
    },
  ]);

  const blocks = [
    {
      height: blockHeight,
      hash: "9Kx7s...4Lp2",
      timestamp: "2s ago",
      transactions: 248,
      validator: "Val8x...K2p",
      slot: 245789235,
    },
    {
      height: blockHeight - 1,
      hash: "7Hd2p...9Xm4",
      timestamp: "4s ago",
      transactions: 312,
      validator: "Val3c...N7q",
      slot: 245789234,
    },
    {
      height: blockHeight - 2,
      hash: "5Qn8r...2Bv7",
      timestamp: "6s ago",
      transactions: 195,
      validator: "Val9z...P4k",
      slot: 245789233,
    },
  ];

  const timelineEvents = [
    { time: "2m ago", event: "Network congestion cleared - TPS normalized", type: "success" as const },
    { time: "5m ago", event: "High queue size detected (12 pending)", type: "warning" as const },
    { time: "8m ago", event: "Validator Val3c...N7q joined the network", type: "info" as const },
    { time: "15m ago", event: "Epoch 532 commenced", type: "success" as const },
    { time: "18m ago", event: "Block production rate optimized", type: "info" as const },
  ];

  const detailedTransactions = [
    {
      tx_id: "4Ghs1..K7X",
      status: "queued" as const,
      time: "12:45:20",
      type: "Transfer",
      fee: "0.000005 SOL",
      sender: "7Xk2p...9Bv3",
    },
    {
      tx_id: "5Nxy3..T2A",
      status: "processed" as const,
      time: "12:44:15",
      type: "Smart Contract",
      fee: "0.000012 SOL",
      sender: "3Mn7q...4Lp8",
    },
    {
      tx_id: "9Zae7..L0F",
      status: "queued" as const,
      time: "12:43:02",
      type: "Transfer",
      fee: "0.000005 SOL",
      sender: "2Qw9r...8Xm2",
    },
    {
      tx_id: "2Bsd4..W8P",
      status: "processed" as const,
      time: "12:41:58",
      type: "NFT Mint",
      fee: "0.000008 SOL",
      sender: "6Kp3n...5Tv7",
    },
    {
      tx_id: "7Lpr8..Z3D",
      status: "failed" as const,
      time: "12:40:50",
      type: "Transfer",
      fee: "0.000005 SOL",
      sender: "9Hd8m...3Bq4",
    },
  ];

  useEffect(() => {
    // Fetch live metrics from backend (polling)
    const loadMetrics = async () => {
      if (!useLiveData || useSSE) {
        setBackendConnected(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchMetrics();
        setMetrics(data);
        setBlockHeight(data.latest_slot - 1);
        setBackendConnected(true);
        
        // Update history arrays
        setSuccessRateHistory(prev => {
          const newHistory = [...prev, data.success_rate];
          return newHistory.slice(-6);
        });
        setSlotTimeHistory(prev => {
          const newHistory = [...prev, data.slot_time];
          return newHistory.slice(-6);
        });
        
        // Clear error on successful fetch
        if (error) {
          toast({
            title: "✅ Backend Connected",
            description: "Successfully connected to SafeTx backend.",
          });
        }
      } catch (err: any) {
        console.error('Failed to fetch metrics:', err);
        setError(err.message);
        setBackendConnected(false);
        
        // Only show toast on first error or after successful connection
        if (!error) {
          toast({
            title: "Backend Connection Error",
            description: "Unable to fetch live data. Make sure backend is running on port 5000.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [useLiveData, useSSE, toast, error]);

  // MagicBlock SSE subscription
  useEffect(() => {
    if (!useSSE) return;

    // initial health check (non-blocking)
    getMagicblockHealth().then((h) => {
      if (h?.magicblock?.routesAvailable > 0) {
        setMagicblockStatus(h.magicblock.status || 'connected');
      }
    }).catch(() => {});

    const unsubscribe = subscribeMagicblockSSE((mb) => {
      setMetrics((prev) => mapMagicblockToMetricsData(mb, prev));
      setBackendConnected(true);
      setMagicblockStatus((mb.magicblockStatus as any) || 'connected');
      setLastMBRoute(mb.lastMagicBlockRoute ?? null);

      // update derived histories
      setSuccessRateHistory(prev => {
        const val = typeof mb.successRate === 'number' ? mb.successRate : prev[prev.length - 1];
        const arr = [...prev, val];
        return arr.slice(-6);
      });
      setSlotTimeHistory(prev => {
        const val = typeof mb.slotTime === 'number' ? mb.slotTime : prev[prev.length - 1];
        const arr = [...prev, val];
        return arr.slice(-6);
      });
    }, (err) => {
      console.error('SSE error:', err);
      setMagicblockStatus('error');
      setBackendConnected(false);
    });

    return () => {
      unsubscribe?.();
      setMagicblockStatus('disconnected');
      setBackendConnected(false);
    };
  }, [useSSE]);

  const handleRetryNow = async () => {
    try {
      await retryPendingTransactions();
      toast({
        title: "Transactions Retried",
        description: `Retrying ${metrics.queue_size} pending transactions.`,
      });
      // Refresh metrics
      const data = await fetchMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error('Retry failed:', err);
      toast({
        title: "Retry Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleFlushQueue = async () => {
    try {
      await flushQueue();
      toast({
        title: "Queue Flushed",
        description: `Removed ${metrics.queue_size} transactions from queue.`,
      });
      // Refresh metrics
      const data = await fetchMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error('Flush failed:', err);
      toast({
        title: "Flush Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getMetricStatus = (metricName: string, value: number): "green" | "yellow" | "red" => {
    switch (metricName) {
      case "tps":
        if (value > 1200) return "green";
        if (value > 800) return "yellow";
        return "red";
      case "slot_time":
        if (value < 0.45) return "green";
        if (value < 0.6) return "yellow";
        return "red";
      case "success_rate":
        if (value > 97) return "green";
        if (value > 93) return "yellow";
        return "red";
      case "queue_size":
        if (value < 5) return "green";
        if (value < 10) return "yellow";
        return "red";
      default:
        return "green";
    }
  };

  const healthScore = (() => {
    // Simple composite score: TPS weight 0.4, success rate 0.4, slot time inverse 0.2, penalties for queue
    const tpsNorm = Math.min(metrics.tps / 1500, 1);
    const successNorm = Math.min(metrics.success_rate / 100, 1);
    const slotNorm = Math.max(0, 1 - (metrics.slot_time - 0.4)); // optimal around 0.4s
    const base = tpsNorm * 0.4 + successNorm * 0.4 + slotNorm * 0.2;
    const penalty = Math.min(metrics.queue_size / 20, 0.25);
    return Math.max(0, Math.min(100, Math.round((base - penalty) * 100)));
  })();

  const walletKey = getStoredPubkey();
  const shortKey = walletKey ? `${walletKey.slice(0, 4)}...${walletKey.slice(-4)}` : undefined;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Compact Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 border border-border/50 rounded-xl bg-card/50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="font-semibold tracking-wide">SafeTx Dashboard</span>
            {useLiveData && backendConnected && (
              <span className="text-xs px-2 py-0.5 rounded bg-success/20 text-success border border-success/40 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                LIVE
              </span>
            )}
            {useLiveData && !backendConnected && !isLoading && (
              <span className="text-xs px-2 py-0.5 rounded bg-destructive/20 text-destructive border border-destructive/40">
                DISCONNECTED
              </span>
            )}
            {isLoading && <span className="text-xs text-muted-foreground animate-pulse">Updating...</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseLiveData(!useLiveData)}
              className={`text-xs px-3 py-1 rounded border transition-colors ${
                useLiveData 
                  ? 'border-success/40 bg-success/10 hover:bg-success/20' 
                  : 'border-border hover:bg-accent/10'
              }`}
            >
              {useLiveData ? '📡 Live Data' : '🔄 Mock Data'}
            </button>
            <button
              onClick={() => setUseSSE((v) => !v)}
              className={`text-xs px-3 py-1 rounded border transition-colors ${
                useSSE 
                  ? 'border-primary/40 bg-primary/10 hover:bg-primary/20' 
                  : 'border-border hover:bg-accent/10'
              }`}
              title="Toggle real-time streaming via MagicBlock SSE"
            >
              {useSSE ? '⚡ SSE ON' : 'SSE OFF'}
            </button>
            <span className={`text-xs px-2 py-1 rounded-full border font-mono ${
              healthScore > 85 ? 'border-success/40 text-success' : healthScore > 65 ? 'border-warning/40 text-warning' : 'border-destructive/40 text-destructive'
            }`}>
              Health {healthScore}/100
            </span>
            {shortKey && (
              <span className="text-xs text-muted-foreground font-mono">{shortKey}</span>
            )}
          </div>
        </div>

        {error && !backendConnected && useLiveData && !useSSE && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold mb-1">⚠️ Backend Connection Error</p>
              <p className="text-xs opacity-90">Make sure the backend server is running:</p>
              <code className="text-xs block mt-2 p-2 bg-background/50 rounded">
                cd safetx-backend && node server.js
              </code>
            </div>
            <button
              onClick={() => {
                setError(null);
                setUseLiveData(false);
                setTimeout(() => setUseLiveData(true), 100);
              }}
              className="ml-3 px-3 py-1 text-xs rounded border border-destructive/40 hover:bg-destructive/20 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* MagicBlock status chip */}
        {useSSE && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`px-2 py-0.5 rounded border ${
              magicblockStatus === 'connected' ? 'border-success/40 text-success' : magicblockStatus === 'error' ? 'border-destructive/40 text-destructive' : 'border-border'
            }`}>
              MagicBlock: {magicblockStatus}
            </span>
            {lastMBRoute && (
              <span className="px-2 py-0.5 rounded border border-border/50 truncate max-w-[320px]" title={lastMBRoute}>
                {lastMBRoute}
              </span>
            )}
          </div>
        )}

        {/* Status Banner */}
        <StatusBanner status={metrics.network_status as "green" | "yellow" | "red"} />

        {/* Alert System */}
        <AlertSystem
          alerts={alerts}
          onDismiss={(id) => setAlerts(alerts.filter((a) => a.id !== id))}
        />

        {/* SafeTx Panel */}
        <SafeTxPanel
          queueSize={metrics.queue_size}
          retryCount={metrics.retry_count}
          latestSlot={metrics.latest_slot}
          currentLeader={metrics.current_leader}
          autoRetry={autoRetry}
          onToggleAutoRetry={setAutoRetry}
          onRetryNow={handleRetryNow}
          onFlushQueue={handleFlushQueue}
        />

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Transactions/Sec"
            value={metrics.tps}
            unit="TPS"
            icon={Zap}
            status={getMetricStatus("tps", metrics.tps)}
          />
          <MetricsCard
            title="Slot Time"
            value={metrics.slot_time}
            unit="ms"
            icon={Clock}
            status={getMetricStatus("slot_time", metrics.slot_time)}
          />
          <MetricsCard
            title="Success Rate"
            value={metrics.success_rate}
            unit="%"
            icon={CheckCircle}
            status={getMetricStatus("success_rate", metrics.success_rate)}
          />
          <MetricsCard
            title="Queue Size"
            value={metrics.queue_size}
            icon={Layers}
            status={getMetricStatus("queue_size", metrics.queue_size)}
          />
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Block Height"
            value={blockHeight.toLocaleString()}
            icon={Box}
            status="green"
          />
          <MetricsCard
            title="Current Epoch"
            value={epoch}
            icon={Activity}
            status="green"
          />
          <MetricsCard
            title="Network Capacity"
            value={networkCapacity}
            unit="%"
            icon={Server}
            status={networkCapacity > 85 ? "yellow" : "green"}
          />
          <MetricsCard
            title="Active Validators"
            value={activeValidators.toLocaleString()}
            icon={Users}
            status="green"
          />
        </div>

        {/* Charts and Analytics */}
        <MultiChart
          tpsData={metrics.tps_history}
          successRateData={successRateHistory}
          slotTimeData={slotTimeHistory}
        />

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transaction Explorer</TabsTrigger>
            <TabsTrigger value="blocks">Block Monitor</TabsTrigger>
            <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-6">
            <DetailedTransactionTable transactions={detailedTransactions} />
          </TabsContent>

          <TabsContent value="blocks" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BlockMonitor blocks={blocks} />
              </div>
              <div>
                <ValidatorStats
                  activeValidators={activeValidators}
                  totalValidators={2100}
                  averageStake="1.2M SOL"
                  topValidatorPerformance={99.8}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <NetworkTimeline events={timelineEvents} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border/50 mt-12">
          <p className="text-sm text-muted-foreground">
            Built with ❤️ for Solana builders
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by Solana Testnet • Real-time Network Monitoring & Analytics
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
