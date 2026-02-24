import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PulseBoard database...");

  // Clean existing data
  await prisma.setting.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.dashboardStat.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const adminPassword = await bcrypt.hash("admin123", 10);
  const viewerPassword = await bcrypt.hash("viewer123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@pulseboard.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      email: "viewer@pulseboard.com",
      password: viewerPassword,
      name: "Viewer User",
      role: "VIEWER",
    },
  });

  console.log(`Created users: ${adminUser.email}, ${viewerUser.email}`);

  // --- Dashboard Stats ---
  const stats = [
    {
      label: "Total Revenue",
      value: "$74,100",
      change: 12.5,
      changeType: "INCREASE" as const,
      icon: "dollar-sign",
      order: 1,
    },
    {
      label: "Active Users",
      value: "8,432",
      change: 8.2,
      changeType: "INCREASE" as const,
      icon: "users",
      order: 2,
    },
    {
      label: "Conversion Rate",
      value: "3.24%",
      change: -0.8,
      changeType: "DECREASE" as const,
      icon: "trending-up",
      order: 3,
    },
    {
      label: "Avg Order Value",
      value: "$52.40",
      change: 4.1,
      changeType: "INCREASE" as const,
      icon: "shopping-cart",
      order: 4,
    },
    {
      label: "Page Views",
      value: "142,587",
      change: 15.3,
      changeType: "INCREASE" as const,
      icon: "eye",
      order: 5,
    },
    {
      label: "Bounce Rate",
      value: "34.2%",
      change: 0.0,
      changeType: "NEUTRAL" as const,
      icon: "activity",
      order: 6,
    },
  ];

  for (const stat of stats) {
    await prisma.dashboardStat.create({ data: stat });
  }

  console.log(`Created ${stats.length} dashboard stats`);

  // --- Analytics Events ---
  const eventTemplates = [
    // Traffic events
    { name: "Page View", category: "traffic", minCount: 800, maxCount: 5000 },
    { name: "Unique Visitor", category: "traffic", minCount: 400, maxCount: 2500 },
    { name: "Referral Visit", category: "traffic", minCount: 100, maxCount: 800 },
    { name: "Direct Visit", category: "traffic", minCount: 200, maxCount: 1200 },
    { name: "Organic Search", category: "traffic", minCount: 300, maxCount: 1500 },

    // Engagement events
    { name: "Button Click", category: "engagement", minCount: 500, maxCount: 3000 },
    { name: "Form Submit", category: "engagement", minCount: 50, maxCount: 400 },
    { name: "Video Play", category: "engagement", minCount: 100, maxCount: 700 },
    { name: "Download", category: "engagement", minCount: 30, maxCount: 250 },
    { name: "Share", category: "engagement", minCount: 20, maxCount: 180 },

    // Conversion events
    { name: "Sign Up", category: "conversion", minCount: 20, maxCount: 150 },
    { name: "Purchase", category: "conversion", minCount: 10, maxCount: 80 },
    { name: "Subscription", category: "conversion", minCount: 5, maxCount: 40 },
    { name: "Trial Start", category: "conversion", minCount: 15, maxCount: 100 },
    { name: "Add to Cart", category: "conversion", minCount: 40, maxCount: 300 },

    // Retention events
    { name: "Return Visit", category: "retention", minCount: 200, maxCount: 1200 },
    { name: "Feature Usage", category: "retention", minCount: 300, maxCount: 2000 },
    { name: "Session Duration 5m+", category: "retention", minCount: 150, maxCount: 900 },
    { name: "Repeat Purchase", category: "retention", minCount: 5, maxCount: 50 },
    { name: "NPS Response", category: "retention", minCount: 10, maxCount: 60 },
  ];

  const now = new Date();
  let eventCount = 0;

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

    for (const template of eventTemplates) {
      // Create 3-4 entries per event per month (spread across the month)
      const entriesCount = 3 + Math.floor(Math.random() * 2);

      for (let i = 0; i < entriesCount; i++) {
        const day = 1 + Math.floor(Math.random() * 27);
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);

        // Add a growth trend: more recent months have slightly higher counts
        const growthMultiplier = 1 + (5 - monthOffset) * 0.05;
        const count = Math.round(
          (template.minCount +
            Math.random() * (template.maxCount - template.minCount)) *
            growthMultiplier
        );

        await prisma.analyticsEvent.create({
          data: {
            name: template.name,
            count,
            date,
            category: template.category,
          },
        });

        eventCount++;
      }
    }
  }

  console.log(`Created ${eventCount} analytics events`);

  // --- Settings ---
  const settings = [
    {
      key: "site_name",
      value: "PulseBoard Analytics",
      description: "The display name of the application shown in the header and browser title.",
    },
    {
      key: "maintenance_mode",
      value: "false",
      description: "When enabled, the application shows a maintenance page to all non-admin users.",
    },
    {
      key: "max_users",
      value: "500",
      description: "Maximum number of user accounts allowed on the platform.",
    },
    {
      key: "theme",
      value: "light",
      description: "Default color theme for the dashboard. Options: light, dark, system.",
    },
    {
      key: "notification_email",
      value: "alerts@pulseboard.com",
      description: "Email address where system notifications and alerts are sent.",
    },
  ];

  for (const setting of settings) {
    await prisma.setting.create({
      data: {
        ...setting,
        updatedById: adminUser.id,
      },
    });
  }

  console.log(`Created ${settings.length} settings`);
  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
