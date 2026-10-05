import React, { useState, useEffect } from 'react';
import {
  Building2,
  BookOpen,
  Layers,
  Calendar,
  BookMarked,
  UserCheck,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Badge } from '../../components/common/Badge.js';
import { api } from '../../services/api.js';

export const AcademicStructurePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'departments' | 'courses' | 'classes' | 'semesters' | 'subjects' | 'assignments'
  >('departments');

  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Data collections
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Modal states
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({});
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchAllAcademicData = async () => {
    try {
      setLoading(true);
      const [deptRes, courseRes, classRes, semRes, subjRes, assignRes, teachRes]: any = await Promise.all([
        api.get('/departments'),
        api.get('/courses'),
        api.get('/classes'),
        api.get('/semesters'),
        api.get('/subjects'),
        api.get('/teacher-assignments'),
        api.get('/teachers'),
      ]);

      setDepartments(deptRes.data || []);
      setCourses(courseRes.data || []);
      setClasses(classRes.data || []);
      setSemesters(semRes.data || []);
      setSubjects(subjRes.data || []);
      setAssignments(assignRes.data || []);
      setTeachers(teachRes.data || []);
    } catch (err) {
      console.error('Failed to load academic hierarchy', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAcademicData();
  }, []);

  const openCreateModal = () => {
    setModalError(null);
    if (activeTab === 'departments') {
      setFormData({ name: '', code: '', description: '', status: 'ACTIVE' });
    } else if (activeTab === 'courses') {
      setFormData({
        name: '',
        code: '',
        department: departments[0]?._id || '',
        durationYears: 3,
        totalSemesters: 6,
        status: 'ACTIVE',
      });
    } else if (activeTab === 'classes') {
      setFormData({
        name: 'SY',
        division: 'A',
        department: departments[0]?._id || '',
        course: courses[0]?._id || '',
        academicYear: '2025-2026',
        status: 'ACTIVE',
      });
    } else if (activeTab === 'semesters') {
      setFormData({
        name: 'Semester III',
        semesterNumber: 3,
        department: departments[0]?._id || '',
        course: courses[0]?._id || '',
        academicClass: classes[0]?._id || '',
        academicYear: '2025-2026',
        status: 'ACTIVE',
      });
    } else if (activeTab === 'subjects') {
      setFormData({
        name: '',
        code: '',
        department: departments[0]?._id || '',
        course: courses[0]?._id || '',
        academicClass: classes[0]?._id || '',
        semester: semesters[0]?._id || '',
        credits: 4,
        status: 'ACTIVE',
      });
    } else if (activeTab === 'assignments') {
      setFormData({
        teacher: teachers[0]?._id || '',
        department: departments[0]?._id || '',
        course: courses[0]?._id || '',
        academicClass: classes[0]?._id || '',
        semester: semesters[0]?._id || '',
        subject: subjects[0]?._id || '',
        academicYear: '2025-2026',
        status: 'ACTIVE',
      });
    }
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      let endpoint = '/departments';
      if (activeTab === 'courses') endpoint = '/courses';
      else if (activeTab === 'classes') endpoint = '/classes';
      else if (activeTab === 'semesters') endpoint = '/semesters';
      else if (activeTab === 'subjects') endpoint = '/subjects';
      else if (activeTab === 'assignments') endpoint = '/teacher-assignments';

      await api.post(endpoint, formData);
      setModalOpen(false);
      await fetchAllAcademicData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save entity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (confirm('Are you sure you want to remove this teacher assignment?')) {
      await api.delete(`/teacher-assignments/${id}`);
      fetchAllAcademicData();
    }
  };

  if (loading) return <LoadingSpinner message="Loading academic hierarchy..." />;

  const tabs = [
    { key: 'departments', label: 'Departments', count: departments.length, icon: Building2 },
    { key: 'courses', label: 'Courses & Programs', count: courses.length, icon: BookOpen },
    { key: 'classes', label: 'Classes / Years', count: classes.length, icon: Layers },
    { key: 'semesters', label: 'Semesters', count: semesters.length, icon: Calendar },
    { key: 'subjects', label: 'Subjects', count: subjects.length, icon: BookMarked },
    { key: 'assignments', label: 'Teacher Assignments', count: assignments.length, icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Academic Hierarchy & Structure</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            Configure institutional departments, courses, semesters, subjects, and faculty teaching assignments
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add {activeTab.slice(0, -1).toUpperCase()}</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-neutral-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-[#1DCED8] text-[#17B2BA] bg-white shadow-subtle'
                : 'border-transparent text-neutral-secondary hover:text-[#1F2937] hover:bg-white/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-neutral-light text-[10px] text-neutral-secondary font-bold">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="card-container overflow-hidden p-0">
        {/* TAB 1: DEPARTMENTS */}
        {activeTab === 'departments' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-border">
              <thead>
                <tr>
                  <th className="table-header">Department Name</th>
                  <th className="table-header">Code</th>
                  <th className="table-header">Description</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/50 bg-white">
                {departments.map((d) => (
                  <tr key={d._id} className="hover:bg-[#FFF9D8]/20">
                    <td className="table-cell font-semibold text-[#1F2937]">{d.name}</td>
                    <td className="table-cell font-mono text-xs font-bold text-[#17B2BA]">{d.code}</td>
                    <td className="table-cell text-neutral-secondary max-w-xs truncate">{d.description || '—'}</td>
                    <td className="table-cell">
                      <Badge variant={d.status === 'ACTIVE' ? 'green' : 'gray'}>{d.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: COURSES */}
        {activeTab === 'courses' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-border">
              <thead>
                <tr>
                  <th className="table-header">Course / Program</th>
                  <th className="table-header">Code</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Duration</th>
                  <th className="table-header">Total Semesters</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/50 bg-white">
                {courses.map((c) => (
                  <tr key={c._id} className="hover:bg-[#FFF9D8]/20">
                    <td className="table-cell font-semibold text-[#1F2937]">{c.name}</td>
                    <td className="table-cell font-mono text-xs font-bold text-[#E6853A]">{c.code}</td>
                    <td className="table-cell text-neutral-secondary">{c.department?.name || '—'}</td>
                    <td className="table-cell text-neutral-secondary">{c.durationYears} Years</td>
                    <td className="table-cell text-neutral-secondary">{c.totalSemesters} Semesters</td>
                    <td className="table-cell">
                      <Badge variant={c.status === 'ACTIVE' ? 'green' : 'gray'}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: CLASSES */}
        {activeTab === 'classes' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-border">
              <thead>
                <tr>
                  <th className="table-header">Class / Year</th>
                  <th className="table-header">Division</th>
                  <th className="table-header">Course</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Academic Year</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/50 bg-white">
                {classes.map((cl) => (
                  <tr key={cl._id} className="hover:bg-[#FFF9D8]/20">
                    <td className="table-cell font-bold text-[#1F2937]">{cl.name}</td>
                    <td className="table-cell text-neutral-secondary">Div {cl.division || 'A'}</td>
                    <td className="table-cell font-semibold text-neutral-secondary">{cl.course?.name || '—'}</td>
                    <td className="table-cell text-neutral-secondary">{cl.department?.name || '—'}</td>
                    <td className="table-cell text-neutral-secondary">{cl.academicYear}</td>
                    <td className="table-cell">
                      <Badge variant={cl.status === 'ACTIVE' ? 'green' : 'gray'}>{cl.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: SEMESTERS */}
        {activeTab === 'semesters' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-border">
              <thead>
                <tr>
                  <th className="table-header">Semester</th>
                  <th className="table-header">Term Number</th>
                  <th className="table-header">Course & Class</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/50 bg-white">
                {semesters.map((s) => (
                  <tr key={s._id} className="hover:bg-[#FFF9D8]/20">
                    <td className="table-cell font-bold text-[#1F2937]">{s.name}</td>
                    <td className="table-cell text-neutral-secondary font-mono">Sem {s.semesterNumber}</td>
                    <td className="table-cell text-neutral-secondary">{s.course?.name} ({s.academicClass?.name})</td>
                    <td className="table-cell text-neutral-secondary">{s.department?.name}</td>
                    <td className="table-cell">
                      <Badge variant={s.status === 'ACTIVE' ? 'green' : 'gray'}>{s.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: SUBJECTS */}
        {activeTab === 'subjects' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-border">
              <thead>
                <tr>
                  <th className="table-header">Subject Name</th>
                  <th className="table-header">Code</th>
                  <th className="table-header">Credits</th>
                  <th className="table-header">Semester</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/50 bg-white">
                {subjects.map((sub) => (
                  <tr key={sub._id} className="hover:bg-[#FFF9D8]/20">
                    <td className="table-cell font-bold text-[#1F2937]">{sub.name}</td>
                    <td className="table-cell font-mono text-xs font-bold text-[#17B2BA]">{sub.code}</td>
                    <td className="table-cell text-neutral-secondary">{sub.credits} Credits</td>
                    <td className="table-cell text-neutral-secondary">{sub.semester?.name || '—'}</td>
                    <td className="table-cell text-neutral-secondary">{sub.department?.name || '—'}</td>
                    <td className="table-cell">
                      <Badge variant={sub.status === 'ACTIVE' ? 'green' : 'gray'}>{sub.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 6: TEACHER ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-border">
              <thead>
                <tr>
                  <th className="table-header">Assigned Faculty</th>
                  <th className="table-header">Subject Assigned</th>
                  <th className="table-header">Course & Class</th>
                  <th className="table-header">Semester</th>
                  <th className="table-header">Department</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/50 bg-white">
                {assignments.map((a) => (
                  <tr key={a._id} className="hover:bg-[#FFF9D8]/20">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1DCED8]/20 text-[#17B2BA] font-bold text-xs flex items-center justify-center">
                          {a.teacher?.name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <p className="font-bold text-[#1F2937] text-xs">{a.teacher?.name}</p>
                          <p className="text-[10px] text-neutral-secondary">{a.teacher?.employeeId || a.teacher?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-semibold text-[#1F2937]">{a.subject?.name}</td>
                    <td className="table-cell text-neutral-secondary">{a.course?.name} ({a.academicClass?.name})</td>
                    <td className="table-cell text-neutral-secondary">{a.semester?.name}</td>
                    <td className="table-cell text-neutral-secondary">{a.department?.name}</td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => handleDeleteAssignment(a._id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-btn transition-colors"
                        title="Remove Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Create New ${activeTab.slice(0, -1).toUpperCase()}`}>
        {modalError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-btn flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Department Fields */}
          {activeTab === 'departments' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Department of Computer Applications"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MCA_DEPT"
                  className="input-field uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Academic objectives and focus areas..."
                  className="input-field"
                  rows={2}
                />
              </div>
            </>
          )}

          {/* Course Fields */}
          {activeTab === 'courses' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Department</label>
                <select
                  required
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="input-field"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Master of Computer Applications (MCA)"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MCA"
                  className="input-field uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={formData.durationYears || 3}
                    onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Total Semesters</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formData.totalSemesters || 6}
                    onChange={(e) => setFormData({ ...formData, totalSemesters: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>
            </>
          )}

          {/* Teacher Assignment Fields */}
          {activeTab === 'assignments' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Select Faculty Member</label>
                <select
                  required
                  value={formData.teacher || ''}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="input-field"
                >
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.employeeId || t.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Department</label>
                <select
                  required
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="input-field"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Course</label>
                  <select
                    required
                    value={formData.course || ''}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="input-field"
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Class / Year</label>
                  <select
                    required
                    value={formData.academicClass || ''}
                    onChange={(e) => setFormData({ ...formData, academicClass: e.target.value })}
                    className="input-field"
                  >
                    {classes.map((cl) => (
                      <option key={cl._id} value={cl._id}>{cl.name} (Div {cl.division})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Semester</label>
                  <select
                    required
                    value={formData.semester || ''}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="input-field"
                  >
                    {semesters.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Subject</label>
                  <select
                    required
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-field"
                  >
                    {subjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Fallback general name/code for classes, semesters, subjects */}
          {(activeTab === 'classes' || activeTab === 'semesters' || activeTab === 'subjects') && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Department</label>
                <select
                  required
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="input-field"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Course</label>
                <select
                  required
                  value={formData.course || ''}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="input-field"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Title / Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Advanced Java Programming"
                  className="input-field"
                />
              </div>
              {activeTab === 'subjects' && (
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. MCA301"
                    className="input-field uppercase"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline text-xs">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">
              {submitting ? 'Saving...' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
