import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import { Complaint } from '../../types/index.js';
import { Modal } from '../../components/common/Modal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

export const ComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ACADEMIC',
    priority: 'MEDIUM',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/complaints');
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);
    try {
      await api.post('/complaints', formData);
      setModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'ACADEMIC',
        priority: 'MEDIUM',
      });
      await fetchComplaints();
    } catch (err: any) {
      setModalError(err.message || 'Failed to file concern');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && complaints.length === 0) return <LoadingSpinner message="Loading your filed complaints..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-neutral-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Complaints & Academic Concerns</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            File confidential grievances, infrastructure issues, or academic concerns directly with institute administration
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>File New Concern</span>
        </button>
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <EmptyState
          title="No Active Concerns Filed"
          description="If you have an academic, infrastructural, or administrative concern, file a ticket here."
          actionLabel="File Concern"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {complaints.map((c: any) => (
            <div
              key={c._id}
              className="bg-white border border-neutral-border rounded-card p-5 shadow-subtle hover:shadow-card transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      c.status === 'RESOLVED'
                        ? 'green'
                        : c.status === 'UNDER_REVIEW'
                        ? 'orange'
                        : 'cyan'
                    }
                  >
                    {c.status.replace(/_/g, ' ')}
                  </Badge>

                  <Badge variant={c.priority === 'URGENT' || c.priority === 'HIGH' ? 'danger' : 'gray'}>
                    {c.priority} Priority
                  </Badge>

                  <span className="text-xs font-semibold text-neutral-secondary bg-neutral-light px-2.5 py-0.5 rounded-full">
                    {c.category}
                  </span>
                </div>

                <span className="text-[11px] text-neutral-secondary">
                  Filed on {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#1F2937]">{c.title}</h3>
                <p className="text-xs text-neutral-secondary mt-1 leading-relaxed">{c.description}</p>
              </div>

              {/* Admin Response if available */}
              {c.adminResponse && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-btn text-xs space-y-1">
                  <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Administrative Resolution:</span>
                  </p>
                  <p className="text-emerald-900 leading-relaxed">{c.adminResponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Concern Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="File a Formal Academic / Campus Concern">
        {modalError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-btn flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleCreateComplaint} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Subject / Summary</label>
            <input
              type="text"
              required
              placeholder="e.g. Broken projector in Room 302..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field text-xs"
              >
                <option value="ACADEMIC">ACADEMIC</option>
                <option value="INFRASTRUCTURE">INFRASTRUCTURE</option>
                <option value="ADMINISTRATIVE">ADMINISTRATIVE</option>
                <option value="FACULTY">FACULTY</option>
                <option value="HARASSMENT">HARASSMENT / SAFETY</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Urgency Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input-field text-xs"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Detailed Description</label>
            <textarea
              required
              rows={4}
              placeholder="Provide specific details, dates, location, and context..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline text-xs">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">
              {submitting ? 'Submitting...' : 'File Concern'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
