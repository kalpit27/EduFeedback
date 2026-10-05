import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  Users,
  Camera,
  Upload,
  Link as LinkIcon,
  X,
  Sparkles,
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

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'>('STUDENT');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarInputMode, setAvatarInputMode] = useState<'presets' | 'url'>('presets');
  const [departments, setDepartments] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res: any = await api.get('/departments');
        const list = res.data || [];
        setDepartments(list);
        if (list.length > 0) setDepartment(list[0]._id);
      } catch (e) {
        console.warn('Could not prefetch departments');
      }
    };
    fetchDepts();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size must be less than 2MB');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await register({
        name,
        email,
        password,
        role,
        department: department || undefined,
        phone,
        avatar: avatar || undefined,
      });

      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'TEACHER') navigate('/teacher');
      else if (user.role === 'PARENT') navigate('/parent');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-10 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFF9D8]/50 via-white to-[#1DCED8]/10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-[#1DCED8] text-white rounded-2xl shadow-hover mb-3">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
          Create Institute Account
        </h2>
        <p className="mt-1 text-xs text-neutral-secondary">
          Register with your institutional or personal email to access the platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-neutral-border rounded-dialog">
          {error && (
            <div className="mb-4 p-3 rounded-btn bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-btn bg-neutral-light p-1 border border-neutral-border mb-5">
            <NavLink
              to="/login"
              className="flex-1 py-1.5 text-xs font-semibold rounded-btn text-neutral-secondary hover:text-[#1F2937] text-center transition-colors"
            >
              Sign In
            </NavLink>
            <button
              type="button"
              className="flex-1 py-1.5 text-xs font-bold rounded-btn bg-white text-[#17B2BA] shadow-subtle"
            >
              Sign Up / Register
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { r: 'STUDENT', label: 'Student', icon: User },
                  { r: 'TEACHER', label: 'Faculty', icon: GraduationCap },
                  { r: 'PARENT', label: 'Parent', icon: Users },
                  { r: 'ADMIN', label: 'Admin', icon: ShieldCheck },
                ].map((item) => (
                  <button
                    key={item.r}
                    type="button"
                    onClick={() => setRole(item.r as any)}
                    className={`flex items-center gap-2 p-2.5 rounded-btn border text-xs font-semibold transition-all ${
                      role === item.r
                        ? 'bg-[#1DCED8]/15 border-[#1DCED8] text-[#17B2BA] shadow-subtle ring-1 ring-[#1DCED8]'
                        : 'border-neutral-border text-neutral-secondary hover:bg-neutral-light'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Photo / Avatar Picker */}
            <div className="p-3.5 rounded-card border border-neutral-border bg-neutral-light/40 space-y-3">
              <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider">
                Profile Image (Optional)
              </label>
              
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <UserAvatar src={avatar} name={name || 'User'} size="lg" />
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-neutral-border rounded-btn text-xs font-semibold text-[#1F2937] hover:border-[#1DCED8] hover:bg-[#1DCED8]/5 shadow-subtle transition-all"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#17B2BA]" />
                    <span>Upload from Device</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-neutral-secondary">
                    <span>or choose avatar:</span>
                    <button
                      type="button"
                      onClick={() => setAvatarInputMode(avatarInputMode === 'presets' ? 'url' : 'presets')}
                      className="text-[#17B2BA] font-semibold hover:underline flex items-center gap-1"
                    >
                      {avatarInputMode === 'presets' ? (
                        <>
                          <LinkIcon className="w-3 h-3" />
                          <span>Use Image URL</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>Preset Avatars</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {avatarInputMode === 'presets' ? (
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${
                        avatar === url ? 'border-[#1DCED8] ring-2 ring-[#1DCED8]/40 scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="pt-1">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="input-field text-xs"
                  />
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative rounded-btn shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-secondary">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kalpit Mhatre"
                  className="input-field pl-9 text-xs"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-btn shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-secondary">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-field pl-9 text-xs"
                />
              </div>
            </div>

            {/* Department (for Student / Teacher) */}
            {(role === 'STUDENT' || role === 'TEACHER') && departments.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1">
                  Department / School
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="input-field text-xs"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1">
                Password (min 6 characters)
              </label>
              <div className="relative rounded-btn shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-secondary">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-9 text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-hover"
              >
                <span>{loading ? 'Creating Account in Atlas...' : `Sign Up as ${role}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-5 text-center text-xs text-neutral-secondary">
            Already have an account?{' '}
            <NavLink to="/login" className="font-bold text-[#17B2BA] hover:underline">
              Sign In to Portal
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
