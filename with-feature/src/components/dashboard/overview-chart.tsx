"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
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

interface OverviewChartProps {
  data: { date: string; visitors: number }[]
}

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
