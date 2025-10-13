import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface Transaction {
  tx_id: string;
  status: "queued" | "processed" | "failed";
  time: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return (
          <Badge className="bg-success/20 text-success border-success/40 hover:bg-success/30">
            Processed
          </Badge>
        );
      case "queued":
        return (
          <Badge className="bg-warning/20 text-warning border-warning/40 hover:bg-warning/30">
            Queued
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/40 hover:bg-destructive/30">
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-secondary/20 border-2 glow-secondary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-secondary">
          <Clock className="h-5 w-5" />
          Recent Transaction Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <code className="text-sm font-mono text-foreground">
                  {tx.tx_id}
                </code>
                {getStatusBadge(tx.status)}
              </div>
              <span className="text-sm text-muted-foreground font-mono">
                {tx.time}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
