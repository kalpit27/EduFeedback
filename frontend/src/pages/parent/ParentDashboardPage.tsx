import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  Award,
  ClipboardList,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

export const ParentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [linkedStudents, setLinkedStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [attendance, setAttendance] = useState<any>(null);
  const [remarks, setRemarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        setLoading(true);
        const stList = user?.profile?.linkedStudents || [];
        setLinkedStudents(stList);

        if (stList.length > 0) {
          const firstId = stList[0].user?._id || stList[0]._id;
          setSelectedStudentId(firstId);

          const [attRes, remarksRes]: any = await Promise.all([
            api.get(`/attendance/student/${firstId}`),
            api.get(`/teacher-feedback/student/${firstId}`),
          ]);
          setAttendance(attRes.data);
          setRemarks(remarksRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load parent dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchParentData();
  }, [user]);

  const handleStudentSwitch = async (studentUserId: string) => {
    setSelectedStudentId(studentUserId);
    try {
      const [attRes, remarksRes]: any = await Promise.all([
        api.get(`/attendance/student/${studentUserId}`),
        api.get(`/teacher-feedback/student/${studentUserId}`),
      ]);
      setAttendance(attRes.data);
      setRemarks(remarksRes.data || []);
    } catch (err) {
      console.error('Failed to switch student view', err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading parent portal dashboard..." />;

  const currentStudentProfile = linkedStudents.find(
    (s) => (s.user?._id || s._id) === selectedStudentId
  );

  return (
    <div className="space-y-6">
      {/* Parent Welcome Banner */}
      <div className="bg-gradient-to-r from-white via-white to-[#1DCED8]/10 p-6 rounded-card border border-neutral-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#17B2BA] bg-[#1DCED8]/10 px-2.5 py-0.5 rounded-full">
            Parent & Guardian Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937] mt-1">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-neutral-secondary mt-1">
            Monitor academic attendance, instructor feedback, and submit institutional feedback surveys
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NavLink to="/parent/survey" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Institutional Quality Survey</span>
          </NavLink>
        </div>
      </div>

      {/* Ward Selector (if multiple children) */}
      {linkedStudents.length > 1 && (
        <div className="bg-white p-3.5 rounded-card border border-neutral-border flex items-center gap-3">
          <span className="text-xs font-semibold text-[#1F2937]">Viewing Record For:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => handleStudentSwitch(e.target.value)}
            className="input-field text-xs py-1.5 px-3 max-w-xs font-bold"
          >
            {linkedStudents.map((st) => (
              <option key={st._id} value={st.user?._id || st._id}>
                {st.user?.name || st.name} ({st.studentId}) — {st.course?.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${attendance?.overallPercentage ?? 100}%`}
          subtitle={`${attendance?.presentCount ?? 0} of ${attendance?.totalSessions ?? 0} lectures`}
          icon={CalendarCheck}
          accentColor={attendance?.overallPercentage >= 75 ? 'green' : 'orange'}
        />
        <StatCard
          title="Faculty Progress Remarks"
          value={remarks.length}
          subtitle="Evaluation reports"
          icon={Award}
          accentColor="cyan"
        />
        <StatCard
          title="Enrolled Program"
          value={currentStudentProfile?.course?.code || 'MCA'}
          subtitle={`${currentStudentProfile?.academicClass?.name || 'SY'} (${currentStudentProfile?.semester?.name || 'Sem III'})`}
          icon={Users}
          accentColor="blue"
        />
      </div>

      {/* Latest Faculty Remarks for Child */}
      <div className="card-container overflow-hidden p-0">
        <div className="p-4 border-b border-neutral-border bg-neutral-light/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1F2937]">
              Faculty Evaluation Remarks for {currentStudentProfile?.user?.name || 'Student'}
            </h3>
            <p className="text-xs text-neutral-secondary">Recent progress assessments by subject instructors</p>
          </div>
          <NavLink to="/parent/feedback" className="text-xs font-semibold text-[#17B2BA] hover:underline">
            View All Remarks →
          </NavLink>
        </div>

        <div className="p-4 space-y-3">
          {remarks.length === 0 ? (
            <p className="text-xs text-neutral-secondary text-center py-4">No remarks published yet.</p>
          ) : (
            remarks.slice(0, 2).map((r) => (
              <div key={r._id} className="p-4 bg-neutral-light rounded-card border border-neutral-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1F2937]">
                    {r.subject?.name} — Evaluated by {r.teacher?.name}
                  </span>
                  <Badge variant="green">{r.academicPerformance}</Badge>
                </div>
                <p>
                  <strong className="text-[#1F2937]">Observed Strengths:</strong>{' '}
                  <span className="text-emerald-800">{r.strengths}</span>
                </p>
                <p>
                  <strong className="text-[#1F2937]">Improvement Areas:</strong>{' '}
                  <span className="text-[#E6853A]">{r.areasOfImprovement}</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
