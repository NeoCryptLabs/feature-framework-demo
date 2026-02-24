"use client"

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface TrafficSourcesProps {
  data: { source: string; count: number; percentage: number }[]
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function TrafficSources({ data }: TrafficSourcesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(props) =>
                  `${props.name ?? ""} (${((props.percent ?? 0) * 100).toFixed(1)}%)`
                }
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
