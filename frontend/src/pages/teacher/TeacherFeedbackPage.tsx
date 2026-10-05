import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  User,
  BookOpen,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

export const TeacherFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [remarks, setRemarks] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    student: '',
    subject: '',
    semester: '',
    academicPerformance: 'GOOD',
    participation: 4,
    strengths: '',
    areasOfImprovement: '',
    remarks: '',
    concerns: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const [remarksRes, assignRes]: any = await Promise.all([
        api.get('/teacher-feedback/my-submissions'),
        api.get(`/teacher-assignments?teacher=${user?.id}`),
      ]);

      setRemarks(remarksRes.data || []);
      setAssignments(assignRes.data || []);

      if (assignRes.data?.length > 0) {
        const first = assignRes.data[0];
        // Fetch students enrolled in this assignment
        const studRes: any = await api.get(
          `/students?department=${first.department?._id}&course=${first.course?._id}&academicClass=${first.academicClass?._id}&semester=${first.semester?._id}`
        );
        const stList = studRes.data || [];
        setStudents(stList);

        setFormData((prev: any) => ({
          ...prev,
          subject: first.subject?._id,
          semester: first.semester?._id,
          department: first.department?._id,
          course: first.course?._id,
          academicClass: first.academicClass?._id,
          student: stList[0]?.user?._id || '',
        }));
      }
    } catch (err) {
      console.error('Failed to load teacher feedback remarks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchFeedbackData();
  }, [user?.id]);

  const handleAssignmentChange = async (assignmentId: string) => {
    const selected = assignments.find((a) => a._id === assignmentId);
    if (!selected) return;

    const studRes: any = await api.get(
      `/students?department=${selected.department?._id}&course=${selected.course?._id}&academicClass=${selected.academicClass?._id}&semester=${selected.semester?._id}`
    );
    const stList = studRes.data || [];
    setStudents(stList);

    setFormData((prev: any) => ({
      ...prev,
      subject: selected.subject?._id,
      semester: selected.semester?._id,
      department: selected.department?._id,
      course: selected.course?._id,
      academicClass: selected.academicClass?._id,
      student: stList[0]?.user?._id || '',
    }));
  };

  const handlePostEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);
    try {
      await api.post('/teacher-feedback', formData);
      setModalOpen(false);
      await fetchFeedbackData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && remarks.length === 0) return <LoadingSpinner message="Loading student evaluations..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Student Evaluations & Pedagogical Remarks</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            Post formal academic evaluations, learning strengths, and progress observations visible to students and parents
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>New Student Evaluation</span>
        </button>
      </div>

      {/* Submitted Evaluations List */}
      {remarks.length === 0 ? (
        <EmptyState
          title="No Student Evaluations Posted"
          description="Post your first academic progress evaluation for an enrolled student."
          actionLabel="Post Evaluation"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {remarks.map((r: any) => (
            <div
              key={r._id}
              className="bg-white border border-neutral-border rounded-card p-5 shadow-subtle hover:shadow-card transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                    {r.student?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1F2937]">{r.student?.name}</h3>
                    <p className="text-[10px] text-neutral-secondary font-mono">{r.student?.studentId}</p>
                  </div>
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

              <div className="text-xs space-y-1.5 pt-1">
                <p className="text-neutral-secondary">
                  Subject: <strong className="text-[#1F2937]">{r.subject?.name}</strong>
                </p>
                <div className="p-3 bg-neutral-light rounded-btn space-y-1 text-xs">
                  <p>
                    <strong className="text-[#1F2937]">Key Strengths:</strong>{' '}
                    <span className="text-emerald-800">{r.strengths}</span>
                  </p>
                  <p>
                    <strong className="text-[#1F2937]">Areas of Improvement:</strong>{' '}
                    <span className="text-[#E6853A]">{r.areasOfImprovement}</span>
                  </p>
                  {r.remarks && (
                    <p className="pt-1 text-[11px] text-neutral-secondary italic">
                      "{r.remarks}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-secondary pt-1 border-t border-neutral-border/60">
                <span>Class Participation: {r.participation} / 5</span>
                <span>Date: {new Date(r.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Evaluation Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Academic Evaluation for Student" maxWidth="lg">
        {modalError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-btn flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handlePostEvaluation} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Select Subject / Class</label>
              <select
                onChange={(e) => handleAssignmentChange(e.target.value)}
                className="input-field text-xs font-semibold"
              >
                {assignments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.subject?.name} ({a.academicClass?.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Target Student</label>
              <select
                required
                value={formData.student}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                className="input-field text-xs font-semibold"
              >
                {students.map((st) => (
                  <option key={st._id} value={st.user?._id || st._id}>
                    {st.user?.name} ({st.studentId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Academic Performance</label>
              <select
                value={formData.academicPerformance}
                onChange={(e) => setFormData({ ...formData, academicPerformance: e.target.value })}
                className="input-field text-xs font-semibold"
              >
                <option value="EXCELLENT">EXCELLENT</option>
                <option value="GOOD">GOOD</option>
                <option value="SATISFACTORY">SATISFACTORY</option>
                <option value="NEEDS_IMPROVEMENT">NEEDS IMPROVEMENT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Participation Score (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={formData.participation}
                onChange={(e) => setFormData({ ...formData, participation: Number(e.target.value) })}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Observed Academic Strengths</label>
            <input
              type="text"
              required
              placeholder="e.g. Strong conceptual grasp of algorithms and active lab problem solver..."
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Areas Requiring Improvement</label>
            <input
              type="text"
              required
              placeholder="e.g. Recommend practicing edge cases and asynchronous error handling..."
              value={formData.areasOfImprovement}
              onChange={(e) => setFormData({ ...formData, areasOfImprovement: e.target.value })}
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">General Remarks & Guidance</label>
            <textarea
              rows={2}
              placeholder="Additional feedback for the student and parent..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="input-field text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline text-xs">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">
              {submitting ? 'Posting...' : 'Publish Evaluation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
