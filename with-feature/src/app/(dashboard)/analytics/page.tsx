import { Suspense } from "react"
import { getAnalyticsData } from "@/actions/analytics"
import { DateRangePicker } from "@/components/analytics/date-range-picker"
import { PageViewsChart } from "@/components/analytics/page-views-chart"
import { DevicesChart } from "@/components/analytics/devices-chart"
import { CountriesTable } from "@/components/analytics/countries-table"

interface AnalyticsPageProps {
  searchParams: Promise<{ from?: string; to?: string }>
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const params = await searchParams

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const from = params.from ?? thirtyDaysAgo.toISOString().split("T")[0]
  const to = params.to ?? now.toISOString().split("T")[0]

  const data = await getAnalyticsData(from, to)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Suspense>
          <DateRangePicker from={from} to={to} />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <p className="text-sm text-muted-foreground">Total Page Views</p>
          <p className="mt-1 text-2xl font-bold">
            {data.summary.totalPageViews.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <p className="text-sm text-muted-foreground">Total Sessions</p>
          <p className="mt-1 text-2xl font-bold">
            {data.summary.totalSessions.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <p className="text-sm text-muted-foreground">Unique Visitors</p>
          <p className="mt-1 text-2xl font-bold">
            {data.summary.uniqueVisitors.toLocaleString()}
          </p>
        </div>
      </div>

      <PageViewsChart data={data.pageViewsOverTime} />

      <div className="grid gap-4 lg:grid-cols-2">
        <DevicesChart data={data.devices} />
        <CountriesTable data={data.countries} />
      </div>
    </div>
  )
}
