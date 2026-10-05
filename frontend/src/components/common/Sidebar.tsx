import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  PlusCircle,
  ClipboardList,
  BarChart3,
  FileText,
  CalendarCheck,
  MessageSquareWarning,
  Settings,
  GraduationCap,
  Award,
  LogOut,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { UserAvatar } from './UserAvatar.js';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNav = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Academic Structure', path: '/admin/academics', icon: Building2 },
    { label: 'Students & Faculty', path: '/admin/people', icon: Users },
    { label: 'Create Form', path: '/admin/forms/new', icon: PlusCircle },
    { label: 'Feedback Forms', path: '/admin/forms', icon: ClipboardList },
    { label: 'Institute Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'PDF Reports', path: '/admin/reports', icon: FileText },
    { label: 'Attendance Records', path: '/admin/attendance', icon: CalendarCheck },
    { label: 'Complaints / Concerns', path: '/admin/complaints', icon: MessageSquareWarning },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  const teacherNav = [
    { label: 'Teacher Dashboard', path: '/teacher', icon: LayoutDashboard },
    { label: 'Participation Stats', path: '/teacher/feedback', icon: ClipboardList },
    { label: 'Take Attendance', path: '/teacher/attendance', icon: CalendarCheck },
    { label: 'Student Evaluations', path: '/teacher/evaluations', icon: Award },
    { label: 'File Complaint', path: '/teacher/complaints', icon: MessageSquareWarning },
  ];

  const studentNav = [
    { label: 'Student Dashboard', path: '/student', icon: LayoutDashboard },
    { label: 'Feedback Forms', path: '/student/forms', icon: ClipboardList },
    { label: 'My Attendance', path: '/student/attendance', icon: CalendarCheck },
    { label: 'Teacher Remarks', path: '/student/remarks', icon: GraduationCap },
    { label: 'File Complaint', path: '/student/complaints', icon: MessageSquareWarning },
  ];

  const parentNav = [
    { label: 'Parent Dashboard', path: '/parent', icon: LayoutDashboard },
    { label: 'Ward Attendance', path: '/parent/attendance', icon: CalendarCheck },
    { label: 'Teacher Evaluations', path: '/parent/feedback', icon: Award },
    { label: 'Institute Survey', path: '/parent/survey', icon: ClipboardList },
    { label: 'File Concern', path: '/parent/complaints', icon: MessageSquareWarning },
  ];

  let currentNav = studentNav;
  if (user?.role === 'ADMIN') currentNav = adminNav;
  else if (user?.role === 'TEACHER') currentNav = teacherNav;
  else if (user?.role === 'PARENT') currentNav = parentNav;

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-border flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-neutral-border gap-3 bg-[#FFF9D8]/30">
        <div className="w-9 h-9 rounded-lg bg-[#1DCED8] flex items-center justify-center text-white font-bold shadow-subtle">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold text-[#1F2937] tracking-tight leading-tight truncate">EduFeedback</h1>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#E6853A]">Academic SaaS</p>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-5 py-3 border-b border-neutral-border/60 bg-neutral-light/50 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-neutral-secondary uppercase tracking-wider">Portal Access</span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#1DCED8]/15 text-[#17B2BA] border border-[#1DCED8]/30">
          <UserCheck className="w-3 h-3" />
          {user?.role}
        </span>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {currentNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin' || item.path === '/teacher' || item.path === '/student' || item.path === '/parent'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-btn text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-[#1DCED8] text-white font-semibold shadow-subtle'
                  : 'text-[#1F2937] hover:bg-[#FFF9D8]/60 hover:text-black'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-2.5">
                  <item.icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-neutral-secondary group-hover:text-[#17B2BA]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-neutral-border bg-neutral-light/40 space-y-2">
        <NavLink
          to="/profile"
          className="flex items-center gap-2.5 p-2 rounded-btn hover:bg-white border border-transparent hover:border-neutral-border transition-all"
        >
          <UserAvatar src={user?.avatar} name={user?.name} size="sm" />
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-[#1F2937] truncate">{user?.name}</p>
            <p className="text-[10px] text-neutral-secondary truncate">{user?.email}</p>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-btn transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
