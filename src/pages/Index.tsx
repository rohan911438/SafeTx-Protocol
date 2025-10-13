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

interface MetricsData {
  tps: number;
  slot_time: number;
  success_rate: number;
  queue_size: number;
  retry_count: number;
  latest_slot: number;
  current_leader: string;
  network_status: "green" | "yellow" | "red";
  tps_history: number[];
  recent_transactions: Array<{
    tx_id: string;
    status: "queued" | "processed" | "failed";
    time: string;
  }>;
}

const mockData = mockDataRaw as MetricsData;

const Index = () => {
  const [metrics, setMetrics] = useState(mockData);
  const [blockHeight, setBlockHeight] = useState(metrics.latest_slot - 1);
  const [epoch, setEpoch] = useState(532);
  const [networkCapacity, setNetworkCapacity] = useState(82);
  const [activeValidators, setActiveValidators] = useState(1852);
  const [successRateHistory, setSuccessRateHistory] = useState([98.2, 98.5, 97.9, 98.8, 98.1, 98.4]);
  const [slotTimeHistory, setSlotTimeHistory] = useState([0.41, 0.39, 0.43, 0.38, 0.44, 0.42]);
  const [autoRetry, setAutoRetry] = useState(true);

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
    // Simulate live updates every 3 seconds
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const newQueue = Math.max(0, prev.queue_size + (Math.random() < 0.4 ? 1 : -1));
        const newRetry = autoRetry && newQueue > 0 ? prev.retry_count + Math.floor(Math.random() * 2) : prev.retry_count;
        const newLatestSlot = prev.latest_slot + 1;

        return {
          ...prev,
          tps: Math.floor(1000 + Math.random() * 500),
          slot_time: Number((0.3 + Math.random() * 0.3).toFixed(2)),
          success_rate: Number((95 + Math.random() * 4).toFixed(1)),
          queue_size: newQueue,
          retry_count: newRetry,
          latest_slot: newLatestSlot,
          current_leader: Math.random() < 0.1 ? `Val${Math.floor(Math.random()*9)}x...${Math.floor(Math.random()*9)}2p` : prev.current_leader,
        };
      });
      setBlockHeight((prev) => prev + 1);
      setNetworkCapacity(Math.floor(75 + Math.random() * 15));
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRetry]);

  const handleRetryNow = () => {
    setMetrics((prev) => ({
      ...prev,
      retry_count: prev.retry_count + prev.queue_size,
      queue_size: 0,
    }));
  };

  const handleFlushQueue = () => {
    setMetrics((prev) => ({
      ...prev,
      queue_size: 0,
    }));
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              SafeTx Protocol
            </h1>
          </div>
          <p className="text-xl text-muted-foreground tracking-wide">
            Testnet SafeTx — Detect congestion, queue transactions, auto-retry for smoother UX
          </p>
          <p className="text-sm text-accent uppercase tracking-widest font-bold">
            Prototype • Real-Time Analytics • SDK-ready
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Health Score</span>
            <span className={`text-xs px-2 py-1 rounded-full border font-mono ${
              healthScore > 85 ? 'border-success/40 text-success' : healthScore > 65 ? 'border-warning/40 text-warning' : 'border-destructive/40 text-destructive'
            }`}>
              {healthScore}/100
            </span>
          </div>
        </div>

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
            Built for{" "}
            <span className="text-primary font-bold">Cyberpunk Solana Hackathon 2025</span>
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
