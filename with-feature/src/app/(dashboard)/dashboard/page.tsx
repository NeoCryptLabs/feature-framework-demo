import { Users, Eye, Timer, MousePointerClick } from "lucide-react"
import {
  getDashboardStats,
  getVisitorsOverTime,
  getTrafficSources,
  getTopPages,
} from "@/actions/dashboard"
import { StatCard } from "@/components/dashboard/stat-card"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { TrafficSources } from "@/components/dashboard/traffic-sources"
import { TopPages } from "@/components/dashboard/top-pages"

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

export default async function DashboardPage() {
  const [stats, visitorsOverTime, trafficSources, topPages] =
    await Promise.all([
      getDashboardStats(),
      getVisitorsOverTime(),
      getTrafficSources(),
      getTopPages(),
    ])

  const chartData = visitorsOverTime.map((d) => ({
    date: d.date,
    visitors: d.value,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Visitors"
          value={stats.totalVisitors.toLocaleString()}
          change={stats.visitorsChange}
          icon={Users}
        />
        <StatCard
          title="Page Views"
          value={stats.totalPageViews.toLocaleString()}
          change={stats.pageViewsChange}
          icon={Eye}
        />
        <StatCard
          title="Bounce Rate"
          value={`${stats.bounceRate}%`}
          change={stats.bounceRateChange}
          icon={MousePointerClick}
          invertColor
        />
        <StatCard
          title="Avg. Duration"
          value={formatDuration(stats.avgDuration)}
          change={stats.durationChange}
          icon={Timer}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OverviewChart data={chartData} />
        <TrafficSources data={trafficSources} />
      </div>

      <TopPages data={topPages} />
    </div>
  )
}
