import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Server, Award, Zap } from "lucide-react";

interface ValidatorStatsProps {
  activeValidators: number;
  totalValidators: number;
  averageStake: string;
  topValidatorPerformance: number;
}

export const ValidatorStats = ({
  activeValidators,
  totalValidators,
  averageStake,
  topValidatorPerformance,
}: ValidatorStatsProps) => {
  const activePercentage = (activeValidators / totalValidators) * 100;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-secondary/20 border-2 glow-secondary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-secondary">
          <Server className="h-5 w-5" />
          Validator Network Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active Validators</span>
            <span className="font-bold text-foreground">
              {activeValidators} / {totalValidators}
            </span>
          </div>
          <Progress value={activePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {activePercentage.toFixed(1)}% network participation
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground uppercase">Avg Stake</span>
            </div>
            <p className="text-xl font-bold text-foreground">{averageStake}</p>
          </div>

          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground uppercase">Top Performance</span>
            </div>
            <p className="text-xl font-bold text-success">{topValidatorPerformance}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
