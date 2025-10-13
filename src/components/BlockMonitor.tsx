import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Box, Clock, User } from "lucide-react";

interface Block {
  height: number;
  hash: string;
  timestamp: string;
  transactions: number;
  validator: string;
  slot: number;
}

interface BlockMonitorProps {
  blocks: Block[];
}

export const BlockMonitor = ({ blocks }: BlockMonitorProps) => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-accent/20 border-2 glow-accent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Box className="h-5 w-5" />
          Live Block Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-accent/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-accent/20 text-accent border-accent/40 font-mono">
                    #{block.height}
                  </Badge>
                  <code className="text-xs text-muted-foreground">
                    {block.hash}
                  </code>
                </div>
                <Badge variant="outline" className="text-xs">
                  Slot {block.slot}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">{block.timestamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-secondary" />
                  <span className="text-foreground font-medium">{block.transactions} txs</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground text-xs">{block.validator}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
