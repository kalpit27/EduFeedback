import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

export const TeacherFormsPage: React.FC = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<any[]>([]);
  const [submissionStatuses, setSubmissionStatuses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFormsAndStatus = async () => {
      try {
        setLoading(true);
        const formsRes: any = await api.get(`/forms?teacher=${user?.id}`);
        const list = formsRes.data || [];
        setForms(list);

        // Fetch aggregated submission status for each assigned form
        const statusMap: Record<string, any> = {};
        for (const f of list) {
          try {
            const statusRes: any = await api.get(`/forms/${f._id}/submission-status`);
            if (statusRes.success) {
              statusMap[f._id] = statusRes.data;
            }
          } catch (e) {
            console.warn(`Could not load status for form ${f._id}`);
          }
        }
        setSubmissionStatuses(statusMap);
      } catch (err) {
        console.error('Failed to load teacher forms', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchFormsAndStatus();
  }, [user?.id]);

  if (loading && forms.length === 0) return <LoadingSpinner message="Retrieving feedback participation metrics..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-neutral-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Feedback Participation Tracker</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            Monitor real-time student submission metrics for your assigned courses
          </p>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#17B2BA] bg-[#1DCED8]/10 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          Confidential Evaluation Stream
        </span>
      </div>

      {/* Confidentiality Reminder Banner */}
      <div className="p-4 bg-[#FFF9D8]/50 border border-[#FF9D50]/40 rounded-card flex items-start gap-3">
        <div className="p-2 bg-[#FF9D50]/20 text-[#E6853A] rounded-full flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-[#1F2937]">Student Confidentiality Policy</p>
          <p className="text-neutral-secondary leading-relaxed">
            In accordance with institutional academic ethics, instructors only have access to aggregate submission completion rates. Individual student ratings, responses, and qualitative comments are strictly confidential.
          </p>
        </div>
      </div>

      {/* Forms and Participation Cards */}
      {forms.length === 0 ? (
        <EmptyState
          title="No Feedback Forms Assigned"
          description="There are currently no active evaluation forms scheduled for your assigned subjects."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {forms.map((form) => {
            const status = submissionStatuses[form._id] || {
              totalStudents: 0,
              submittedCount: 0,
              pendingCount: 0,
              participationPercentage: 0,
            };

            return (
              <div
                key={form._id}
                className="bg-white border border-neutral-border rounded-card p-5 shadow-subtle hover:shadow-card transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant={form.status === 'PUBLISHED' ? 'green' : 'gray'}>
                      {form.status}
                    </Badge>
                    <span className="text-[11px] font-mono text-neutral-secondary">
                      {form.questions?.length || 0} Evaluative Items
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#1F2937]">{form.title}</h3>
                  <p className="text-xs text-neutral-secondary mt-1">
                    Subject: <strong className="text-[#1F2937]">{form.subject?.name || 'Assigned Subject'}</strong>
                  </p>
                </div>

                {/* Progress Bar & Key Numbers */}
                <div className="p-4 bg-neutral-light rounded-btn border border-neutral-border/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-secondary">Participation Progress</span>
                    <span className="font-bold text-[#17B2BA]">{status.participationPercentage}%</span>
                  </div>

                  <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-neutral-border">
                    <div
                      className="bg-gradient-to-r from-[#1DCED8] to-[#55E07E] h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, status.participationPercentage)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-border/50 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-neutral-secondary">Enrolled</p>
                      <p className="text-base font-extrabold text-[#1F2937]">{status.totalStudents}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-neutral-secondary">Submitted</p>
                      <p className="text-base font-extrabold text-[#17B2BA]">{status.submittedCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-neutral-secondary">Pending</p>
                      <p className="text-base font-extrabold text-[#E6853A]">{status.pendingCount}</p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-secondary flex items-center justify-between pt-1">
                  <span>Scope: {form.course?.name} ({form.semester?.name})</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live Synced
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
