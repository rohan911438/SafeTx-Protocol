import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Activity, TrendingUp, PieChart } from "lucide-react";

interface MultiChartProps {
  tpsData: number[];
  successRateData: number[];
  slotTimeData: number[];
}

export const MultiChart = ({ tpsData, successRateData, slotTimeData }: MultiChartProps) => {
  const tpsChartData = tpsData.map((value, index) => ({
    time: `T-${tpsData.length - index}`,
    tps: value,
  }));

  const successChartData = successRateData.map((value, index) => ({
    time: `T-${successRateData.length - index}`,
    rate: value,
  }));

  const slotChartData = slotTimeData.map((value, index) => ({
    time: `T-${slotTimeData.length - index}`,
    ms: value,
  }));

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 border-2 glow-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Activity className="h-5 w-5" />
          Network Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tps" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="tps">TPS Trend</TabsTrigger>
            <TabsTrigger value="success">Success Rate</TabsTrigger>
            <TabsTrigger value="slot">Slot Time</TabsTrigger>
          </TabsList>

          <TabsContent value="tps">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tpsChartData}>
                <defs>
                  <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--primary))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tps"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#tpsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="success">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={successChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                <YAxis domain={[90, 100]} stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--success))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--success))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--success))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="slot">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={slotChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--secondary))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="ms" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
