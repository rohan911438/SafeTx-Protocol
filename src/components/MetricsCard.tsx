import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  status: "green" | "yellow" | "red";
}

export const MetricsCard = ({ title, value, unit, icon: Icon, status }: MetricsCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "green":
        return "text-success border-success/30 glow-success";
      case "yellow":
        return "text-warning border-warning/30 glow-warning";
      case "red":
        return "text-destructive border-destructive/30 glow-danger";
    }
  };

  const statusColor = getStatusColor();

  return (
    <Card className={`${statusColor} bg-card/50 backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 hover:brightness-110`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusColor.split(' ')[0].replace('text-', 'bg-')} animate-pulse-glow`} />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <Icon className={`h-5 w-5 ${statusColor.split(' ')[0]}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">
            {value}
          </span>
          {unit && (
            <span className="text-xl text-muted-foreground font-medium">
              {unit}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
