import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  HeartHandshake,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Badge } from '../../components/common/Badge.js';
import { UserAvatar } from '../../components/common/UserAvatar.js';
import { api } from '../../services/api.js';

export const PeopleManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'parents'>('students');
  const [loading, setLoading] = useState(true);
  const [search, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Collections
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const [studRes, teachRes, parentRes, deptRes, courseRes, classRes, semRes]: any = await Promise.all([
        api.get(`/students${selectedDept ? `?department=${selectedDept}` : ''}`),
        api.get(`/teachers${selectedDept ? `?department=${selectedDept}` : ''}`),
        api.get('/parents'),
        departments.length === 0 ? api.get('/departments') : Promise.resolve({ data: departments }),
        courses.length === 0 ? api.get('/courses') : Promise.resolve({ data: courses }),
        classes.length === 0 ? api.get('/classes') : Promise.resolve({ data: classes }),
        semesters.length === 0 ? api.get('/semesters') : Promise.resolve({ data: semesters }),
      ]);

      setStudents(studRes.data || []);
      setTeachers(teachRes.data || []);
      setParents(parentRes.data || []);
      if (departments.length === 0) setDepartments(deptRes.data || []);
      if (courses.length === 0) setCourses(courseRes.data || []);
      if (classes.length === 0) setClasses(classRes.data || []);
      if (semesters.length === 0) setSemesters(semRes.data || []);
    } catch (err) {
      console.error('Failed to load people data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, [selectedDept]);

  const openModal = () => {
    setModalError(null);
    if (activeTab === 'students') {
      setFormData({
        name: '',
        email: '',
        studentId: '',
        rollNumber: '',
        department: departments[0]?._id || '',
        course: courses[0]?._id || '',
        academicClass: classes[0]?._id || '',
        semester: semesters[0]?._id || '',
        academicYear: '2025-2026',
        phone: '',
      });
    } else if (activeTab === 'teachers') {
      setFormData({
        name: '',
        email: '',
        employeeId: '',
        department: departments[0]?._id || '',
        phone: '',
      });
    } else if (activeTab === 'parents') {
      setFormData({
        name: '',
        email: '',
        phone: '',
        linkedStudents: [],
      });
    }
    setModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      if (activeTab === 'students') {
        await api.post('/students', formData);
      } else if (activeTab === 'teachers') {
        await api.post('/teachers', formData);
      } else if (activeTab === 'parents') {
        await api.post('/parents', formData);
      }
      setModalOpen(false);
      await fetchPeople();
    } catch (err: any) {
      setModalError(err.message || 'Failed to add user');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    const u = s.user || {};
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q)
    );
  });

  const filteredTeachers = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.employeeId?.toLowerCase().includes(q)
    );
  });

  const filteredParents = parents.filter((p) => {
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.phone?.includes(q);
  });

  if (loading && students.length === 0) return <LoadingSpinner message="Loading user directory..." />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Students, Faculty & Parent Directory</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            Manage institutional user accounts, student academic enrollment, and parent associations
          </p>
        </div>

        <button onClick={openModal} className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add {activeTab.slice(0, -1).toUpperCase()}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-card border border-neutral-border">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-neutral-light p-1 rounded-btn">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold transition-all ${
              activeTab === 'students' ? 'bg-white text-[#17B2BA] shadow-subtle' : 'text-neutral-secondary hover:text-[#1F2937]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold transition-all ${
              activeTab === 'teachers' ? 'bg-white text-[#17B2BA] shadow-subtle' : 'text-neutral-secondary hover:text-[#1F2937]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Teachers ({teachers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('parents')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold transition-all ${
              activeTab === 'parents' ? 'bg-white text-[#17B2BA] shadow-subtle' : 'text-neutral-secondary hover:text-[#1F2937]'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Parents ({parents.length})</span>
          </button>
        </div>

        {/* Search & Department Selector */}
        <div className="flex items-center gap-2">
          {activeTab !== 'parents' && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs py-1.5 px-2.5 border border-neutral-border rounded-btn bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-secondary" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 border border-neutral-border rounded-btn bg-white w-48 sm:w-60 focus:ring-2 focus:ring-[#1DCED8]/40"
            />
          </div>
        </div>
      </div>

      {/* Directory Tables */}
      <div className="card-container overflow-hidden p-0">
        {/* STUDENTS TABLE */}
        {activeTab === 'students' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-border">
              <thead>
                <tr>
                  <th className="table-header">Student Name</th>
                  <th className="table-header">Student ID</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Course & Class</th>
                  <th className="table-header">Semester</th>
                  <th className="table-header">Linked Parents</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/50 bg-white">
                {filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-[#FFF9D8]/20">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <UserAvatar src={s.user?.avatar} name={s.user?.name} size="sm" />
                        <div>
                          <p className="font-bold text-[#1F2937] text-xs">{s.user?.name}</p>
                          <p className="text-[10px] text-neutral-secondary">{s.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs font-bold text-[#17B2BA]">{s.studentId}</td>
                    <td className="table-cell text-neutral-secondary">{s.department?.name}</td>
                    <td className="table-cell font-medium text-[#1F2937]">{s.course?.name} ({s.academicClass?.name})</td>
                    <td className="table-cell text-neutral-secondary">{s.semester?.name}</td>
                    <td className="table-cell text-xs text-neutral-secondary">
                      {s.parents?.length > 0 ? (
                        s.parents.map((p: any) => p.name).join(', ')
                      ) : (
                        <span className="text-gray-400 italic">No parent linked</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <Badge variant={s.status === 'ACTIVE' ? 'green' : 'gray'}>{s.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TEACHERS TABLE */}
        {activeTab === 'teachers' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-border">
              <thead>
                <tr>
                  <th className="table-header">Instructor</th>
                  <th className="table-header">Employee ID</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Email & Phone</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/50 bg-white">
                {filteredTeachers.map((t) => (
                  <tr key={t._id} className="hover:bg-[#FFF9D8]/20">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <UserAvatar src={t.avatar} name={t.name} size="sm" />
                        <span className="font-bold text-[#1F2937] text-xs">{t.name}</span>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs font-bold text-[#E6853A]">{t.employeeId || '—'}</td>
                    <td className="table-cell text-neutral-secondary">{t.department?.name || 'All Institutes'}</td>
                    <td className="table-cell text-xs text-neutral-secondary">
                      <div>{t.email}</div>
                      {t.phone && <div className="text-[10px] text-gray-400">{t.phone}</div>}
                    </td>
                    <td className="table-cell">
                      <Badge variant={t.status === 'ACTIVE' ? 'green' : 'gray'}>{t.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PARENTS TABLE */}
        {activeTab === 'parents' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-border">
              <thead>
                <tr>
                  <th className="table-header">Parent / Guardian</th>
                  <th className="table-header">Contact Email</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Linked Student(s)</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/50 bg-white">
                {filteredParents.map((p) => (
                  <tr key={p._id} className="hover:bg-[#FFF9D8]/20">
                    <td className="table-cell font-bold text-[#1F2937] text-xs">{p.name}</td>
                    <td className="table-cell text-neutral-secondary text-xs">{p.email}</td>
                    <td className="table-cell text-neutral-secondary text-xs font-mono">{p.phone || '—'}</td>
                    <td className="table-cell text-xs">
                      {p.linkedStudents?.length > 0 ? (
                        p.linkedStudents.map((st: any) => (
                          <span key={st._id} className="inline-block mr-1 px-2 py-0.5 bg-[#1DCED8]/10 text-[#17B2BA] rounded text-[11px] font-medium">
                            {st.name} ({st.studentId})
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <Badge variant={p.status === 'ACTIVE' ? 'green' : 'gray'}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Add New ${activeTab.slice(0, -1).toUpperCase()}`}>
        {modalError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-btn flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@apexinstitute.edu"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="input-field"
              />
            </div>
          </div>

          {activeTab === 'teachers' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId || ''}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                    placeholder="EMP-MCA-01"
                    className="input-field uppercase"
                  />
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
              </div>
            </>
          )}

          {activeTab === 'students' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] uppercase mb-1">Student ID / Roll No</label>
                  <input
                    type="text"
                    required
                    value={formData.studentId || ''}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                    placeholder="MCA202501"
                    className="input-field uppercase"
                  />
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
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                      <option key={cl._id} value={cl._id}>{cl.name}</option>
                    ))}
                  </select>
                </div>
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
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline text-xs">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs">
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
