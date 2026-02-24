"use server"

import { db } from "@/lib/db"
import { getAuth } from "@/lib/auth"

interface AnalyticsData {
  pageViewsOverTime: { date: string; count: number }[]
  devices: { name: string; count: number }[]
  browsers: { name: string; count: number }[]
  countries: { country: string; visitors: number; percentage: number }[]
  summary: {
    totalPageViews: number
    totalSessions: number
    uniqueVisitors: number
  }
}

export async function getAnalyticsData(
  startDate: string,
  endDate: string
): Promise<AnalyticsData> {
  const session = await getAuth()
  if (!session?.user) throw new Error("Not authenticated")

  const from = new Date(startDate)
  const to = new Date(endDate)

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new Error("Invalid date range")
  }

  // Set to end of day
  to.setHours(23, 59, 59, 999)

  // Page views over time
  const pageViews = await db.pageView.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: { createdAt: true },
  })

  const pvByDay = new Map<string, number>()
  for (const pv of pageViews) {
    const dateKey = pv.createdAt.toISOString().split("T")[0]
    pvByDay.set(dateKey, (pvByDay.get(dateKey) ?? 0) + 1)
  }

  // Build all days in range
  const pageViewsOverTime: { date: string; count: number }[] = []
  const currentDate = new Date(from)
  while (currentDate <= to) {
    const dateKey = currentDate.toISOString().split("T")[0]
    pageViewsOverTime.push({
      date: dateKey,
      count: pvByDay.get(dateKey) ?? 0,
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Sessions in range with visitor info
  const sessions = await db.session.findMany({
    where: { startedAt: { gte: from, lte: to } },
    select: {
      visitorId: true,
      visitor: {
        select: { device: true, browser: true, country: true },
      },
    },
  })

  // Unique visitors for device/browser/country breakdown
  const uniqueVisitorMap = new Map<
    string,
    { device: string; browser: string; country: string }
  >()
  for (const s of sessions) {
    if (!uniqueVisitorMap.has(s.visitorId)) {
      uniqueVisitorMap.set(s.visitorId, s.visitor)
    }
  }
  const uniqueVisitors = Array.from(uniqueVisitorMap.values())

  // Device breakdown
  const deviceCounts = new Map<string, number>()
  for (const v of uniqueVisitors) {
    deviceCounts.set(v.device, (deviceCounts.get(v.device) ?? 0) + 1)
  }
  const devices = Array.from(deviceCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Browser breakdown
  const browserCounts = new Map<string, number>()
  for (const v of uniqueVisitors) {
    browserCounts.set(v.browser, (browserCounts.get(v.browser) ?? 0) + 1)
  }
  const browsers = Array.from(browserCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Country breakdown
  const countryCounts = new Map<string, number>()
  for (const v of uniqueVisitors) {
    countryCounts.set(v.country, (countryCounts.get(v.country) ?? 0) + 1)
  }
  const totalVisitorCount = uniqueVisitors.length
  const countries = Array.from(countryCounts.entries())
    .map(([country, visitors]) => ({
      country,
      visitors,
      percentage:
        totalVisitorCount > 0
          ? Math.round((visitors / totalVisitorCount) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors)

  return {
    pageViewsOverTime,
    devices,
    browsers,
    countries,
    summary: {
      totalPageViews: pageViews.length,
      totalSessions: sessions.length,
      uniqueVisitors: totalVisitorCount,
    },
  }
}
