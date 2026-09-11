import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalysisResult } from "../../lib/types";
import { Card, Kicker } from "../ui";

const seriesColors = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)", "var(--series-5)", "var(--series-6)", "var(--series-7)", "var(--series-8)"];

const tooltipStyle = {
  background: "var(--chart-tooltip-bg)",
  border: "1px solid var(--chart-tooltip-border)",
  borderRadius: 10,
  color: "var(--text-primary)",
  fontSize: 13
};

export function SignalChart({ result }: { result: AnalysisResult }) {
  const chartData = result.charts.labels.map((label, index) => ({ label, value: result.charts.scores[index] }));

  return (
    <Card className="p-5">
      <Kicker>Signal map</Kicker>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="analysisGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="label" tick={{ fill: "var(--chart-axis)", fontSize: 12 }} />
            <YAxis tick={{ fill: "var(--chart-axis)", fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke="var(--series-1)" fill="url(#analysisGradient)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function RiskDistributionChart({ result }: { result: AnalysisResult }) {
  const chartData = result.charts.labels.map((label, index) => ({ label, value: result.charts.scores[index] }));

  return (
    <Card className="p-5">
      <Kicker>Risk distribution</Kicker>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie dataKey="value" data={chartData.map((point) => ({ name: point.label, value: point.value }))} innerRadius={60} outerRadius={98} paddingAngle={2} stroke="var(--surface)" strokeWidth={2}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={seriesColors[index % seriesColors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: "var(--text-muted)", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
