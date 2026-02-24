import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import Chart from '../components/Chart';
import apiClient from '../api/client';

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalUsers: number;
  usersChange: number;
  activeSubscriptions: number;
  subscriptionsChange: number;
  conversionRate: number;
  conversionChange: number;
}

interface RevenueDataPoint {
  month: string;
  revenue: number;
  expenses: number;
}

interface MetricsDataPoint {
  month: string;
  signups: number;
  churns: number;
}

const defaultStats: DashboardStats = {
  totalRevenue: 0,
  revenueChange: 0,
  totalUsers: 0,
  usersChange: 0,
  activeSubscriptions: 0,
  subscriptionsChange: 0,
  conversionRate: 0,
  conversionChange: 0,
};

const fallbackRevenueData: RevenueDataPoint[] = [
  { month: 'Jan', revenue: 42000, expenses: 28000 },
  { month: 'Feb', revenue: 45000, expenses: 29500 },
  { month: 'Mar', revenue: 48000, expenses: 30000 },
  { month: 'Apr', revenue: 51000, expenses: 31000 },
  { month: 'May', revenue: 49000, expenses: 30500 },
  { month: 'Jun', revenue: 55000, expenses: 32000 },
  { month: 'Jul', revenue: 58000, expenses: 33000 },
  { month: 'Aug', revenue: 62000, expenses: 34000 },
  { month: 'Sep', revenue: 59000, expenses: 33500 },
  { month: 'Oct', revenue: 64000, expenses: 35000 },
  { month: 'Nov', revenue: 68000, expenses: 36000 },
  { month: 'Dec', revenue: 72000, expenses: 37000 },
];

const fallbackMetricsData: MetricsDataPoint[] = [
  { month: 'Jan', signups: 320, churns: 45 },
  { month: 'Feb', signups: 380, churns: 52 },
  { month: 'Mar', signups: 410, churns: 48 },
  { month: 'Apr', signups: 450, churns: 55 },
  { month: 'May', signups: 420, churns: 42 },
  { month: 'Jun', signups: 490, churns: 58 },
  { month: 'Jul', signups: 530, churns: 50 },
  { month: 'Aug', signups: 560, churns: 47 },
  { month: 'Sep', signups: 520, churns: 53 },
  { month: 'Oct', signups: 580, churns: 44 },
  { month: 'Nov', signups: 610, churns: 49 },
  { month: 'Dec', signups: 650, churns: 46 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>(fallbackRevenueData);
  const [metricsData, setMetricsData] = useState<MetricsDataPoint[]>(fallbackMetricsData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/dashboard');
        const data = response.data;
        if (data.stats) setStats(data.stats);
        if (data.revenueData) setRevenueData(data.revenueData);
        if (data.metricsData) setMetricsData(data.metricsData);
      } catch {
        // Use fallback data if API is unavailable
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here is your business overview.</p>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Total Revenue"
          value={stats.totalRevenue}
          change={stats.revenueChange}
          prefix="$"
        />
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          change={stats.usersChange}
        />
        <StatCard
          label="Active Subscriptions"
          value={stats.activeSubscriptions}
          change={stats.subscriptionsChange}
        />
        <StatCard
          label="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change={stats.conversionChange}
        />
      </div>

      <div className="charts-grid">
        <Chart
          type="line"
          title="Revenue vs Expenses"
          data={revenueData}
          xAxisKey="month"
          dataKeys={[
            { key: 'revenue', color: '#4361ee', name: 'Revenue' },
            { key: 'expenses', color: '#f72585', name: 'Expenses' },
          ]}
          height={320}
        />
        <Chart
          type="bar"
          title="Monthly Signups & Churns"
          data={metricsData}
          xAxisKey="month"
          dataKeys={[
            { key: 'signups', color: '#4361ee', name: 'Signups' },
            { key: 'churns', color: '#ef476f', name: 'Churns' },
          ]}
          height={320}
        />
      </div>
    </div>
  );
}
