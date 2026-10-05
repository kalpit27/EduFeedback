import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Save,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  X,
  Sparkles,
  Camera,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';
import { UserAvatar } from '../../components/common/UserAvatar.js';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

export const ProfilePage: React.FC = () => {
  const { user, updateUserLocal } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarInputMode, setAvatarInputMode] = useState<'presets' | 'url'>('presets');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);
    setErrorMsg(null);
    try {
      const payload: any = { name, phone, avatar };
      if (newPassword.trim().length >= 6) {
        payload.password = newPassword.trim();
      }
      const res: any = await api.put('/auth/profile', payload);
      if (res.success) {
        updateUserLocal({ name, phone, avatar });
        setSuccessMsg(true);
        setNewPassword('');
        setTimeout(() => setSuccessMsg(false), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <h1 className="text-xl font-bold text-[#1F2937]">User Profile & Account Settings</h1>
        <p className="text-xs text-neutral-secondary mt-0.5">
          Manage your profile picture, contact details, and account security
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-btn flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved to database successfully.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-btn flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-card border border-neutral-border shadow-subtle space-y-6">
        {/* Profile Avatar Card Header */}
        <div className="p-4 rounded-card border border-neutral-border bg-neutral-light/40 space-y-4">
          <h2 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
            Profile Photo & Avatar
          </h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <UserAvatar src={avatar} name={name || user?.name || 'User'} size="xl" />
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1.5 shadow-md hover:bg-rose-600 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-2.5 w-full">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-white border border-neutral-border rounded-btn text-xs font-semibold text-[#1F2937] hover:border-[#1DCED8] hover:bg-[#1DCED8]/5 shadow-subtle transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-[#17B2BA]" />
                  <span>Upload Image from Computer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAvatarInputMode(avatarInputMode === 'presets' ? 'url' : 'presets')}
                  className="inline-flex items-center gap-1.5 py-2 px-3 bg-neutral-light border border-neutral-border rounded-btn text-xs font-semibold text-neutral-secondary hover:text-[#1F2937] transition-all"
                >
                  {avatarInputMode === 'presets' ? (
                    <>
                      <LinkIcon className="w-3.5 h-3.5 text-[#17B2BA]" />
                      <span>Use Web Image URL</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#E6853A]" />
                      <span>Select Avatar Presets</span>
                    </>
                  )}
                </button>
              </div>

              {avatarInputMode === 'presets' ? (
                <div className="pt-1">
                  <p className="text-[11px] text-neutral-secondary mb-1.5">Or choose a preset portrait:</p>
                  <div className="flex items-center gap-2">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(url)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                          avatar === url ? 'border-[#1DCED8] ring-2 ring-[#1DCED8]/40 scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/your-profile-image.jpg"
                    className="input-field text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Details Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#1F2937] uppercase mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1F2937] uppercase mb-1">Email Address (Read-only)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="input-field bg-neutral-light text-neutral-secondary cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1F2937] uppercase mb-1">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="input-field"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1F2937] uppercase mb-1">
              Institutional ID / Access
            </label>
            <input
              type="text"
              disabled
              value={user?.studentId || user?.employeeId || `${user?.role} ACCOUNT`}
              className="input-field bg-neutral-light text-neutral-secondary font-mono cursor-not-allowed"
            />
          </div>
        </div>

        {/* Password update section */}
        <div className="pt-4 border-t border-neutral-border space-y-3">
          <h3 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
            Security & Password Change
          </h3>
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">New Password</label>
            <input
              type="password"
              placeholder="Leave blank to keep unchanged"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field text-xs"
            />
            <p className="text-[11px] text-neutral-secondary mt-1">Must be at least 6 characters.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-border flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-hover">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
