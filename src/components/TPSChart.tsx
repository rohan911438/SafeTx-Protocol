import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface TPSChartProps {
  data: number[];
}

export const TPSChart = ({ data }: TPSChartProps) => {
  const chartData = data.map((value, index) => ({
    time: `T-${data.length - index}`,
    tps: value,
  }));

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 border-2 glow-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <TrendingUp className="h-5 w-5" />
          TPS Trend Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--primary))",
                borderRadius: "8px",
                boxShadow: "var(--glow-primary)",
              }}
            />
            <Line
              type="monotone"
              dataKey="tps"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--accent))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
