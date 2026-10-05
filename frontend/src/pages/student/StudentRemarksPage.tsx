import React, { useState, useEffect } from 'react';
import { Award, BookOpen, User, Calendar, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

export const StudentRemarksPage: React.FC = () => {
  const { user } = useAuth();
  const [remarks, setRemarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemarks = async () => {
      try {
        setLoading(true);
        const res: any = await api.get(`/teacher-feedback/student/${user?.id}`);
        setRemarks(res.data || []);
      } catch (err) {
        console.error('Failed to load instructor remarks', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchRemarks();
  }, [user?.id]);

  if (loading) return <LoadingSpinner message="Loading instructor feedback remarks..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <h1 className="text-xl font-bold text-[#1F2937]">Instructor Progress Evaluations & Remarks</h1>
        <p className="text-xs text-neutral-secondary mt-0.5">
          Review personalized pedagogical evaluations, academic performance ratings, and learning guidance
        </p>
      </div>

      {remarks.length === 0 ? (
        <EmptyState
          title="No Instructor Remarks Yet"
          description="Your instructors will post academic feedback and evaluation notes here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {remarks.map((r) => (
            <div
              key={r._id}
              className="bg-white border border-neutral-border rounded-card p-6 shadow-subtle hover:shadow-card transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#17B2BA] bg-[#1DCED8]/10 px-2 py-0.5 rounded-full">
                    {r.subject?.name || 'Subject'}
                  </span>
                  <h3 className="text-sm font-bold text-[#1F2937] mt-1.5">
                    Evaluator: {r.teacher?.name}
                  </h3>
                  <p className="text-[11px] text-neutral-secondary font-mono">{r.teacher?.employeeId}</p>
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

              <div className="space-y-2 text-xs">
                <div className="p-3.5 bg-neutral-light rounded-btn space-y-2">
                  <div>
                    <strong className="text-[#1F2937] block mb-0.5">Observed Strengths:</strong>
                    <p className="text-emerald-800 font-medium">{r.strengths}</p>
                  </div>
                  <div>
                    <strong className="text-[#1F2937] block mb-0.5">Areas for Skill Refinement:</strong>
                    <p className="text-[#E6853A] font-medium">{r.areasOfImprovement}</p>
                  </div>
                  {r.remarks && (
                    <div className="pt-1.5 border-t border-neutral-border/60">
                      <strong className="text-[#1F2937] block mb-0.5">Instructor Notes:</strong>
                      <p className="text-neutral-secondary italic">"{r.remarks}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-secondary pt-2 border-t border-neutral-border/60">
                <span>Class Participation Rating: <strong>{r.participation} / 5</strong></span>
                <span>Evaluation Date: {new Date(r.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
