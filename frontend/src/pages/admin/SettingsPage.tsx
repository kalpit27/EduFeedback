import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Building, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { api } from '../../services/api.js';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    instituteName: '',
    instituteCode: '',
    academicYear: '',
    contactEmail: '',
    contactPhone: '',
    allowLateSubmissions: false,
    enableEmailNotifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res: any = await api.get('/settings');
        if (res.data) setSettings(res.data);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.put('/settings', settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading system settings..." />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <h1 className="text-xl font-bold text-[#1F2937]">System & Institutional Settings</h1>
        <p className="text-xs text-neutral-secondary mt-0.5">
          Configure institute profile, academic calendar year, and platform communication defaults
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-btn flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-card border border-neutral-border shadow-subtle space-y-6">
        <div>
          <h3 className="text-sm font-bold text-[#1F2937] uppercase tracking-wider mb-3">
            Institute Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1F2937] uppercase mb-1">Institute Legal Name</label>
              <input
                type="text"
                required
                value={settings.instituteName}
                onChange={(e) => setSettings({ ...settings, instituteName: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1F2937] uppercase mb-1">Institute Code</label>
              <input
                type="text"
                required
                value={settings.instituteCode}
                onChange={(e) => setSettings({ ...settings, instituteCode: e.target.value.toUpperCase() })}
                className="input-field uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1F2937] uppercase mb-1">Current Academic Year</label>
              <input
                type="text"
                required
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                className="input-field font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1F2937] uppercase mb-1">Official Contact Email</label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1F2937] uppercase mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-border">
          <h3 className="text-sm font-bold text-[#1F2937] uppercase tracking-wider mb-3">
            Security & Evaluation Parameters
          </h3>
          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 bg-neutral-light rounded-btn border border-neutral-border cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowLateSubmissions}
                onChange={(e) => setSettings({ ...settings, allowLateSubmissions: e.target.checked })}
                className="w-4 h-4 text-[#1DCED8] rounded focus:ring-[#1DCED8]"
              />
              <div>
                <p className="font-bold text-[#1F2937]">Allow Late Feedback Submissions</p>
                <p className="text-neutral-secondary text-[11px]">
                  Permits student submission after scheduled end date with late flag
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-neutral-light rounded-btn border border-neutral-border cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableEmailNotifications}
                onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                className="w-4 h-4 text-[#1DCED8] rounded focus:ring-[#1DCED8]"
              />
              <div>
                <p className="font-bold text-[#1F2937]">Enable Instant System Notifications</p>
                <p className="text-neutral-secondary text-[11px]">
                  Dispatches in-app notification alerts on new evaluations, attendance updates, and remark postings
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-border flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
