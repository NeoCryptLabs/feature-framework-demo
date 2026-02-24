"use server"

import { db } from "@/lib/db"
import { getAuth } from "@/lib/auth"
import type {
  DashboardStats,
  ChartDataPoint,
  TrafficSource,
  TopPage,
} from "@/types"

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await getAuth()
  if (!session?.user) throw new Error("Not authenticated")

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const [currentSessions, priorSessions, currentVisitors, priorVisitors, currentPageViews, priorPageViews] =
    await Promise.all([
      db.session.findMany({
        where: { startedAt: { gte: thirtyDaysAgo } },
        include: { _count: { select: { pageViews: true } } },
      }),
      db.session.findMany({
        where: { startedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        include: { _count: { select: { pageViews: true } } },
      }),
      db.session.findMany({
        where: { startedAt: { gte: thirtyDaysAgo } },
        select: { visitorId: true },
        distinct: ["visitorId"],
      }),
      db.session.findMany({
        where: { startedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        select: { visitorId: true },
        distinct: ["visitorId"],
      }),
      db.pageView.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      db.pageView.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
    ])

  const totalVisitors = currentVisitors.length
  const priorTotalVisitors = priorVisitors.length

  const totalPageViews = currentPageViews
  const priorTotalPageViews = priorPageViews

  // Bounce rate: sessions with only 1 page view / total sessions
  const currentBounceSessions = currentSessions.filter(
    (s) => s._count.pageViews === 1
  ).length
  const bounceRate =
    currentSessions.length > 0
      ? (currentBounceSessions / currentSessions.length) * 100
      : 0

  const priorBounceSessions = priorSessions.filter(
    (s) => s._count.pageViews === 1
  ).length
  const priorBounceRate =
    priorSessions.length > 0
      ? (priorBounceSessions / priorSessions.length) * 100
      : 0

  // Average session duration
  const avgDuration =
    currentSessions.length > 0
      ? currentSessions.reduce((sum, s) => sum + s.duration, 0) /
        currentSessions.length
      : 0

  const priorAvgDuration =
    priorSessions.length > 0
      ? priorSessions.reduce((sum, s) => sum + s.duration, 0) /
        priorSessions.length
      : 0

  const pctChange = (current: number, prior: number) =>
    prior === 0 ? (current > 0 ? 100 : 0) : ((current - prior) / prior) * 100

  return {
    totalVisitors,
    totalPageViews,
    bounceRate: Math.round(bounceRate * 10) / 10,
    avgDuration: Math.round(avgDuration),
    visitorsChange: Math.round(pctChange(totalVisitors, priorTotalVisitors) * 10) / 10,
    pageViewsChange: Math.round(pctChange(totalPageViews, priorTotalPageViews) * 10) / 10,
    bounceRateChange: Math.round((bounceRate - priorBounceRate) * 10) / 10,
    durationChange: Math.round(pctChange(avgDuration, priorAvgDuration) * 10) / 10,
  }
}

export async function getVisitorsOverTime(): Promise<ChartDataPoint[]> {
  const session = await getAuth()
  if (!session?.user) throw new Error("Not authenticated")

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  )

  const sessions = await db.session.findMany({
    where: { startedAt: { gte: thirtyDaysAgo } },
    select: { visitorId: true, startedAt: true },
  })

  // Group unique visitors by day
  const visitorsByDay = new Map<string, Set<string>>()

  for (const session of sessions) {
    const dateKey = session.startedAt.toISOString().split("T")[0]
    if (!visitorsByDay.has(dateKey)) {
      visitorsByDay.set(dateKey, new Set())
    }
    visitorsByDay.get(dateKey)!.add(session.visitorId)
  }

  // Build array for all 30 days
  const result: ChartDataPoint[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateKey = date.toISOString().split("T")[0]
    result.push({
      date: dateKey,
      value: visitorsByDay.get(dateKey)?.size ?? 0,
    })
  }

  return result
}

export async function getTrafficSources(): Promise<TrafficSource[]> {
  const session = await getAuth()
  if (!session?.user) throw new Error("Not authenticated")

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  )

  const pageViews = await db.pageView.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { referrer: true },
  })

  const sourceCounts = new Map<string, number>()
  for (const pv of pageViews) {
    const source = pv.referrer || "Direct"
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1)
  }

  const total = pageViews.length
  const sources: TrafficSource[] = Array.from(sourceCounts.entries())
    .map(([source, count]) => ({
      source,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)

  return sources
}

export async function getTopPages(): Promise<TopPage[]> {
  const session = await getAuth()
  if (!session?.user) throw new Error("Not authenticated")

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  )

  const pageViews = await db.pageView.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: {
      path: true,
      session: { select: { visitorId: true } },
    },
  })

  const pageStats = new Map<
    string,
    { views: number; visitors: Set<string> }
  >()

  for (const pv of pageViews) {
    if (!pageStats.has(pv.path)) {
      pageStats.set(pv.path, { views: 0, visitors: new Set() })
    }
    const stats = pageStats.get(pv.path)!
    stats.views++
    stats.visitors.add(pv.session.visitorId)
  }

  const topPages: TopPage[] = Array.from(pageStats.entries())
    .map(([path, stats]) => ({
      path,
      views: stats.views,
      uniqueVisitors: stats.visitors.size,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  return topPages
}
