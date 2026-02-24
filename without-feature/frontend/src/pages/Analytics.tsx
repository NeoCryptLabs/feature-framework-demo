import React, { useEffect, useState } from 'react';
import Chart from '../components/Chart';
import apiClient from '../api/client';

interface AnalyticsEvent {
  id: string;
  name: string;
  category: string;
  count: number;
  timestamp: string;
  source: string;
}

interface TimeSeriesPoint {
  date: string;
  events: number;
  uniqueUsers: number;
}

const fallbackTimeSeries: TimeSeriesPoint[] = [
  { date: 'Mon', events: 1200, uniqueUsers: 820 },
  { date: 'Tue', events: 1450, uniqueUsers: 940 },
  { date: 'Wed', events: 1380, uniqueUsers: 900 },
  { date: 'Thu', events: 1520, uniqueUsers: 1020 },
  { date: 'Fri', events: 1680, uniqueUsers: 1100 },
  { date: 'Sat', events: 980, uniqueUsers: 640 },
  { date: 'Sun', events: 870, uniqueUsers: 560 },
];

const fallbackEvents: AnalyticsEvent[] = [
  { id: '1', name: 'page_view', category: 'engagement', count: 12450, timestamp: '2026-02-23T10:30:00Z', source: 'web' },
  { id: '2', name: 'button_click', category: 'engagement', count: 8320, timestamp: '2026-02-23T10:25:00Z', source: 'web' },
  { id: '3', name: 'signup', category: 'conversion', count: 645, timestamp: '2026-02-23T10:20:00Z', source: 'web' },
  { id: '4', name: 'purchase', category: 'conversion', count: 234, timestamp: '2026-02-23T10:15:00Z', source: 'mobile' },
  { id: '5', name: 'form_submit', category: 'engagement', count: 1520, timestamp: '2026-02-23T10:10:00Z', source: 'web' },
  { id: '6', name: 'video_play', category: 'media', count: 3200, timestamp: '2026-02-23T10:05:00Z', source: 'mobile' },
  { id: '7', name: 'share', category: 'social', count: 890, timestamp: '2026-02-23T10:00:00Z', source: 'web' },
  { id: '8', name: 'download', category: 'conversion', count: 456, timestamp: '2026-02-23T09:55:00Z', source: 'web' },
  { id: '9', name: 'search', category: 'engagement', count: 5670, timestamp: '2026-02-23T09:50:00Z', source: 'mobile' },
  { id: '10', name: 'error', category: 'system', count: 78, timestamp: '2026-02-23T09:45:00Z', source: 'web' },
];

const categories = ['all', 'engagement', 'conversion', 'media', 'social', 'system'];

export default function Analytics() {
  const [events, setEvents] = useState<AnalyticsEvent[]>(fallbackEvents);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>(fallbackTimeSeries);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.get('/analytics', {
          params: selectedCategory !== 'all' ? { category: selectedCategory } : {},
        });
        const data = response.data;
        if (data.events) setEvents(data.events);
        if (data.timeSeries) setTimeSeries(data.timeSeries);
      } catch {
        // Use fallback data
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedCategory]);

  const filteredEvents =
    selectedCategory === 'all'
      ? events
      : events.filter((e) => e.category === selectedCategory);

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Track events and user engagement metrics.</p>
      </div>

      <div className="analytics-controls">
        <div className="filter-group">
          <label htmlFor="category-filter" className="filter-label">
            Category
          </label>
          <select
            id="category-filter"
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="spinner" />
        </div>
      ) : (
        <>
          <div className="charts-grid">
            <Chart
              type="line"
              title="Events Over Time"
              data={timeSeries}
              xAxisKey="date"
              dataKeys={[
                { key: 'events', color: '#4361ee', name: 'Total Events' },
                { key: 'uniqueUsers', color: '#7209b7', name: 'Unique Users' },
              ]}
              height={320}
            />
          </div>

          <div className="table-container">
            <h3 className="table-title">Event Log</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Source</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <span className="event-name">{event.name}</span>
                      </td>
                      <td>
                        <span className={`badge badge--${event.category}`}>
                          {event.category}
                        </span>
                      </td>
                      <td className="text-right">{event.count.toLocaleString()}</td>
                      <td>{event.source}</td>
                      <td className="text-muted">{formatTimestamp(event.timestamp)}</td>
                    </tr>
                  ))}
                  {filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        No events found for this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
