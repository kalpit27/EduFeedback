import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Building2,
  BookOpen,
} from 'lucide-react';
import { FeedbackForm } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';
import { api } from '../../services/api.js';

export const StudentFormsPage: React.FC = () => {
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const res: any = await api.get('/forms/available');
        setForms(res.data || []);
      } catch (err) {
        console.error('Failed to load available forms', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  if (loading && forms.length === 0) return <LoadingSpinner message="Loading course feedback evaluations..." />;

  const filtered = forms.filter((f) => {
    if (filter === 'PENDING') return !f.isSubmitted;
    if (filter === 'COMPLETED') return f.isSubmitted;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-neutral-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Academic Evaluation Surveys</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            Confidential course and faculty feedback forms assigned to your enrolled semester
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1 bg-neutral-light p-1 rounded-btn">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-btn text-xs font-semibold transition-all ${
              filter === 'ALL' ? 'bg-white text-[#17B2BA] shadow-subtle' : 'text-neutral-secondary hover:text-[#1F2937]'
            }`}
          >
            All Surveys ({forms.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1 rounded-btn text-xs font-semibold transition-all ${
              filter === 'PENDING' ? 'bg-white text-[#E6853A] shadow-subtle' : 'text-neutral-secondary hover:text-[#1F2937]'
            }`}
          >
            Pending ({forms.filter((f) => !f.isSubmitted).length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1 rounded-btn text-xs font-semibold transition-all ${
              filter === 'COMPLETED' ? 'bg-white text-emerald-600 shadow-subtle' : 'text-neutral-secondary hover:text-[#1F2937]'
            }`}
          >
            Completed ({forms.filter((f) => f.isSubmitted).length})
          </button>
        </div>
      </div>

      {/* Forms Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Forms Found"
          description="There are currently no active feedback forms matching your filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((form: any) => (
            <div
              key={form._id}
              className="bg-white border border-neutral-border rounded-card p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant={form.isSubmitted ? 'green' : 'orange'}>
                    {form.isSubmitted ? 'COMPLETED' : 'PENDING ACTION'}
                  </Badge>
                  <span className="text-[10px] font-mono text-neutral-secondary">
                    {form.questions?.length || 0} Questions
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#1F2937] leading-snug">{form.title}</h3>
                <p className="text-xs text-neutral-secondary line-clamp-2 mt-1">
                  {form.description || form.instructions}
                </p>

                <div className="mt-3 pt-3 border-t border-neutral-border/60 text-xs text-neutral-secondary space-y-1">
                  <p>
                    <strong className="text-[#1F2937]">Subject:</strong> {form.subject?.name || 'General Evaluation'}
                  </p>
                  <p>
                    <strong className="text-[#1F2937]">Faculty:</strong>{' '}
                    <span className="text-[#17B2BA] font-semibold">{form.teacher?.name || 'Academic Committee'}</span>
                  </p>
                  <p>
                    <strong className="text-[#1F2937]">Term:</strong> {form.course?.name} ({form.semester?.name})
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-border flex items-center justify-between">
                {form.isSubmitted ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] text-neutral-secondary">
                      Submitted on {form.submittedAt ? new Date(form.submittedAt).toLocaleDateString() : 'Recorded'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-btn border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Response Recorded</span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] text-neutral-secondary flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#17B2BA]" />
                      <span>100% Confidential</span>
                    </span>
                    <NavLink
                      to={`/student/forms/${form._id}`}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <span>Fill Survey</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
