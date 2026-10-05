import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  Save,
  Send,
  Star,
  List,
  CheckSquare,
  HelpCircle,
  Type,
  AlignLeft,
  Sliders,
  Hash,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { FormQuestion, QuestionType } from '../../types/index.js';
import { Modal } from '../../components/common/Modal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { api } from '../../services/api.js';

export const FormBuilderPage: React.FC = () => {
  const navigate = useNavigate();

  // Academic Scoping State
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [formMeta, setFormMeta] = useState({
    title: 'Mid-Semester Student Evaluation of Faculty',
    description: 'Confidential student feedback regarding course delivery, subject clarity, and lab exercises.',
    instructions: 'Your feedback is completely confidential and aggregated anonymously for academic quality assurance.',
    formType: 'STUDENT_TO_TEACHER',
    department: '',
    course: '',
    academicClass: '',
    semester: '',
    subject: '',
    teacher: '',
    status: 'DRAFT',
  });

  // Questions List
  const [questions, setQuestions] = useState<FormQuestion[]>([
    {
      id: 'q_' + Math.random().toString(36).substr(2, 9),
      text: 'How would you rate the instructor’s depth of subject knowledge & concept explanation?',
      type: 'STAR_RATING',
      category: 'Subject Knowledge',
      required: true,
      order: 1,
      min: 1,
      max: 5,
    },
    {
      id: 'q_' + Math.random().toString(36).substr(2, 9),
      text: 'How effective is the instructor in communicating complex programming logic and solving doubts?',
      type: 'STAR_RATING',
      category: 'Communication',
      required: true,
      order: 2,
      min: 1,
      max: 5,
    },
    {
      id: 'q_' + Math.random().toString(36).substr(2, 9),
      text: 'How would you evaluate the pace of lectures and adherence to course syllabus timetable?',
      type: 'RATING_SCALE',
      category: 'Teaching Quality',
      required: true,
      order: 3,
      min: 1,
      max: 5,
    },
    {
      id: 'q_' + Math.random().toString(36).substr(2, 9),
      text: 'Does the instructor provide practical code examples and hands-on laboratory exercises?',
      type: 'YES_NO',
      category: 'Teaching Quality',
      options: ['Yes', 'No'],
      required: true,
      order: 4,
    },
  ]);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAcademicMetadata = async () => {
      try {
        setLoading(true);
        const [dRes, cRes, clRes, sRes, subRes, tRes]: any = await Promise.all([
          api.get('/departments'),
          api.get('/courses'),
          api.get('/classes'),
          api.get('/semesters'),
          api.get('/subjects'),
          api.get('/teachers'),
        ]);

        const depts = dRes.data || [];
        const crs = cRes.data || [];
        const cls = clRes.data || [];
        const sems = sRes.data || [];
        const subjs = subRes.data || [];
        const tchs = tRes.data || [];

        setDepartments(depts);
        setCourses(crs);
        setClasses(cls);
        setSemesters(sems);
        setSubjects(subjs);
        setTeachers(tchs);

        setFormMeta((prev) => ({
          ...prev,
          department: depts[0]?._id || '',
          course: crs[0]?._id || '',
          academicClass: cls[0]?._id || '',
          semester: sems[0]?._id || '',
          subject: subjs[0]?._id || '',
          teacher: tchs[0]?._id || '',
        }));

        if (questions.length > 0) {
          setSelectedQuestionId(questions[0].id);
        }
      } catch (err) {
        console.error('Failed to load academic data for builder', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademicMetadata();
  }, []);

  const addQuestion = (type: QuestionType) => {
    const defaultOptions =
      type === 'MULTIPLE_CHOICE' || type === 'CHECKBOX' || type === 'DROPDOWN'
        ? ['Option 1', 'Option 2', 'Option 3']
        : type === 'YES_NO'
        ? ['Yes', 'No']
        : undefined;

    const newQuestion: FormQuestion = {
      id: 'q_' + Math.random().toString(36).substr(2, 9),
      text: `New ${type.replace(/_/g, ' ')} Question`,
      type,
      options: defaultOptions,
      required: true,
      category: 'Teaching Quality',
      order: questions.length + 1,
      min: 1,
      max: 5,
    };

    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
  };

  const removeQuestion = (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    if (selectedQuestionId === id) {
      setSelectedQuestionId(updated[0]?.id || null);
    }
  };

  const duplicateQuestion = (question: FormQuestion) => {
    const dup: FormQuestion = {
      ...question,
      id: 'q_' + Math.random().toString(36).substr(2, 9),
      text: question.text + ' (Copy)',
      order: questions.length + 1,
    };
    setQuestions([...questions, dup]);
    setSelectedQuestionId(dup.id);
  };

  const updateSelectedQuestion = (updatedFields: Partial<FormQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === selectedQuestionId ? { ...q, ...updatedFields } : q))
    );
  };

  const currentQuestion = questions.find((q) => q.id === selectedQuestionId);

  const handleSaveForm = async (status: 'DRAFT' | 'PUBLISHED') => {
    setErrorMessage(null);
    if (!formMeta.title.trim()) {
      setErrorMessage('Form title is required.');
      return;
    }
    if (!formMeta.department) {
      setErrorMessage('Department target is required.');
      return;
    }
    if (questions.length === 0) {
      setErrorMessage('Form must contain at least one question.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formMeta,
        status,
        questions: questions.map((q, i) => ({ ...q, order: i + 1 })),
      };

      await api.post('/forms', payload);
      navigate('/admin/forms');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save feedback form');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Configuring dynamic form builder environment..." />;

  const questionPaletteItems: { type: QuestionType; label: string; icon: any }[] = [
    { type: 'STAR_RATING', label: 'Star Rating (1-5)', icon: Star },
    { type: 'RATING_SCALE', label: 'Rating Scale (1-5)', icon: Sliders },
    { type: 'NUMBER_RATING', label: 'Numerical Score (1-10)', icon: Hash },
    { type: 'YES_NO', label: 'Yes / No Choice', icon: HelpCircle },
    { type: 'MULTIPLE_CHOICE', label: 'Multiple Choice (Single)', icon: List },
    { type: 'CHECKBOX', label: 'Checkboxes (Multi-select)', icon: CheckSquare },
    { type: 'TEXT', label: 'Short Text Answer', icon: Type },
    { type: 'LONG_TEXT', label: 'Long Qualitative Remark', icon: AlignLeft },
  ];

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-card border border-neutral-border shadow-subtle">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/forms')}
            className="p-1.5 text-neutral-secondary hover:text-[#1F2937] hover:bg-neutral-light rounded-btn transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#1F2937]">Dynamic Form Builder</h1>
            <p className="text-xs text-neutral-secondary">Compose, configure scope, and publish custom academic feedback surveys</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewOpen(true)}
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Form</span>
          </button>
          <button
            onClick={() => handleSaveForm('DRAFT')}
            disabled={saving}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => handleSaveForm('PUBLISHED')}
            disabled={saving}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Form</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-btn flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3-COLUMN FORM BUILDER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Question Types Palette (3 Cols) */}
        <div className="lg:col-span-3 card-container space-y-3 sticky top-20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F2937] uppercase tracking-wider">
            <Plus className="w-3.5 h-3.5 text-[#17B2BA]" />
            <span>Question Palette</span>
          </div>
          <p className="text-[11px] text-neutral-secondary">Click to insert question into active canvas</p>

          <div className="space-y-1.5 pt-1">
            {questionPaletteItems.map((item) => (
              <button
                key={item.type}
                onClick={() => addQuestion(item.type)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1F2937] bg-neutral-light hover:bg-[#1DCED8]/10 hover:text-[#17B2BA] border border-neutral-border/70 rounded-btn transition-all text-left group"
              >
                <item.icon className="w-4 h-4 text-neutral-secondary group-hover:text-[#17B2BA]" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN: Form Canvas & Scope Target (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Academic Scope & Targeting */}
          <div className="card-container bg-[#FFF9D8]/20 border-[#FF9D50]/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E6853A] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Target Scope (Strict Isolation)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] uppercase mb-1">Target Department</label>
                <select
                  value={formMeta.department}
                  onChange={(e) => setFormMeta({ ...formMeta, department: e.target.value })}
                  className="input-field text-xs"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] uppercase mb-1">Course / Program</label>
                <select
                  value={formMeta.course}
                  onChange={(e) => setFormMeta({ ...formMeta, course: e.target.value })}
                  className="input-field text-xs"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] uppercase mb-1">Class / Year</label>
                <select
                  value={formMeta.academicClass}
                  onChange={(e) => setFormMeta({ ...formMeta, academicClass: e.target.value })}
                  className="input-field text-xs"
                >
                  {classes.map((cl) => (
                    <option key={cl._id} value={cl._id}>{cl.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] uppercase mb-1">Semester</label>
                <select
                  value={formMeta.semester}
                  onChange={(e) => setFormMeta({ ...formMeta, semester: e.target.value })}
                  className="input-field text-xs"
                >
                  {semesters.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] uppercase mb-1">Subject</label>
                <select
                  value={formMeta.subject}
                  onChange={(e) => setFormMeta({ ...formMeta, subject: e.target.value })}
                  className="input-field text-xs"
                >
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1F2937] uppercase mb-1">Assigned Faculty Member</label>
              <select
                value={formMeta.teacher}
                onChange={(e) => setFormMeta({ ...formMeta, teacher: e.target.value })}
                className="input-field text-xs"
              >
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name} ({t.employeeId || t.email})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Header Info */}
          <div className="card-container space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Form Title</label>
              <input
                type="text"
                value={formMeta.title}
                onChange={(e) => setFormMeta({ ...formMeta, title: e.target.value })}
                className="input-field font-semibold text-base"
                placeholder="e.g. Mid-Semester Faculty Evaluation"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Description & Instructions</label>
              <textarea
                value={formMeta.instructions}
                onChange={(e) => setFormMeta({ ...formMeta, instructions: e.target.value })}
                rows={2}
                className="input-field text-xs"
                placeholder="Instructions displayed to students before submitting feedback..."
              />
            </div>
          </div>

          {/* Form Canvas Questions List */}
          <div className="space-y-3">
            {questions.map((q, index) => {
              const isSelected = q.id === selectedQuestionId;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`p-4 rounded-card border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-[#1DCED8] ring-2 ring-[#1DCED8]/20 shadow-hover'
                      : 'border-neutral-border hover:border-[#1DCED8]/50 shadow-subtle'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="w-5 h-5 rounded-full bg-neutral-light text-[#1F2937] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#1F2937]">
                          {q.text}
                          {q.required && <span className="text-rose-500 ml-1">*</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-[#1DCED8]/10 text-[#17B2BA] text-[10px] font-semibold">
                            {q.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] text-neutral-secondary font-medium">{q.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateQuestion(q);
                        }}
                        className="p-1.5 text-neutral-secondary hover:text-[#17B2BA] hover:bg-neutral-light rounded-btn"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(q.id);
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-btn"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Question Properties / Settings (3 Cols) */}
        <div className="lg:col-span-3 card-container space-y-4 sticky top-20">
          <div className="text-xs font-bold text-[#1F2937] uppercase tracking-wider border-b border-neutral-border pb-2">
            Question Properties
          </div>

          {currentQuestion ? (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] uppercase mb-1">Question Text</label>
                <textarea
                  value={currentQuestion.text}
                  onChange={(e) => updateSelectedQuestion({ text: e.target.value })}
                  rows={2}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] uppercase mb-1">Evaluation Category</label>
                <select
                  value={currentQuestion.category}
                  onChange={(e) => updateSelectedQuestion({ category: e.target.value })}
                  className="input-field text-xs"
                >
                  <option value="Teaching Quality">Teaching Quality</option>
                  <option value="Communication">Communication</option>
                  <option value="Subject Knowledge">Subject Knowledge</option>
                  <option value="Clarity & Explanation">Clarity & Explanation</option>
                  <option value="Punctuality">Punctuality</option>
                  <option value="Overall Satisfaction">Overall Satisfaction</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-neutral-light rounded-btn border border-neutral-border">
                <span className="font-semibold text-[#1F2937]">Mandatory Response</span>
                <input
                  type="checkbox"
                  checked={currentQuestion.required}
                  onChange={(e) => updateSelectedQuestion({ required: e.target.checked })}
                  className="w-4 h-4 text-[#1DCED8] rounded focus:ring-[#1DCED8]"
                />
              </div>

              {/* Options Editor for MCQ / Checkbox / Dropdown */}
              {currentQuestion.options && (
                <div className="space-y-2 pt-2 border-t border-neutral-border">
                  <label className="block text-[11px] font-semibold text-[#1F2937] uppercase">Choice Options</label>
                  {currentQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(currentQuestion.options || [])];
                          newOpts[i] = e.target.value;
                          updateSelectedQuestion({ options: newOpts });
                        }}
                        className="input-field text-xs py-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = currentQuestion.options?.filter((_, idx) => idx !== i);
                          updateSelectedQuestion({ options: newOpts });
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      updateSelectedQuestion({
                        options: [...(currentQuestion.options || []), `Option ${(currentQuestion.options?.length || 0) + 1}`],
                      });
                    }}
                    className="text-[11px] font-bold text-[#17B2BA] hover:underline"
                  >
                    + Add Choice Option
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-neutral-secondary">Select a question on the canvas to configure settings.</p>
          )}
        </div>
      </div>

      {/* Live Preview Modal */}
      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Student Form Preview" maxWidth="2xl">
        <div className="space-y-5 bg-[#FFF9D8]/20 p-5 rounded-card border border-neutral-border">
          <div>
            <h3 className="text-base font-bold text-[#1F2937]">{formMeta.title}</h3>
            <p className="text-xs text-neutral-secondary mt-1">{formMeta.instructions}</p>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-4 rounded-card border border-neutral-border shadow-subtle space-y-2.5">
                <p className="text-xs font-bold text-[#1F2937]">
                  {idx + 1}. {q.text}
                  {q.required && <span className="text-rose-500 ml-1">*</span>}
                </p>

                {q.type === 'STAR_RATING' && (
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-6 h-6 fill-amber-400 cursor-pointer" />
                    ))}
                  </div>
                )}

                {q.type === 'RATING_SCALE' && (
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button key={num} type="button" className="w-8 h-8 rounded-btn border border-neutral-border font-bold text-xs hover:bg-[#1DCED8]/10 hover:text-[#17B2BA]">
                        {num}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'YES_NO' && (
                  <div className="flex items-center gap-3">
                    <button type="button" className="px-4 py-1.5 rounded-btn border border-neutral-border text-xs font-semibold hover:bg-[#1DCED8]/10">
                      Yes
                    </button>
                    <button type="button" className="px-4 py-1.5 rounded-btn border border-neutral-border text-xs font-semibold hover:bg-[#1DCED8]/10">
                      No
                    </button>
                  </div>
                )}

                {q.type === 'LONG_TEXT' && (
                  <textarea rows={2} placeholder="Student constructive remarks..." className="input-field text-xs" disabled />
                )}

                {q.options && q.type === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-1 text-xs">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 text-neutral-secondary">
                        <input type="radio" name={`preview_${q.id}`} className="text-[#1DCED8]" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-right">
            <button type="button" onClick={() => setPreviewOpen(false)} className="btn-primary text-xs">
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
