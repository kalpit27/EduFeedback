import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  Sparkles,
  BookOpen,
  User,
  GraduationCap,
} from 'lucide-react';
import { FeedbackForm } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.js';
import { api } from '../../services/api.js';

export const StudentFormFillPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const res: any = await api.get(`/forms/${id}`);
        const f = res.data;
        setForm(f);

        // Pre-populate empty answers
        const initialAnswers: Record<string, any> = {};
        f.questions?.forEach((q: any) => {
          if (q.type === 'STAR_RATING' || q.type === 'RATING_SCALE') initialAnswers[q.id] = 5;
          else if (q.type === 'YES_NO') initialAnswers[q.id] = 'Yes';
          else if (q.type === 'CHECKBOX') initialAnswers[q.id] = [];
          else initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load form');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchForm();
  }, [id]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxToggle = (questionId: string, option: string) => {
    const currentList: string[] = answers[questionId] || [];
    if (currentList.includes(option)) {
      handleAnswerChange(
        questionId,
        currentList.filter((item) => item !== option)
      );
    } else {
      handleAnswerChange(questionId, [...currentList, option]);
    }
  };

  const handleFormSubmit = async () => {
    setErrorMessage(null);
    setConfirmOpen(false);
    setSubmitting(true);

    try {
      if (!form) return;

      const formattedAnswers = form.questions.map((q) => {
        const val = answers[q.id];
        let numVal: number | undefined = undefined;
        if (q.type === 'STAR_RATING' || q.type === 'RATING_SCALE' || q.type === 'NUMBER_RATING') {
          numVal = Number(val) || 5;
        }

        return {
          questionId: q.id,
          questionText: q.text,
          category: q.category || 'General',
          type: q.type,
          value: val,
          numericValue: numVal,
        };
      });

      await api.post(`/forms/${form._id}/responses`, {
        answers: formattedAnswers,
      });

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Opening feedback evaluation session..." />;

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-fadeIn">
        <div className="bg-white border border-neutral-border rounded-dialog p-8 shadow-xl space-y-4">
          <div className="w-16 h-16 bg-[#55E07E]/20 text-[#2E9C4F] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Feedback Submitted Successfully</h2>
          <p className="text-xs text-neutral-secondary max-w-md mx-auto leading-relaxed">
            Thank you for participating in the academic evaluation process. Your responses have been securely anonymized and recorded.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/student/forms')}
              className="btn-primary text-xs py-2 px-5"
            >
              Back to Available Surveys
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/forms')}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-secondary hover:text-[#1F2937] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Surveys</span>
        </button>

        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17B2BA] bg-[#1DCED8]/10 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          Anonymous & Encrypted
        </span>
      </div>

      {/* Form Details & Scope Banner */}
      <div className="bg-white border border-neutral-border rounded-card p-6 shadow-subtle space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E6853A] bg-[#FF9D50]/15 px-2.5 py-0.5 rounded-full">
            Course Evaluation Survey
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937] mt-1.5">{form?.title}</h1>
          <p className="text-xs text-neutral-secondary mt-1 leading-relaxed">
            {form?.description || form?.instructions}
          </p>
        </div>

        {/* Scope Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-border text-xs text-neutral-secondary">
          <div>
            <strong className="text-[#1F2937] block">Faculty:</strong>
            <span>{(form?.teacher as any)?.name || 'Course Instructor'}</span>
          </div>
          <div>
            <strong className="text-[#1F2937] block">Subject:</strong>
            <span>{(form?.subject as any)?.name || 'Course Subject'}</span>
          </div>
          <div>
            <strong className="text-[#1F2937] block">Term:</strong>
            <span>
              {(form?.course as any)?.name} ({(form?.semester as any)?.name})
            </span>
          </div>
        </div>
      </div>

      {/* Trust Callout */}
      <div className="p-4 bg-[#FFF9D8]/50 border border-[#FF9D50]/40 rounded-card flex items-start gap-3">
        <div className="p-2 bg-[#FF9D50]/20 text-[#E6853A] rounded-full flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-[#1F2937]">Academic Confidentiality Guarantee</p>
          <p className="text-neutral-secondary leading-relaxed">
            Your feedback is confidential and will only be used for authorized institutional analysis. The instructor will never be able to see who provided which ratings.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-btn flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Questions Card List */}
      <div className="space-y-4">
        {form?.questions?.map((q, idx) => {
          const currentVal = answers[q.id];

          return (
            <div
              key={q.id}
              className="bg-white border border-neutral-border rounded-card p-5 shadow-subtle space-y-3.5"
            >
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1DCED8]/15 text-[#17B2BA] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#1F2937]">
                    {q.text}
                    {q.required && <span className="text-rose-500 ml-1">*</span>}
                  </h3>
                  {q.description && <p className="text-xs text-neutral-secondary mt-0.5">{q.description}</p>}
                </div>
              </div>

              <div className="pl-8 pt-1">
                {/* 1. STAR RATING */}
                {q.type === 'STAR_RATING' && (
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= (currentVal || 0);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleAnswerChange(q.id, star)}
                          className="p-1 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              isFilled ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-xs font-bold text-[#17B2BA]">
                      {currentVal ? `${currentVal} / 5 Stars` : 'Select rating'}
                    </span>
                  </div>
                )}

                {/* 2. RATING SCALE (1-5) */}
                {q.type === 'RATING_SCALE' && (
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, num)}
                        className={`w-10 h-10 rounded-btn font-bold text-xs transition-all border ${
                          currentVal === num
                            ? 'bg-[#1DCED8] text-white border-[#1DCED8] shadow-subtle'
                            : 'bg-white border-neutral-border text-[#1F2937] hover:bg-[#1DCED8]/10'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. NUMBER RATING (1-10) */}
                {q.type === 'NUMBER_RATING' && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, num)}
                        className={`w-8 h-8 rounded-btn font-bold text-xs transition-all border ${
                          currentVal === num
                            ? 'bg-[#1DCED8] text-white border-[#1DCED8]'
                            : 'bg-white border-neutral-border text-[#1F2937] hover:bg-[#1DCED8]/10'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}

                {/* 4. YES / NO */}
                {q.type === 'YES_NO' && (
                  <div className="flex items-center gap-3">
                    {['Yes', 'No'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`px-5 py-2 rounded-btn font-semibold text-xs border transition-all ${
                          currentVal === opt
                            ? 'bg-[#1DCED8] text-white border-[#1DCED8] shadow-subtle'
                            : 'bg-white border-neutral-border text-[#1F2937] hover:bg-neutral-light'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* 5. MULTIPLE CHOICE */}
                {q.type === 'MULTIPLE_CHOICE' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <label
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-btn border text-xs cursor-pointer transition-all ${
                          currentVal === opt
                            ? 'border-[#1DCED8] bg-[#1DCED8]/5 font-semibold text-[#1F2937]'
                            : 'border-neutral-border hover:bg-neutral-light'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          checked={currentVal === opt}
                          onChange={() => handleAnswerChange(q.id, opt)}
                          className="w-4 h-4 text-[#1DCED8] focus:ring-[#1DCED8]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* 6. CHECKBOX */}
                {q.type === 'CHECKBOX' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt, i) => {
                      const isChecked = (currentVal || []).includes(opt);
                      return (
                        <label
                          key={i}
                          className={`flex items-center gap-3 p-3 rounded-btn border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'border-[#1DCED8] bg-[#1DCED8]/5 font-semibold text-[#1F2937]'
                              : 'border-neutral-border hover:bg-neutral-light'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxToggle(q.id, opt)}
                            className="w-4 h-4 text-[#1DCED8] rounded focus:ring-[#1DCED8]"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 7. DROPDOWN */}
                {q.type === 'DROPDOWN' && q.options && (
                  <select
                    value={currentVal || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="input-field text-xs max-w-md"
                  >
                    <option value="">-- Choose an option --</option>
                    {q.options.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {/* 8. SHORT TEXT */}
                {q.type === 'TEXT' && (
                  <input
                    type="text"
                    value={currentVal || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Your response here..."
                    className="input-field text-xs max-w-lg"
                  />
                )}

                {/* 9. LONG TEXT */}
                {q.type === 'LONG_TEXT' && (
                  <textarea
                    rows={3}
                    value={currentVal || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Provide detailed constructive observations..."
                    className="input-field text-xs"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={submitting}
          className="btn-primary py-2.5 px-6 text-sm font-semibold flex items-center gap-2 shadow-hover"
        >
          <Send className="w-4 h-4" />
          <span>Submit Confidential Feedback</span>
        </button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleFormSubmit}
        title="Submit Feedback Evaluation?"
        message="Once submitted, your response is final and will be anonymized. You cannot submit multiple times for this course."
        confirmLabel="Yes, Submit Feedback"
        isLoading={submitting}
      />
    </div>
  );
};
