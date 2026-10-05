import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  BarChart2,
  Users,
  Send,
  Lock,
  Trash2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { FeedbackForm } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';
import { api } from '../../services/api.js';

export const FormsListPage: React.FC = () => {
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchForms = async () => {
    try {
      setLoading(true);
      let query = '';
      if (selectedDept) query += `department=${selectedDept}&`;
      if (selectedStatus) query += `status=${selectedStatus}&`;

      const [formsRes, deptRes]: any = await Promise.all([
        api.get(`/forms?${query}`),
        departments.length === 0 ? api.get('/departments') : Promise.resolve({ data: departments }),
      ]);

      setForms(formsRes.data || []);
      if (departments.length === 0) setDepartments(deptRes.data || []);
    } catch (err) {
      console.error('Failed to load forms', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [selectedDept, selectedStatus]);

  const handlePublish = async (id: string) => {
    await api.post(`/forms/${id}/publish`);
    fetchForms();
  };

  const handleClose = async (id: string) => {
    await api.post(`/forms/${id}/close`);
    fetchForms();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this form and all its responses?')) {
      await api.delete(`/forms/${id}`);
      fetchForms();
    }
  };

  if (loading && forms.length === 0) return <LoadingSpinner message="Loading feedback forms..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Feedback Forms & Evaluations</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            Manage institutional surveys, student evaluation forms, and response submissions
          </p>
        </div>

        <NavLink to="/admin/forms/new" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Create New Form</span>
        </NavLink>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-card border border-neutral-border">
        <div className="flex items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs py-1.5 px-3 border border-neutral-border rounded-btn bg-white font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-1.5 px-3 border border-neutral-border rounded-btn bg-white font-medium"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-neutral-secondary">{forms.length} Total Survey Form(s)</span>
      </div>

      {/* Forms Grid / List */}
      {forms.length === 0 ? (
        <EmptyState
          title="No Feedback Forms Found"
          description="Create a dynamic evaluation form to start collecting confidential feedback."
          actionLabel="Build First Form"
          onAction={() => navigate('/admin/forms/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forms.map((form: any) => (
            <div
              key={form._id}
              className="bg-white border border-neutral-border rounded-card p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge
                    variant={
                      form.status === 'PUBLISHED'
                        ? 'green'
                        : form.status === 'DRAFT'
                        ? 'orange'
                        : 'gray'
                    }
                  >
                    {form.status}
                  </Badge>

                  <span className="text-[10px] font-mono text-neutral-secondary">
                    {form.questions?.length || 0} Questions
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#1F2937] leading-snug">{form.title}</h3>
                <p className="text-xs text-neutral-secondary line-clamp-2 mt-1">{form.description || form.instructions}</p>

                {/* Scope details */}
                <div className="mt-3.5 pt-3 border-t border-neutral-border/60 text-xs space-y-1 text-neutral-secondary">
                  <p>
                    <strong className="text-[#1F2937]">Department:</strong> {form.department?.name || 'All'}
                  </p>
                  {form.course && (
                    <p>
                      <strong className="text-[#1F2937]">Target:</strong> {form.course?.name} ({form.academicClass?.name} {form.semester?.name})
                    </p>
                  )}
                  {form.subject && (
                    <p>
                      <strong className="text-[#1F2937]">Subject & Faculty:</strong> {form.subject?.name} —{' '}
                      <span className="text-[#17B2BA] font-medium">{form.teacher?.name || 'Unassigned'}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-neutral-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <NavLink
                    to={`/admin/forms/${form._id}/responses`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#1DCED8]/10 text-[#17B2BA] rounded-btn hover:bg-[#1DCED8]/20 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Responses</span>
                  </NavLink>

                  <NavLink
                    to={`/admin/forms/${form._id}/analytics`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-neutral-light text-[#1F2937] hover:bg-neutral-border/40 rounded-btn transition-colors"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-[#E6853A]" />
                    <span>Analytics</span>
                  </NavLink>
                </div>

                <div className="flex items-center gap-1">
                  {form.status === 'DRAFT' && (
                    <button
                      onClick={() => handlePublish(form._id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-btn"
                      title="Publish Now"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  {form.status === 'PUBLISHED' && (
                    <button
                      onClick={() => handleClose(form._id)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-btn"
                      title="Close Form"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(form._id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-btn"
                    title="Delete Form"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
