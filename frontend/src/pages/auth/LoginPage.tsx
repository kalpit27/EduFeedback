import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, User, GraduationCap, Users, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      // Redirect according to role
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'TEACHER') navigate('/teacher');
      else if (user.role === 'PARENT') navigate('/parent');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-10 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFF9D8]/50 via-white to-[#1DCED8]/10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-[#1DCED8] text-white rounded-2xl shadow-hover mb-3">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
          Institute Feedback & Academic Platform
        </h2>
        <p className="mt-1 text-xs text-neutral-secondary max-w-sm mx-auto">
          Secure, confidential pedagogical evaluation and institutional communications
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
            <button
              type="button"
              className="flex-1 py-1.5 text-xs font-bold rounded-btn bg-white text-[#17B2BA] shadow-subtle"
            >
              Sign In
            </button>
            <NavLink
              to="/register"
              className="flex-1 py-1.5 text-xs font-semibold rounded-btn text-neutral-secondary hover:text-[#1F2937] text-center transition-colors"
            >
              Sign Up / Register
            </NavLink>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">
                Institute Email Address
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
                  placeholder="name@apexinstitute.edu"
                  className="input-field pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-btn shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-secondary">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
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
                <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Prominent Create Account Button */}
          <div className="mt-4 pt-3 border-t border-neutral-border/60 text-center">
            <NavLink
              to="/register"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-btn border border-[#1DCED8] text-[#17B2BA] hover:bg-[#1DCED8]/10 font-bold text-xs transition-all"
            >
              <UserPlus className="w-4 h-4 text-[#17B2BA]" />
              <span>New User? Create a New Account</span>
            </NavLink>
          </div>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-5 pt-5 border-t border-neutral-border">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E6853A] uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Demo Login Personas</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => fillDemo('admin@apexinstitute.edu', 'Admin@123')}
                className="p-2 rounded-btn border border-neutral-border hover:border-[#1DCED8] hover:bg-[#1DCED8]/5 transition-all text-xs"
              >
                <div className="flex items-center gap-1 font-bold text-[#1F2937]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#17B2BA]" />
                  <span>Admin</span>
                </div>
                <p className="text-[10px] text-neutral-secondary truncate">Full Management</p>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('prof.sharma@apexinstitute.edu', 'Teacher@123')}
                className="p-2 rounded-btn border border-neutral-border hover:border-[#1DCED8] hover:bg-[#1DCED8]/5 transition-all text-xs"
              >
                <div className="flex items-center gap-1 font-bold text-[#1F2937]">
                  <GraduationCap className="w-3.5 h-3.5 text-[#E6853A]" />
                  <span>Teacher</span>
                </div>
                <p className="text-[10px] text-neutral-secondary truncate">Prof. Sharma (MCA)</p>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('rahul.verma@student.edu', 'Student@123')}
                className="p-2 rounded-btn border border-neutral-border hover:border-[#1DCED8] hover:bg-[#1DCED8]/5 transition-all text-xs"
              >
                <div className="flex items-center gap-1 font-bold text-[#1F2937]">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Student</span>
                </div>
                <p className="text-[10px] text-neutral-secondary truncate">Rahul (Pending Form)</p>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('parent.verma@parent.edu', 'Parent@123')}
                className="p-2 rounded-btn border border-neutral-border hover:border-[#1DCED8] hover:bg-[#1DCED8]/5 transition-all text-xs"
              >
                <div className="flex items-center gap-1 font-bold text-[#1F2937]">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Parent</span>
                </div>
                <p className="text-[10px] text-neutral-secondary truncate">Parent of Rahul</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
