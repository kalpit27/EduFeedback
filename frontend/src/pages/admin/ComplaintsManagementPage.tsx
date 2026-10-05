import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Filter,
  User,
  Building2,
  Calendar,
} from 'lucide-react';
import { Complaint } from '../../types/index.js';
import { Modal } from '../../components/common/Modal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';
import { api } from '../../services/api.js';

export const ComplaintsManagementPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminResponse, setAdminResponse] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('RESOLVED');
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      let query = '';
      if (statusFilter) query += `status=${statusFilter}&`;
      if (priorityFilter) query += `priority=${priorityFilter}&`;

      const res: any = await api.get(`/complaints?${query}`);
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter]);

  const openResolutionModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAdminResponse(complaint.adminResponse || '');
    setNewStatus(complaint.status === 'OPEN' ? 'UNDER_REVIEW' : complaint.status);
  };

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdating(true);
    try {
      await api.put(`/complaints/${selectedComplaint._id}`, {
        status: newStatus,
        adminResponse,
      });
      setSelectedComplaint(null);
      await fetchComplaints();
    } catch (err) {
      console.error('Failed to update complaint', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading && complaints.length === 0) return <LoadingSpinner message="Loading institutional concerns & complaints..." />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Complaints & Academic Grievances</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            Institutional helpdesk for student, faculty, and parent concerns with formal resolution tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-3 border border-neutral-border rounded-btn bg-white font-medium"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs py-1.5 px-3 border border-neutral-border rounded-btn bg-white font-medium"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <EmptyState
          title="No Complaints or Concerns Found"
          description="There are currently no active complaints matching the selected filter."
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
                        : c.status === 'OPEN'
                        ? 'cyan'
                        : 'gray'
                    }
                  >
                    {c.status.replace(/_/g, ' ')}
                  </Badge>

                  <Badge
                    variant={
                      c.priority === 'URGENT' || c.priority === 'HIGH' ? 'danger' : 'gray'
                    }
                  >
                    {c.priority} Priority
                  </Badge>

                  <span className="text-xs font-semibold text-neutral-secondary bg-neutral-light px-2 py-0.5 rounded-full">
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

              {/* Creator & Department Info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-secondary pt-2 border-t border-neutral-border/60">
                <div className="flex items-center gap-1.5 font-medium text-[#1F2937]">
                  <User className="w-3.5 h-3.5 text-[#17B2BA]" />
                  <span>
                    Filed by {c.createdBy?.name} ({c.createdBy?.role})
                  </span>
                </div>
                {c.department && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-neutral-secondary" />
                    <span>{c.department?.name}</span>
                  </div>
                )}
              </div>

              {/* Admin Response Box (if resolved/reviewed) */}
              {c.adminResponse && (
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/60 rounded-btn text-xs space-y-1">
                  <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Official Institutional Response:</span>
                  </p>
                  <p className="text-emerald-900 leading-relaxed">{c.adminResponse}</p>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 text-right">
                <button
                  onClick={() => openResolutionModal(c)}
                  className="btn-outline text-xs py-1.5 px-3 font-semibold text-[#17B2BA] border-[#1DCED8]/40 hover:bg-[#1DCED8]/10"
                >
                  Manage & Respond →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title="Manage Complaint & Issue Resolution"
      >
        <form onSubmit={handleUpdateComplaint} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Update Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="input-field text-xs font-semibold"
            >
              <option value="OPEN">OPEN</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">
              Official Resolution / Admin Remarks
            </label>
            <textarea
              required
              rows={4}
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Provide clear corrective action steps taken..."
              className="input-field text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border">
            <button type="button" onClick={() => setSelectedComplaint(null)} className="btn-outline text-xs">
              Cancel
            </button>
            <button type="submit" disabled={updating} className="btn-primary text-xs">
              {updating ? 'Updating...' : 'Save Resolution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
