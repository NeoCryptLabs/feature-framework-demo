export interface DashboardStats {
  totalVisitors: number
  totalPageViews: number
  bounceRate: number
  avgDuration: number
  visitorsChange: number
  pageViewsChange: number
  bounceRateChange: number
  durationChange: number
}

export interface ChartDataPoint {
  date: string
  value: number
}

export interface TrafficSource {
  source: string
  count: number
  percentage: number
}

export interface TopPage {
  path: string
  views: number
  uniqueVisitors: number
}

export interface DateRange {
  from: Date
  to: Date
}
