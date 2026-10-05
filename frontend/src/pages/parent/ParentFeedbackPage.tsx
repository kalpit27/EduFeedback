import React, { useState, useEffect } from 'react';
import { Award, BookOpen, User, Calendar, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

export const ParentFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [linkedStudents, setLinkedStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [remarks, setRemarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const stList = user?.profile?.linkedStudents || [];
        setLinkedStudents(stList);

        if (stList.length > 0) {
          const firstId = stList[0].user?._id || stList[0]._id;
          setSelectedStudentId(firstId);
          const res: any = await api.get(`/teacher-feedback/student/${firstId}`);
          setRemarks(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load parent teacher remarks', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchFeedback();
  }, [user]);

  const handleStudentSwitch = async (studentUserId: string) => {
    setSelectedStudentId(studentUserId);
    try {
      setLoading(true);
      const res: any = await api.get(`/teacher-feedback/student/${studentUserId}`);
      setRemarks(res.data || []);
    } catch (err) {
      console.error('Failed to load feedback', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading teacher progress remarks..." />;

  const currentStudent = linkedStudents.find(
    (s) => (s.user?._id || s._id) === selectedStudentId
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-card border border-neutral-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Teacher Evaluation Reports</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            Faculty assessment of learning milestones and developmental observations for {currentStudent?.user?.name || 'Student'}
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

      {remarks.length === 0 ? (
        <EmptyState
          title="No Teacher Remarks Posted Yet"
          description="Subject instructors will post periodic evaluations and progress notes here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {remarks.map((r) => (
            <div
              key={r._id}
              className="bg-white border border-neutral-border rounded-card p-6 shadow-subtle hover:shadow-card transition-all space-y-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#17B2BA] bg-[#1DCED8]/10 px-2.5 py-0.5 rounded-full">
                    {r.subject?.name}
                  </span>
                  <h3 className="text-sm font-bold text-[#1F2937] mt-1">Instructor: {r.teacher?.name}</h3>
                </div>

                <Badge
                  variant={
                    r.academicPerformance === 'EXCELLENT'
                      ? 'green'
                      : r.academicPerformance === 'GOOD'
                      ? 'cyan'
                      : 'orange'
                  }
                >
                  {r.academicPerformance}
                </Badge>
              </div>

              <div className="p-3.5 bg-neutral-light rounded-btn space-y-2 text-xs">
                <div>
                  <strong className="text-[#1F2937] block">Observed Strengths:</strong>
                  <p className="text-emerald-800 font-medium">{r.strengths}</p>
                </div>
                <div>
                  <strong className="text-[#1F2937] block">Areas for Development:</strong>
                  <p className="text-[#E6853A] font-medium">{r.areasOfImprovement}</p>
                </div>
                {r.remarks && (
                  <div className="pt-1.5 border-t border-neutral-border/60">
                    <strong className="text-[#1F2937] block">Faculty Comments:</strong>
                    <p className="text-neutral-secondary italic">"{r.remarks}"</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-secondary pt-2 border-t border-neutral-border/60">
                <span>Classroom Engagement: <strong>{r.participation} / 5</strong></span>
                <span>Date: {new Date(r.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
