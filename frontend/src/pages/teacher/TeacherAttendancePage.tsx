import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Users,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

export const TeacherAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE'; remarks: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const res: any = await api.get(`/teacher-assignments?teacher=${user?.id}`);
        const list = res.data || [];
        setAssignments(list);

        const paramSubj = searchParams.get('subject');
        if (paramSubj) {
          const matched = list.find((a: any) => a.subject?._id === paramSubj);
          if (matched) setSelectedAssignmentId(matched._id);
          else if (list.length > 0) setSelectedAssignmentId(list[0]._id);
        } else if (list.length > 0) {
          setSelectedAssignmentId(list[0]._id);
        }
      } catch (err) {
        console.error('Failed to load assignments', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchAssignments();
  }, [user?.id]);

  useEffect(() => {
    const fetchClassStudents = async () => {
      const selected = assignments.find((a) => a._id === selectedAssignmentId);
      if (!selected) return;

      try {
        setLoading(true);
        const res: any = await api.get(
          `/students?department=${selected.department?._id}&course=${selected.course?._id}&academicClass=${selected.academicClass?._id}&semester=${selected.semester?._id}`
        );
        const list = res.data || [];
        setStudents(list);

        // Initialize all as PRESENT by default
        const initMap: Record<string, any> = {};
        list.forEach((st: any) => {
          const uId = st.user?._id || st._id;
          initMap[uId] = { status: 'PRESENT', remarks: '' };
        });
        setAttendanceMap(initMap);
      } catch (err) {
        console.error('Failed to load students for attendance', err);
      } finally {
        setLoading(false);
      }
    };
    if (selectedAssignmentId) fetchClassStudents();
  }, [selectedAssignmentId, assignments]);

  const toggleStudentStatus = (studentUserId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentUserId]: {
        ...prev[studentUserId],
        status,
      },
    }));
  };

  const updateStudentRemark = (studentUserId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentUserId]: {
        ...prev[studentUserId],
        remarks,
      },
    }));
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    const selected = assignments.find((a) => a._id === selectedAssignmentId);
    if (!selected) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const records = Object.entries(attendanceMap).map(([studentId, data]) => ({
        student: studentId,
        status: data.status,
        remarks: data.remarks,
      }));

      await api.post('/attendance', {
        date: selectedDate,
        subject: selected.subject?._id,
        department: selected.department?._id,
        course: selected.course?._id,
        academicClass: selected.academicClass?._id,
        semester: selected.semester?._id,
        records,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save attendance', err);
    } finally {
      setSaving(false);
    }
  };

  const currentAssignment = assignments.find((a) => a._id === selectedAssignmentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Subject Attendance Management</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            Record and log session attendance for your assigned classes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field text-xs py-1.5 px-3 max-w-[150px]"
          />
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-btn flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Attendance recorded successfully. Parent notices automatically dispatched for absent entries.</span>
        </div>
      )}

      {/* Select Subject Dropdown */}
      <div className="bg-white p-4 rounded-card border border-neutral-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#1F2937]">Select Subject & Class:</span>
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="input-field text-xs py-1.5 px-3 max-w-md font-semibold"
          >
            {assignments.map((a) => (
              <option key={a._id} value={a._id}>
                {a.subject?.name} — {a.course?.name} ({a.academicClass?.name} {a.semester?.name})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-[#17B2BA] bg-[#1DCED8]/10 px-3 py-1 rounded-full">
          {students.length} Students Enrolled
        </span>
      </div>

      {/* Student Attendance Roster */}
      <form onSubmit={handleSaveAttendance} className="card-container p-0 overflow-hidden space-y-0">
        <div className="p-4 border-b border-neutral-border bg-neutral-light/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
            Class Roll Roster ({currentAssignment?.subject?.name})
          </h3>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                const updated: any = {};
                students.forEach((s) => {
                  const uId = s.user?._id || s._id;
                  updated[uId] = { status: 'PRESENT', remarks: '' };
                });
                setAttendanceMap(updated);
              }}
              className="text-[#17B2BA] hover:underline"
            >
              Mark All Present
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-border">
            <thead>
              <tr>
                <th className="table-header">Roll #</th>
                <th className="table-header">Student Name</th>
                <th className="table-header">Student ID</th>
                <th className="table-header">Attendance Status</th>
                <th className="table-header">Remarks / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/50 bg-white">
              {students.map((st) => {
                const uId = st.user?._id || st._id;
                const record = attendanceMap[uId] || { status: 'PRESENT', remarks: '' };

                return (
                  <tr key={st._id} className="hover:bg-[#FFF9D8]/20">
                    <td className="table-cell font-mono font-bold text-xs">{st.rollNumber || '—'}</td>
                    <td className="table-cell">
                      <p className="font-bold text-xs text-[#1F2937]">{st.user?.name}</p>
                      <p className="text-[10px] text-neutral-secondary">{st.user?.email}</p>
                    </td>
                    <td className="table-cell font-mono text-xs text-[#17B2BA] font-semibold">{st.studentId}</td>
                    <td className="table-cell">
                      <div className="inline-flex rounded-btn border border-neutral-border overflow-hidden bg-neutral-light p-0.5">
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(uId, 'PRESENT')}
                          className={`px-3 py-1 text-xs font-bold rounded-btn transition-colors ${
                            record.status === 'PRESENT'
                              ? 'bg-[#55E07E] text-white shadow-subtle'
                              : 'text-neutral-secondary hover:text-[#1F2937]'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(uId, 'LATE')}
                          className={`px-3 py-1 text-xs font-bold rounded-btn transition-colors ${
                            record.status === 'LATE'
                              ? 'bg-[#FF9D50] text-white shadow-subtle'
                              : 'text-neutral-secondary hover:text-[#1F2937]'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(uId, 'ABSENT')}
                          className={`px-3 py-1 text-xs font-bold rounded-btn transition-colors ${
                            record.status === 'ABSENT'
                              ? 'bg-rose-500 text-white shadow-subtle'
                              : 'text-neutral-secondary hover:text-[#1F2937]'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                    <td className="table-cell">
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        value={record.remarks || ''}
                        onChange={(e) => updateStudentRemark(uId, e.target.value)}
                        className="input-field text-xs py-1 max-w-xs"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-neutral-border bg-neutral-light/50 flex justify-end">
          <button type="submit" disabled={saving || students.length === 0} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save & Submit Attendance'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
