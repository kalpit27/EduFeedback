import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ClipboardList,
  CalendarCheck,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);
  const [remarks, setRemarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const [formsRes, attRes, remarksRes]: any = await Promise.all([
          api.get('/forms/available'),
          api.get(`/attendance/student/${user?.id}`),
          api.get(`/teacher-feedback/student/${user?.id}`),
        ]);

        setForms(formsRes.data || []);
        setAttendance(attRes.data || null);
        setRemarks(remarksRes.data || []);
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchStudentData();
  }, [user?.id]);

  if (loading) return <LoadingSpinner message="Loading student academic portal..." />;

  const pendingForms = forms.filter((f) => !f.isSubmitted);
  const completedForms = forms.filter((f) => f.isSubmitted);

  const profile = user?.profile || {};

  return (
    <div className="space-y-6">
      {/* Student Welcome Card */}
      <div className="bg-gradient-to-r from-white via-white to-[#1DCED8]/10 p-6 rounded-card border border-neutral-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#17B2BA] bg-[#1DCED8]/10 px-2.5 py-0.5 rounded-full">
            Student Academic Dashboard
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937] mt-1">
            Hello, {user?.name}
          </h1>
          <p className="text-xs text-neutral-secondary mt-1">
            {profile.course?.name || 'MCA'} — {profile.academicClass?.name || 'SY'} ({profile.semester?.name || 'Semester III'}) | Student ID: {user?.studentId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NavLink to="/student/forms" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>View Active Forms ({pendingForms.length})</span>
          </NavLink>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Pending Feedback"
          value={pendingForms.length}
          subtitle="Awaiting submission"
          icon={Clock}
          accentColor="orange"
        />
        <StatCard
          title="Completed Surveys"
          value={completedForms.length}
          subtitle="Submitted entries"
          icon={CheckCircle2}
          accentColor="green"
        />
        <StatCard
          title="Overall Attendance"
          value={`${attendance?.overallPercentage ?? 100}%`}
          subtitle={`${attendance?.presentCount ?? 0} of ${attendance?.totalSessions ?? 0} sessions`}
          icon={CalendarCheck}
          accentColor="cyan"
        />
        <StatCard
          title="Faculty Remarks"
          value={remarks.length}
          subtitle="Evaluations published"
          icon={Award}
          accentColor="blue"
        />
      </div>

      {/* Confidentiality Callout */}
      <div className="p-4 bg-[#FFF9D8]/50 border border-[#FF9D50]/40 rounded-card flex items-start gap-3">
        <div className="p-2 bg-[#FF9D50]/20 text-[#E6853A] rounded-full flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-[#1F2937]">Your Voice Matters & Remains Completely Confidential</p>
          <p className="text-neutral-secondary leading-relaxed">
            Faculty members cannot see your name, student ID, or individual responses. Ratings are aggregated anonymously by the Academic Quality Cell to enhance institutional curriculum and pedagogy.
          </p>
        </div>
      </div>

      {/* Active Available Forms Section */}
      <div className="card-container overflow-hidden p-0">
        <div className="p-4 border-b border-neutral-border bg-neutral-light/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1F2937]">Academic Evaluation Surveys</h3>
            <p className="text-xs text-neutral-secondary">Feedback surveys assigned to your current semester and subjects</p>
          </div>
          <NavLink to="/student/forms" className="text-xs font-semibold text-[#17B2BA] hover:underline">
            View All →
          </NavLink>
        </div>

        <div className="divide-y divide-neutral-border/60">
          {forms.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-secondary">
              No feedback surveys available for your class at this moment.
            </div>
          ) : (
            forms.slice(0, 3).map((f) => (
              <div key={f._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFF9D8]/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={f.isSubmitted ? 'green' : 'orange'}>
                      {f.isSubmitted ? 'COMPLETED' : 'PENDING ACTION'}
                    </Badge>
                    <span className="text-[11px] font-mono text-neutral-secondary">{f.questions?.length || 0} Questions</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#1F2937]">{f.title}</h4>
                  <p className="text-[11px] text-neutral-secondary mt-0.5">
                    Faculty: <strong className="text-[#1F2937]">{f.teacher?.name || 'Institutional Survey'}</strong> | Subject: {f.subject?.name || 'General'}
                  </p>
                </div>

                <div>
                  {f.isSubmitted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-btn border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Submitted</span>
                    </span>
                  ) : (
                    <NavLink
                      to={`/student/forms/${f._id}`}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shadow-subtle"
                    >
                      <span>Fill Confidential Feedback</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </NavLink>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
