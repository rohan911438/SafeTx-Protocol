import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import { useState } from "react";

interface Alert {
  id: string;
  type: "info" | "warning" | "success";
  message: string;
  timestamp: string;
}

interface AlertSystemProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
}

export const AlertSystem = ({ alerts, onDismiss }: AlertSystemProps) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case "warning":
        return "border-warning/40 bg-warning/10";
      case "success":
        return "border-success/40 bg-success/10";
      default:
        return "border-primary/40 bg-primary/10";
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 border-2 glow-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <AlertTriangle className="h-5 w-5" />
          System Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
              <p>No active alerts. All systems operational.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-2 ${getAlertStyle(alert.type)} transition-all duration-300`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.timestamp}
                      </p>
                    </div>
                  </div>
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
