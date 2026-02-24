import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

interface Setting {
  id: string;
  key: string;
  label: string;
  value: string;
  type: 'text' | 'toggle' | 'select';
  options?: string[];
  description: string;
}

const fallbackSettings: Setting[] = [
  {
    id: '1',
    key: 'site_name',
    label: 'Site Name',
    value: 'PulseBoard',
    type: 'text',
    description: 'The display name for the dashboard.',
  },
  {
    id: '2',
    key: 'data_retention',
    label: 'Data Retention',
    value: '90',
    type: 'select',
    options: ['30', '60', '90', '180', '365'],
    description: 'Number of days to retain analytics data.',
  },
  {
    id: '3',
    key: 'email_notifications',
    label: 'Email Notifications',
    value: 'true',
    type: 'toggle',
    description: 'Send email notifications for important events.',
  },
  {
    id: '4',
    key: 'weekly_reports',
    label: 'Weekly Reports',
    value: 'true',
    type: 'toggle',
    description: 'Automatically generate and send weekly summary reports.',
  },
  {
    id: '5',
    key: 'timezone',
    label: 'Timezone',
    value: 'UTC',
    type: 'select',
    options: ['UTC', 'US/Eastern', 'US/Central', 'US/Pacific', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo'],
    description: 'Default timezone for dashboard data display.',
  },
  {
    id: '6',
    key: 'api_rate_limit',
    label: 'API Rate Limit',
    value: '1000',
    type: 'text',
    description: 'Maximum API requests per minute per user.',
  },
];

export default function Settings() {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<Setting[]>(fallbackSettings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(true);

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/settings');
        if (response.data.settings) {
          setSettings(response.data.settings);
        }
      } catch {
        // Use fallback settings
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const startEdit = (setting: Setting) => {
    setEditingId(setting.id);
    setEditValue(setting.value);
    setSaveMessage('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (setting: Setting) => {
    setSaving(true);
    setSaveMessage('');
    try {
      await apiClient.put(`/settings/${setting.key}`, { value: editValue });
      setSettings((prev) =>
        prev.map((s) => (s.id === setting.id ? { ...s, value: editValue } : s))
      );
      setSaveMessage('Setting saved successfully.');
    } catch {
      // Update locally even if API fails
      setSettings((prev) =>
        prev.map((s) => (s.id === setting.id ? { ...s, value: editValue } : s))
      );
      setSaveMessage('Saved locally (API unavailable).');
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  const handleToggle = async (setting: Setting) => {
    const newValue = setting.value === 'true' ? 'false' : 'true';
    try {
      await apiClient.put(`/settings/${setting.key}`, { value: newValue });
    } catch {
      // Continue with local update
    }
    setSettings((prev) =>
      prev.map((s) => (s.id === setting.id ? { ...s, value: newValue } : s))
    );
  };

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
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your application configuration.</p>
      </div>

      {saveMessage && (
        <div className="settings-message">{saveMessage}</div>
      )}

      <div className="settings-list">
        {settings.map((setting) => (
          <div key={setting.id} className="settings-item">
            <div className="settings-item-info">
              <h4 className="settings-item-label">{setting.label}</h4>
              <p className="settings-item-description">{setting.description}</p>
            </div>

            <div className="settings-item-control">
              {setting.type === 'toggle' ? (
                <button
                  className={`toggle-switch ${setting.value === 'true' ? 'toggle-switch--on' : ''}`}
                  onClick={() => handleToggle(setting)}
                  aria-label={`Toggle ${setting.label}`}
                >
                  <span className="toggle-knob" />
                </button>
              ) : editingId === setting.id ? (
                <div className="settings-edit-row">
                  {setting.type === 'select' && setting.options ? (
                    <select
                      className="filter-select"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    >
                      {setting.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-input form-input--sm"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  )}
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => saveEdit(setting)}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="btn btn--secondary btn--sm"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="settings-value-row">
                  <span className="settings-value">{setting.value}</span>
                  <button
                    className="btn btn--secondary btn--sm"
                    onClick={() => startEdit(setting)}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
