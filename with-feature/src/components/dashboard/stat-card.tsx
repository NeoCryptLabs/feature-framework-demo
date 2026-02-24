import { type LucideIcon, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string
  change: number
  icon: LucideIcon
  invertColor?: boolean
}

export function StatCard({ title, value, change, icon: Icon, invertColor = false }: StatCardProps) {
  const isPositive = invertColor ? change <= 0 : change >= 0

  return (
    <Card>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{value}</p>
          <div className="mt-1 flex items-center text-xs">
            {isPositive ? (
              <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={isPositive ? "text-green-500" : "text-red-500"}>
              {Math.abs(change)}%
            </span>
            <span className="ml-1 text-muted-foreground">vs last 30 days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
