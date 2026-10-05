import React, { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

export const ParentAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [linkedStudents, setLinkedStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinkedStudents = async () => {
      try {
        setLoading(true);
        const stList = user?.profile?.linkedStudents || [];
        setLinkedStudents(stList);

        if (stList.length > 0) {
          const firstId = stList[0].user?._id || stList[0]._id;
          setSelectedStudentId(firstId);
          const attRes: any = await api.get(`/attendance/student/${firstId}`);
          setAttendance(attRes.data);
        }
      } catch (err) {
        console.error('Failed to load parent attendance', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchLinkedStudents();
  }, [user]);

  const handleStudentSwitch = async (studentUserId: string) => {
    setSelectedStudentId(studentUserId);
    try {
      setLoading(true);
      const attRes: any = await api.get(`/attendance/student/${studentUserId}`);
      setAttendance(attRes.data);
    } catch (err) {
      console.error('Failed to load attendance', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading attendance records..." />;

  const currentStudent = linkedStudents.find(
    (s) => (s.user?._id || s._id) === selectedStudentId
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-card border border-neutral-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Child Attendance Record</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            Verified attendance percentage and subject lecture logs for {currentStudent?.user?.name || 'Student'}
          </p>
        </div>

        {linkedStudents.length > 1 && (
          <select
            value={selectedStudentId}
            onChange={(e) => handleStudentSwitch(e.target.value)}
            className="input-field text-xs py-1.5 px-3 max-w-xs font-bold"
          >
            {linkedStudents.map((st) => (
              <option key={st._id} value={st.user?._id || st._id}>
                {st.user?.name || st.name} ({st.studentId})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${attendance?.overallPercentage ?? 100}%`}
          subtitle="Institute required: 75%"
          icon={CalendarCheck}
          accentColor={attendance?.overallPercentage >= 75 ? 'green' : 'orange'}
        />
        <StatCard
          title="Total Sessions"
          value={attendance?.totalSessions ?? 0}
          subtitle="Recorded lectures"
          icon={BookOpen}
          accentColor="cyan"
        />
        <StatCard
          title="Attended"
          value={attendance?.presentCount ?? 0}
          subtitle="Present credits"
          icon={CheckCircle2}
          accentColor="green"
        />
        <StatCard
          title="Absences"
          value={attendance?.absentCount ?? 0}
          subtitle="Missed classes"
          icon={XCircle}
          accentColor="orange"
        />
      </div>

      {/* Subject-Wise Table */}
      <div className="card-container overflow-hidden p-0">
        <div className="p-4 border-b border-neutral-border bg-neutral-light/50">
          <h3 className="text-sm font-bold text-[#1F2937]">Subject Breakdown</h3>
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
              {attendance?.subjectBreakdown?.map((sb: any) => (
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
                      {sb.percentage >= 75 ? 'Satisfactory' : 'Below 75% Warning'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
