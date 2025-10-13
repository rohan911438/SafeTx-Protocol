import { Activity } from "lucide-react";

interface StatusBannerProps {
  status: "green" | "yellow" | "red";
}

export const StatusBanner = ({ status }: StatusBannerProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "green":
        return {
          text: "Network Operating Normally",
          bgClass: "bg-success/10 border-success/30",
          textClass: "text-success",
          glowClass: "glow-success",
        };
      case "yellow":
        return {
          text: "Moderate Network Congestion",
          bgClass: "bg-warning/10 border-warning/30",
          textClass: "text-warning",
          glowClass: "glow-warning",
        };
      case "red":
        return {
          text: "High Network Congestion - Delays Expected",
          bgClass: "bg-destructive/10 border-destructive/30",
          textClass: "text-destructive",
          glowClass: "glow-danger",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`${config.bgClass} ${config.glowClass} border-2 rounded-2xl p-6 mb-8 transition-all duration-500`}
    >
      <div className="flex items-center justify-center gap-3">
        <Activity className={`${config.textClass} h-6 w-6 animate-pulse`} />
        <span className={`${config.textClass} text-lg font-bold tracking-wide uppercase`}>
          {config.text}
        </span>
      </div>
    </div>
  );
};
