import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Card, Input, Button } from '../components/UI';
import { settingsAPI } from '../services/api';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    heroMeta: {
      lastFiling: 'April 30, 2026',
      upcomingDeadline: {
        title: 'GSTR-1 Due',
        date: '2026-05-10',
      },
    },
    heroHighlights: [
      { label: 'Next Filing', value: 'GSTR-1', detail: '5 Days' },
      { label: 'Monthly Target', value: '₹45,000', detail: '75% Complete' },
      { label: 'Compliance Alerts', value: '3', detail: 'Critical items' },
    ],
    deadlines: [
      { title: 'GSTR-1 Due', date: '2026-05-10' },
      { title: 'ITR Filing Due', date: '2026-07-31' },
      { title: 'TDS Due', date: '2026-05-15' },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsAPI.getDashboardSettings();
      const data = response.data || {};
      setSettings((prev) => ({
        heroMeta: data.heroMeta || prev.heroMeta,
        heroHighlights: data.heroHighlights || prev.heroHighlights,
        deadlines: data.deadlines || prev.deadlines,
      }));
    } catch (err) {
      console.error('Failed to load settings', err);
      setError(err.message || 'Unable to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleHighlightChange = (index, field, value) => {
    setSettings((prev) => {
      const heroHighlights = [...prev.heroHighlights];
      heroHighlights[index] = { ...heroHighlights[index], [field]: value };
      return { ...prev, heroHighlights };
    });
  };

  const handleDeadlineChange = (index, value) => {
    setSettings((prev) => {
      const deadlines = [...prev.deadlines];
      deadlines[index] = { ...deadlines[index], date: value };
      return { ...prev, deadlines };
    });
  };

  const handleAddDeadline = () => {
    setSettings((prev) => ({
      ...prev,
      deadlines: [...prev.deadlines, { title: 'New Deadline', date: '' }],
    }));
  };

  const handleRemoveDeadline = (index) => {
    setSettings((prev) => ({
      ...prev,
      deadlines: prev.deadlines.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await settingsAPI.updateDashboardSettings(settings);
      setMessage('Dashboard settings saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-background-50 min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 md:ml-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-500 mb-2">Admin Settings</h1>
            <p className="text-gray-600">Configure dashboard highlights and submission deadlines for the homepage and reporting UX.</p>
          </div>

          {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
          {message && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>}

          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-primary-500 mb-3">Hero Highlight Cards</h2>
              <p className="text-gray-600 text-sm">These cards appear on the homepage and can be updated to show meaningful business insights.</p>
            </div>

            <div className="space-y-6">
              {settings.heroHighlights.map((highlight, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={`Highlight ${index + 1} Label`}
                    value={highlight.label}
                    onChange={(e) => handleHighlightChange(index, 'label', e.target.value)}
                  />
                  <Input
                    label="Value"
                    value={highlight.value}
                    onChange={(e) => handleHighlightChange(index, 'value', e.target.value)}
                  />
                  <Input
                    label="Detail"
                    value={highlight.detail}
                    onChange={(e) => handleHighlightChange(index, 'detail', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="mt-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-primary-500 mb-3">Hero Meta</h2>
              <p className="text-gray-600 text-sm">Edit the homepage hero's Last Filing and Upcoming Deadline details.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Last Filing"
                value={settings.heroMeta.lastFiling}
                onChange={(e) => setSettings((prev) => ({
                  ...prev,
                  heroMeta: {
                    ...prev.heroMeta,
                    lastFiling: e.target.value,
                  },
                }))}
              />
              <Input
                label="Upcoming Deadline Title"
                value={settings.heroMeta.upcomingDeadline.title}
                onChange={(e) => setSettings((prev) => ({
                  ...prev,
                  heroMeta: {
                    ...prev.heroMeta,
                    upcomingDeadline: {
                      ...prev.heroMeta.upcomingDeadline,
                      title: e.target.value,
                    },
                  },
                }))}
              />
              <div>
                <label className="block text-sm font-semibold text-primary-500 mb-2">Upcoming Deadline Date</label>
                <input
                  type="date"
                  value={settings.heroMeta.upcomingDeadline.date}
                  onChange={(e) => setSettings((prev) => ({
                    ...prev,
                    heroMeta: {
                      ...prev.heroMeta,
                      upcomingDeadline: {
                        ...prev.heroMeta.upcomingDeadline,
                        date: e.target.value,
                      },
                    },
                  }))}
                  className="input-field w-full"
                />
              </div>
            </div>
          </Card>

          <Card className="mt-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary-500 mb-3">Submission Deadlines</h2>
                <p className="text-gray-600 text-sm">Manage key filing due dates and upcoming submission deadlines.</p>
              </div>
              <Button variant="secondary" onClick={handleAddDeadline}>Add Deadline</Button>
            </div>

            <div className="space-y-4">
              {settings.deadlines.map((deadline, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_0.5fr] gap-4 items-end">
                  <Input
                    label="Deadline Name"
                    value={deadline.title}
                    onChange={(e) => setSettings((prev) => {
                      const deadlines = [...prev.deadlines];
                      deadlines[index].title = e.target.value;
                      return { ...prev, deadlines };
                    })}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={deadline.date}
                      onChange={(e) => handleDeadlineChange(index, e.target.value)}
                      className="input-field w-full"
                    />
                  </div>
                  <Button variant="danger" className="w-full h-11 mt-6" onClick={() => handleRemoveDeadline(index)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-8 text-right">
            <Button variant="primary" onClick={handleSave} disabled={saving || loading}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage;