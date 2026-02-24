"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PageViewsChartProps {
  data: { date: string; count: number }[]
}

export function PageViewsChart({ data }: PageViewsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Views</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value: string) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
                className="text-muted-foreground"
              />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                labelFormatter={(value) => {
                  const date = new Date(String(value))
                  return date.toLocaleDateString()
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
