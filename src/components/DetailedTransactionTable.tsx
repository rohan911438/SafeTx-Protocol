import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Search, ArrowUpDown, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Transaction {
  tx_id: string;
  status: "queued" | "processed" | "failed";
  time: string;
  type: string;
  fee: string;
  sender: string;
}

interface DetailedTransactionTableProps {
  transactions: Transaction[];
}

export const DetailedTransactionTable = ({ transactions }: DetailedTransactionTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return (
          <Badge className="bg-success/20 text-success border-success/40 hover:bg-success/30">
            ✓ Processed
          </Badge>
        );
      case "queued":
        return (
          <Badge className="bg-warning/20 text-warning border-warning/40 hover:bg-warning/30">
            ⏳ Queued
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/40 hover:bg-destructive/30">
            ✗ Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter((tx) =>
    tx.tx_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-secondary/20 border-2 glow-secondary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-secondary">
            <Clock className="h-5 w-5" />
            Transaction Explorer
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => console.log("Export transactions")}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by transaction ID or sender..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            filteredTransactions.map((tx, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-secondary/50 transition-all duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                    <code className="text-sm font-mono text-foreground">{tx.tx_id}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(tx.status)}
                    <span className="text-sm text-muted-foreground font-mono">{tx.time}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/30">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <Badge variant="outline" className="text-xs">{tx.type}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fee</p>
                    <p className="text-sm font-medium text-primary">{tx.fee}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sender</p>
                    <code className="text-xs text-muted-foreground">{tx.sender}</code>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
