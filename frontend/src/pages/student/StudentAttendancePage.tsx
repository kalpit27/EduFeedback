import React, { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, Clock, BookOpen } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

export const StudentAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res: any = await api.get(`/attendance/student/${user?.id}`);
        if (res.success) setData(res.data);
      } catch (err) {
        console.error('Failed to load attendance', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchAttendance();
  }, [user?.id]);

  if (loading) return <LoadingSpinner message="Loading attendance records..." />;

  const subjectBreakdown = data?.subjectBreakdown || [];
  const sessionHistory = data?.sessionHistory || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <h1 className="text-xl font-bold text-[#1F2937]">Subject Attendance Record</h1>
        <p className="text-xs text-neutral-secondary mt-0.5">
          Detailed lecture session history, absence logs, and aggregate semester percentages
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${data?.overallPercentage ?? 100}%`}
          subtitle="Institute minimum: 75%"
          icon={CalendarCheck}
          accentColor={data?.overallPercentage >= 75 ? 'green' : 'orange'}
        />
        <StatCard
          title="Total Lectures"
          value={data?.totalSessions ?? 0}
          subtitle="Logged sessions"
          icon={BookOpen}
          accentColor="cyan"
        />
        <StatCard
          title="Classes Attended"
          value={data?.presentCount ?? 0}
          subtitle="Full credits"
          icon={CheckCircle2}
          accentColor="green"
        />
        <StatCard
          title="Absences"
          value={data?.absentCount ?? 0}
          subtitle="Missed sessions"
          icon={XCircle}
          accentColor="orange"
        />
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="card-container overflow-hidden p-0">
        <div className="p-4 border-b border-neutral-border bg-neutral-light/50">
          <h3 className="text-sm font-bold text-[#1F2937]">Subject-Wise Attendance Breakdown</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-border">
            <thead>
              <tr>
                <th className="table-header">Subject Name</th>
                <th className="table-header">Code</th>
                <th className="table-header">Sessions Held</th>
                <th className="table-header">Attended</th>
                <th className="table-header">Percentage</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/50 bg-white">
              {subjectBreakdown.map((sb: any) => (
                <tr key={sb.subjectId} className="hover:bg-[#FFF9D8]/20">
                  <td className="table-cell font-bold text-[#1F2937] text-xs">{sb.subjectName}</td>
                  <td className="table-cell font-mono text-xs font-bold text-[#17B2BA]">{sb.subjectCode}</td>
                  <td className="table-cell text-xs text-neutral-secondary">{sb.totalClasses}</td>
                  <td className="table-cell text-xs font-semibold text-[#1F2937]">{sb.attendedClasses}</td>
                  <td className="table-cell font-bold text-xs">
                    <span className={sb.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}>
                      {sb.percentage}%
                    </span>
                  </td>
                  <td className="table-cell">
                    <Badge variant={sb.percentage >= 75 ? 'green' : 'orange'}>
                      {sb.percentage >= 75 ? 'Eligible' : 'Attendance Warning'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session History Table */}
      <div className="card-container overflow-hidden p-0">
        <div className="p-4 border-b border-neutral-border bg-neutral-light/50">
          <h3 className="text-sm font-bold text-[#1F2937]">Recent Session Logs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-border">
            <thead>
              <tr>
                <th className="table-header">Session Date</th>
                <th className="table-header">Subject</th>
                <th className="table-header">Instructor</th>
                <th className="table-header">Status</th>
                <th className="table-header">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/50 bg-white">
              {sessionHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-cell text-center text-neutral-secondary py-6">
                    No session logs found.
                  </td>
                </tr>
              ) : (
                sessionHistory.map((s: any) => (
                  <tr key={s.id} className="hover:bg-[#FFF9D8]/20">
                    <td className="table-cell text-xs font-medium text-[#1F2937]">
                      {new Date(s.date).toLocaleDateString()}
                    </td>
                    <td className="table-cell text-xs font-semibold text-[#1F2937]">{s.subject}</td>
                    <td className="table-cell text-xs text-neutral-secondary">{s.teacher || 'Faculty'}</td>
                    <td className="table-cell">
                      <Badge
                        variant={
                          s.status === 'PRESENT' ? 'green' : s.status === 'LATE' ? 'orange' : 'danger'
                        }
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="table-cell text-xs text-neutral-secondary">{s.remarks || '—'}</td>
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
