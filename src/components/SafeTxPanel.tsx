import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Layers, RotateCw, ShieldCheck, Zap, User } from "lucide-react";

interface SafeTxPanelProps {
  queueSize: number;
  retryCount: number;
  latestSlot: number;
  currentLeader: string;
  autoRetry: boolean;
  onToggleAutoRetry: (value: boolean) => void;
  onRetryNow: () => void;
  onFlushQueue: () => void;
}

export const SafeTxPanel = ({
  queueSize,
  retryCount,
  latestSlot,
  currentLeader,
  autoRetry,
  onToggleAutoRetry,
  onRetryNow,
  onFlushQueue,
}: SafeTxPanelProps) => {
  const queueSeverity = queueSize < 5 ? "success" : queueSize < 10 ? "warning" : "destructive";

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 border-2 glow-primary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            SafeTx Control Panel
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Auto-Retry</span>
            <Switch checked={autoRetry} onCheckedChange={onToggleAutoRetry} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Layers className="h-4 w-4 text-secondary" />
              Queue Size
            </div>
            <Badge className={`font-mono ${
              queueSeverity === 'success' ? 'bg-success/20 text-success border-success/40' :
              queueSeverity === 'warning' ? 'bg-warning/20 text-warning border-warning/40' :
              'bg-destructive/20 text-destructive border-destructive/40'
            }`}>{queueSize}</Badge>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <RotateCw className="h-4 w-4 text-accent" />
              Retry Count
            </div>
            <Badge variant="outline" className="font-mono">{retryCount}</Badge>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Zap className="h-4 w-4 text-primary" />
              Latest Slot
            </div>
            <Badge variant="outline" className="font-mono">{latestSlot.toLocaleString()}</Badge>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <User className="h-4 w-4 text-secondary" />
              Current Leader
            </div>
            <code className="text-xs text-muted-foreground">{currentLeader}</code>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="default" onClick={onRetryNow} className="gap-2">
            <RotateCw className="h-4 w-4" /> Retry Pending
          </Button>
          <Button size="sm" variant="outline" onClick={onFlushQueue} className="gap-2">
            <Layers className="h-4 w-4" /> Flush Queue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
