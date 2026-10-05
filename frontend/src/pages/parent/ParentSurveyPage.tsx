import React, { useState, useEffect } from 'react';
import {
  Building2,
  Star,
  CheckCircle2,
  ShieldCheck,
  Send,
  AlertCircle,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { api } from '../../services/api.js';

export const ParentSurveyPage: React.FC = () => {
  const [parentForm, setParentForm] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchParentForm = async () => {
      try {
        setLoading(true);
        const res: any = await api.get('/forms?formType=PARENT_TO_INSTITUTE');
        const list = res.data || [];
        if (list.length > 0) {
          const f = list[0];
          setParentForm(f);

          const initMap: Record<string, any> = {};
          f.questions?.forEach((q: any) => {
            initMap[q.id] = 5;
          });
          setAnswers(initMap);
        }
      } catch (err) {
        console.error('Failed to load parent survey', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParentForm();
  }, []);

  const handleRatingChange = (qId: string, rating: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentForm) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const formattedAnswers = parentForm.questions.map((q: any) => ({
        questionId: q.id,
        questionText: q.text,
        category: q.category || 'General',
        type: q.type,
        value: answers[q.id] || 5,
        numericValue: Number(answers[q.id]) || 5,
      }));

      await api.post(`/forms/${parentForm._id}/responses`, {
        answers: formattedAnswers,
      });

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit parent survey.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading institutional quality survey..." />;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white border border-neutral-border rounded-dialog p-8 shadow-xl space-y-4">
          <div className="w-16 h-16 bg-[#55E07E]/20 text-[#2E9C4F] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Thank You For Your Feedback</h2>
          <p className="text-xs text-neutral-secondary max-w-md mx-auto leading-relaxed">
            Your evaluation has been successfully submitted to the Institutional Quality Assurance Committee.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-white border border-neutral-border rounded-card p-6 shadow-subtle space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#17B2BA] bg-[#1DCED8]/10 px-2.5 py-0.5 rounded-full">
          Annual Stakeholder Evaluation
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">
          {parentForm?.title || 'Parent Institutional Quality Survey'}
        </h1>
        <p className="text-xs text-neutral-secondary leading-relaxed">
          {parentForm?.description ||
            'Help our institute improve campus infrastructure, academic rigour, and faculty communication channels.'}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-btn flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {parentForm?.questions?.map((q: any, idx: number) => {
          const currentRating = answers[q.id] || 5;

          return (
            <div
              key={q.id}
              className="bg-white border border-neutral-border rounded-card p-5 shadow-subtle space-y-3"
            >
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1DCED8]/15 text-[#17B2BA] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#1F2937]">{q.text}</h3>
                  <span className="text-[10px] font-semibold text-[#E6853A] bg-[#FF9D50]/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {q.category}
                  </span>
                </div>
              </div>

              <div className="pl-8 pt-1 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(q.id, star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= currentRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-[#17B2BA]">{currentRating} / 5 Stars</span>
              </div>
            </div>
          );
        })}

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !parentForm}
            className="btn-primary py-2.5 px-6 text-sm font-semibold flex items-center gap-2 shadow-hover"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Institutional Feedback'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
