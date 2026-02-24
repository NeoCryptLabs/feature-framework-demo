import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Role } from "../src/generated/prisma/enums"
import bcrypt from "bcryptjs"
import { subDays, addHours, addMinutes, startOfDay } from "date-fns"

const connectionString = process.env.DATABASE_URL!
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const countries = ["US", "UK", "DE", "FR", "JP", "BR", "CA", "AU", "IN", "NL"]
const browsers = ["Chrome", "Firefox", "Safari", "Edge"]
const devices = ["desktop", "mobile", "tablet"]
const deviceWeights = [0.6, 0.3, 0.1]
const operatingSystems: Record<string, string[]> = {
  desktop: ["Windows", "macOS", "Linux"],
  mobile: ["iOS", "Android"],
  tablet: ["iOS", "Android"],
}
const paths = ["/home", "/pricing", "/docs", "/blog", "/about", "/contact", "/features"]
const referrerOptions = [
  { value: null, weight: 0.4 },
  { value: "google", weight: 0.25 },
  { value: "twitter", weight: 0.1 },
  { value: "github", weight: 0.1 },
  { value: "linkedin", weight: 0.08 },
  { value: "newsletter", weight: 0.07 },
]

function weightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((sum, w) => sum + w, 0)
  let random = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) return items[i]
  }
  return items[items.length - 1]
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickReferrer(): string | null {
  const values = referrerOptions.map((r) => r.value)
  const weights = referrerOptions.map((r) => r.weight)
  return weightedRandom(values, weights)
}

async function main() {
  console.log("Seeding database...")

  // Clear existing data
  await prisma.pageView.deleteMany()
  await prisma.session.deleteMany()
  await prisma.visitor.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const hashedPassword = await bcrypt.hash("password", 10)
  await prisma.user.createMany({
    data: [
      { name: "Admin User", email: "admin@pulseboard.io", password: hashedPassword, role: Role.ADMIN },
      { name: "Viewer User", email: "viewer@pulseboard.io", password: hashedPassword, role: Role.VIEWER },
    ],
  })
  console.log("Created 2 users")

  // Create visitors
  const visitorData = Array.from({ length: 500 }, () => {
    const device = weightedRandom(devices, deviceWeights)
    const osList = operatingSystems[device]
    return {
      country: pickRandom(countries),
      browser: pickRandom(browsers),
      device,
      os: pickRandom(osList),
    }
  })

  await prisma.visitor.createMany({ data: visitorData })
  const visitors = await prisma.visitor.findMany({ select: { id: true } })
  console.log(`Created ${visitors.length} visitors`)

  // Create sessions spread over 30 days
  const now = new Date()
  const sessionRecords: Array<{
    visitorId: string
    duration: number
    startedAt: Date
    endedAt: Date
  }> = []

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const dayStart = startOfDay(subDays(now, dayOffset))
    const dayOfWeek = dayStart.getDay()
    const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6

    // More sessions on weekdays, slight growth trend over 30 days
    const growthFactor = 1 + (29 - dayOffset) * 0.01
    const baseCount = isWeekday ? 55 : 35
    const sessionCount = Math.round(baseCount * growthFactor + (Math.random() - 0.5) * 10)

    for (let i = 0; i < sessionCount; i++) {
      const visitor = pickRandom(visitors)
      const hour = Math.floor(Math.random() * 24)
      const minute = Math.floor(Math.random() * 60)
      const startedAt = addMinutes(addHours(dayStart, hour), minute)
      const duration = 30 + Math.floor(Math.random() * 1770) // 30-1800 seconds

      sessionRecords.push({
        visitorId: visitor.id,
        duration,
        startedAt,
        endedAt: new Date(startedAt.getTime() + duration * 1000),
      })
    }
  }

  // Batch create sessions
  await prisma.session.createMany({ data: sessionRecords })
  const sessions = await prisma.session.findMany({ select: { id: true, startedAt: true, duration: true } })
  console.log(`Created ${sessions.length} sessions`)

  // Create page views
  const pageViewRecords: Array<{
    path: string
    referrer: string | null
    sessionId: string
    createdAt: Date
  }> = []

  for (const session of sessions) {
    // Each session gets 1-6 page views
    const viewCount = 1 + Math.floor(Math.random() * 6)
    for (let i = 0; i < viewCount; i++) {
      const offsetMs = Math.floor(Math.random() * session.duration * 1000)
      pageViewRecords.push({
        path: pickRandom(paths),
        referrer: i === 0 ? pickReferrer() : null, // Only first page view has referrer
        sessionId: session.id,
        createdAt: new Date(session.startedAt.getTime() + offsetMs),
      })
    }
  }

  // Batch create page views in chunks of 1000
  for (let i = 0; i < pageViewRecords.length; i += 1000) {
    const chunk = pageViewRecords.slice(i, i + 1000)
    await prisma.pageView.createMany({ data: chunk })
  }
  console.log(`Created ${pageViewRecords.length} page views`)

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
