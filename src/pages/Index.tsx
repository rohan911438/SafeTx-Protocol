import { useEffect, useState } from "react";
import { Activity, Zap, Clock, CheckCircle, Layers } from "lucide-react";
import { StatusBanner } from "@/components/StatusBanner";
import { MetricsCard } from "@/components/MetricsCard";
import { TPSChart } from "@/components/TPSChart";
import { TransactionTable } from "@/components/TransactionTable";
import mockDataRaw from "@/data/mockMetrics.json";

interface MetricsData {
  tps: number;
  slot_time: number;
  success_rate: number;
  queue_size: number;
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

  useEffect(() => {
    // Simulate live updates every 3 seconds
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        tps: Math.floor(1000 + Math.random() * 500),
        slot_time: Number((0.3 + Math.random() * 0.3).toFixed(2)),
        success_rate: Number((95 + Math.random() * 4).toFixed(1)),
        queue_size: Math.floor(Math.random() * 10),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              SafeTx Protocol
            </h1>
          </div>
          <p className="text-xl text-muted-foreground tracking-wide">
            Solana Network Health Monitor
          </p>
          <p className="text-sm text-accent uppercase tracking-widest font-bold">
            Testnet Prototype Dashboard
          </p>
        </div>

        {/* Status Banner */}
        <StatusBanner status={metrics.network_status as "green" | "yellow" | "red"} />

        {/* Metrics Grid */}
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

        {/* Chart Section */}
        <TPSChart data={metrics.tps_history} />

        {/* Transaction Activity Feed */}
        <TransactionTable transactions={metrics.recent_transactions} />

        {/* Footer */}
        <div className="text-center py-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Built for{" "}
            <span className="text-primary font-bold">Cyberpunk Solana Hackathon 2025</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by Solana Testnet • Real-time Network Monitoring
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
