import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  CalendarCheck,
  ClipboardList,
  ShieldCheck,
  TrendingUp,
  Award,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { StatCard } from '../../components/common/StatCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTeacherDashboard = async () => {
      try {
        setLoading(true);
        const [assignRes, formsRes, remarksRes]: any = await Promise.all([
          api.get(`/teacher-assignments?teacher=${user?.id}`),
          api.get(`/forms?teacher=${user?.id}`),
          api.get('/teacher-feedback/my-submissions'),
        ]);

        setAssignments(assignRes.data || []);
        setForms(formsRes.data || []);
        setRemarks(remarksRes.data || []);
      } catch (err) {
        console.error('Failed to load teacher dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchTeacherDashboard();
  }, [user?.id]);

  if (loading) return <LoadingSpinner message="Loading instructor portal data..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-white via-white to-[#1DCED8]/10 p-6 rounded-card border border-neutral-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#17B2BA] bg-[#1DCED8]/10 px-2.5 py-0.5 rounded-full">
            Faculty Teaching Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937] mt-1">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-neutral-secondary mt-1">
            Department of {user?.department ? (user.department as any)?.name : 'Academic Instruction'} | Employee ID: {user?.employeeId || 'FACULTY'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NavLink to="/teacher/attendance" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </NavLink>
          <NavLink to="/teacher/evaluations" className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Post Remarks</span>
          </NavLink>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Subjects"
          value={assignments.length}
          subtitle="Active courses & terms"
          icon={BookOpen}
          accentColor="cyan"
        />
        <StatCard
          title="Evaluation Forms"
          value={forms.length}
          subtitle="Targeted student surveys"
          icon={ClipboardList}
          accentColor="orange"
        />
        <StatCard
          title="Student Remarks Posted"
          value={remarks.length}
          subtitle="Progress evaluations"
          icon={Award}
          accentColor="green"
        />
      </div>

      {/* Confidentiality Reminder Banner */}
      <div className="p-4 bg-[#FFF9D8]/50 border border-[#FF9D50]/40 rounded-card flex items-start gap-3">
        <div className="p-2 bg-[#FF9D50]/20 text-[#E6853A] rounded-full flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-[#1F2937]">Strict Confidentiality Notice</p>
          <p className="text-neutral-secondary leading-relaxed">
            Student feedback is 100% confidential. You have access strictly to aggregate participation counts and submission progress percentages. Individual student ratings and comments are restricted to Institutional Administrators.
          </p>
        </div>
      </div>

      {/* Assigned Subjects & Classes */}
      <div className="card-container overflow-hidden p-0">
        <div className="p-4 border-b border-neutral-border bg-neutral-light/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1F2937]">Assigned Academic Subjects & Classes</h3>
            <p className="text-xs text-neutral-secondary">Current semester course loads and class divisions</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-border">
            <thead>
              <tr>
                <th className="table-header">Subject Name</th>
                <th className="table-header">Code</th>
                <th className="table-header">Course & Class</th>
                <th className="table-header">Semester</th>
                <th className="table-header">Credits</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/50 bg-white">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-neutral-secondary py-6">
                    No teaching assignments found. Contact the Academic Admin.
                  </td>
                </tr>
              ) : (
                assignments.map((a: any) => (
                  <tr key={a._id} className="hover:bg-[#FFF9D8]/20">
                    <td className="table-cell font-bold text-[#1F2937] text-xs">{a.subject?.name}</td>
                    <td className="table-cell font-mono text-xs font-bold text-[#17B2BA]">{a.subject?.code}</td>
                    <td className="table-cell text-xs font-medium text-[#1F2937]">{a.course?.name} ({a.academicClass?.name})</td>
                    <td className="table-cell text-xs text-neutral-secondary">{a.semester?.name}</td>
                    <td className="table-cell text-xs text-neutral-secondary">{a.subject?.credits} Credits</td>
                    <td className="table-cell text-right">
                      <NavLink
                        to={`/teacher/attendance?subject=${a.subject?._id}&academicClass=${a.academicClass?._id}&semester=${a.semester?._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#17B2BA] hover:underline"
                      >
                        <span>Take Attendance</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </NavLink>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
