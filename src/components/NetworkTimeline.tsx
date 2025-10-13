import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, TrendingUp } from "lucide-react";

interface TimelineEvent {
  time: string;
  event: string;
  type: "success" | "warning" | "info";
}

interface NetworkTimelineProps {
  events: TimelineEvent[];
}

export const NetworkTimeline = ({ events }: NetworkTimelineProps) => {
  const getEventColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-success border-success/40 bg-success/10";
      case "warning":
        return "text-warning border-warning/40 bg-warning/10";
      default:
        return "text-primary border-primary/40 bg-primary/10";
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-accent/20 border-2 glow-accent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <History className="h-5 w-5" />
          Network Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border/50" />

          {events.map((event, index) => (
            <div key={index} className="relative pl-12 pb-4">
              {/* Timeline dot */}
              <div
                className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 ${getEventColor(
                  event.type
                )} animate-pulse-glow`}
              />

              {/* Event content */}
              <div className={`p-3 rounded-lg border ${getEventColor(event.type)}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium flex-1">{event.event}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {event.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
