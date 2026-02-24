import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change: number;
  prefix?: string;
}

export default function StatCard({ label, value, change, prefix = '' }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <span className={`stat-card-change ${isPositive ? 'change--positive' : 'change--negative'}`}>
          <svg
            className="change-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isPositive ? (
              <polyline points="18 15 12 9 6 15" />
            ) : (
              <polyline points="6 9 12 15 18 9" />
            )}
          </svg>
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <div className="stat-card-value">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
