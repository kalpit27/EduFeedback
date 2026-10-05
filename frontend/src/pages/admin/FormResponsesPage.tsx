import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';
import { api } from '../../services/api.js';

export const FormResponsesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);
        const [formRes, respRes]: any = await Promise.all([
          api.get(`/forms/${id}`),
          api.get(`/forms/${id}/responses`),
        ]);

        setForm(formRes.data);
        setResponses(respRes.data || []);
      } catch (err) {
        console.error('Failed to load form responses', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResponses();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading confidential submission entries..." />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/forms')}
            className="p-1.5 text-neutral-secondary hover:text-[#1F2937] hover:bg-neutral-light rounded-btn transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#1F2937]">{form?.title}</h1>
              <Badge variant="cyan">Admin Only View</Badge>
            </div>
            <p className="text-xs text-neutral-secondary mt-0.5">
              Target: {form?.department?.name} | {form?.subject?.name} ({form?.teacher?.name})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#17B2BA] bg-[#1DCED8]/10 px-3 py-1.5 rounded-full">
            {responses.length} Submissions Logged
          </span>
        </div>
      </div>

      {/* Responses List */}
      {responses.length === 0 ? (
        <EmptyState
          title="No Responses Submitted Yet"
          description="Students have not yet submitted feedback for this evaluation form."
        />
      ) : (
        <div className="space-y-3">
          {responses.map((resp, index) => {
            const isExpanded = expandedId === resp._id;
            return (
              <div
                key={resp._id}
                className="bg-white border border-neutral-border rounded-card p-4 shadow-subtle hover:shadow-card transition-all"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : resp._id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1DCED8]/15 text-[#17B2BA] font-bold text-xs flex items-center justify-center">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1F2937]">
                        Student: {resp.student?.name} ({resp.student?.studentId})
                      </p>
                      <p className="text-[11px] text-neutral-secondary">
                        Submitted on {new Date(resp.submittedAt).toLocaleDateString()} at{' '}
                        {new Date(resp.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-secondary">
                      {resp.answers?.length || 0} Answers
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-neutral-secondary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-secondary" />
                    )}
                  </div>
                </div>

                {/* Expanded Answers View */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-neutral-border space-y-3">
                    {resp.answers?.map((ans: any, i: number) => (
                      <div key={i} className="p-3 bg-neutral-light rounded-btn text-xs space-y-1">
                        <p className="font-semibold text-[#1F2937]">
                          Q{i + 1}: {ans.questionText}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-secondary text-[11px]">Answer:</span>
                          <span className="font-bold text-[#17B2BA]">
                            {ans.numericValue ? `${ans.numericValue} / 5 Stars` : String(ans.value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
