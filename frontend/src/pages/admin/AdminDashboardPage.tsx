import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Building2,
  ClipboardCheck,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  HeartHandshake,
  Filter,
  PlusCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { NavLink } from 'react-router-dom';
import { StatCard } from '../../components/common/StatCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { api } from '../../services/api.js';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const url = selectedDept ? `/analytics/overview?department=${selectedDept}` : '/analytics/overview';
      const [analyticsRes, deptRes]: any = await Promise.all([
        api.get(url),
        departments.length === 0 ? api.get('/departments') : Promise.resolve({ data: departments }),
      ]);

      if (analyticsRes.success) {
        setData(analyticsRes.data);
      }
      if (deptRes?.data && departments.length === 0) {
        setDepartments(deptRes.data);
      }
    } catch (err) {
      console.error('Failed to load admin analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDept]);

  if (loading && !data) {
    return <LoadingSpinner message="Aggregating institutional data from MongoDB..." />;
  }

  const kpis = data?.kpis || {};
  const deptComparisons = data?.departmentComparisons || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const ratingDistribution = data?.ratingDistribution || [];
  const semesterTrends = data?.semesterTrends || [];
  const recentSubmissions = data?.recentSubmissions || [];

  return (
    <div className="space-y-6">
      {/* Header & Department Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-card border border-neutral-border shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">Institutional Overview</h1>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#1DCED8]/15 text-[#17B2BA] border border-[#1DCED8]/30">
              Live MongoDB Atlas
            </span>
          </div>
          <p className="text-xs text-neutral-secondary mt-1">
            Real-time multi-department feedback intelligence, faculty ratings, and participation analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-secondary" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs py-1.5 px-3 border border-neutral-border rounded-btn bg-white font-medium focus:ring-2 focus:ring-[#1DCED8]/40"
            >
              <option value="">All Departments (Institute-wide)</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <NavLink to="/admin/forms/new" className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Form</span>
          </NavLink>
        </div>
      </div>

      {/* Top 8 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={kpis.totalStudents ?? 0}
          subtitle="Enrolled learners"
          icon={Users}
          accentColor="cyan"
        />
        <StatCard
          title="Faculty Members"
          value={kpis.totalTeachers ?? 0}
          subtitle="Assigned instructors"
          icon={GraduationCap}
          accentColor="orange"
        />
        <StatCard
          title="Departments"
          value={kpis.totalDepartments ?? 0}
          subtitle="Academic schools"
          icon={Building2}
          accentColor="blue"
        />
        <StatCard
          title="Participation Rate"
          value={`${kpis.participationRate ?? 0}%`}
          subtitle="Average completion"
          icon={TrendingUp}
          accentColor="green"
        />
        <StatCard
          title="Active Forms"
          value={kpis.activeForms ?? 0}
          subtitle="Published evaluations"
          icon={ClipboardCheck}
          accentColor="cyan"
        />
        <StatCard
          title="Responses Received"
          value={kpis.totalResponses ?? 0}
          subtitle="Confidential entries"
          icon={CheckCircle2}
          accentColor="green"
        />
        <StatCard
          title="Registered Parents"
          value={kpis.totalParents ?? 0}
          subtitle="Linked stakeholders"
          icon={HeartHandshake}
          accentColor="orange"
        />
        <StatCard
          title="Open Complaints"
          value={kpis.openComplaints ?? 0}
          subtitle="Pending resolution"
          icon={AlertTriangle}
          accentColor="orange"
        />
      </div>

      {/* Charts Section: Department Performance & Semester Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Rating & Participation Comparison */}
        <div className="card-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1F2937]">Department Average Ratings</h3>
              <p className="text-xs text-neutral-secondary">Calculated from verified student feedback scores (out of 5.0)</p>
            </div>
            <span className="text-[11px] font-semibold text-[#17B2BA] bg-[#1DCED8]/10 px-2 py-0.5 rounded-full">
              Benchmark: 4.0+
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptComparisons} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(val: any) => [`${val} / 5.0`, 'Average Rating']}
                />
                <Bar dataKey="averageRating" fill="#1DCED8" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Participation & Satisfaction Trend */}
        <div className="card-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1F2937]">Semester Progression & Feedback Index</h3>
              <p className="text-xs text-neutral-secondary">Progression of student engagement and rating quality</p>
            </div>
            <span className="text-[11px] font-semibold text-[#E6853A] bg-[#FF9D50]/10 px-2 py-0.5 rounded-full">
              Term Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={semesterTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis domain={[3.0, 5.0]} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  name="Avg Rating"
                  stroke="#1DCED8"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#1DCED8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Domain Category Ratings & Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (2 Cols) */}
        <div className="lg:col-span-2 card-container">
          <h3 className="text-sm font-bold text-[#1F2937] mb-1">Key Pedagogical Domain Ratings</h3>
          <p className="text-xs text-neutral-secondary mb-4">Aggregated performance across standard institutional evaluation categories</p>

          <div className="space-y-3.5">
            {categoryBreakdown.map((cat: any) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1F2937]">{cat.category}</span>
                  <span className="font-bold text-[#17B2BA]">{cat.average.toFixed(2)} / 5.00</span>
                </div>
                <div className="w-full bg-neutral-light rounded-full h-2 overflow-hidden border border-neutral-border/50">
                  <div
                    className="bg-gradient-to-r from-[#1DCED8] to-[#55E07E] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(cat.average / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Score Distribution (1 Col) */}
        <div className="card-container">
          <h3 className="text-sm font-bold text-[#1F2937] mb-1">Rating Distribution</h3>
          <p className="text-xs text-neutral-secondary mb-4">Spread of star evaluation scores</p>

          <div className="space-y-3">
            {ratingDistribution.map((item: any) => (
              <div key={item.stars} className="flex items-center gap-2 text-xs">
                <span className="w-16 font-medium text-neutral-secondary">{item.stars}</span>
                <div className="flex-1 bg-neutral-light rounded-full h-2 overflow-hidden border border-neutral-border/50">
                  <div
                    className="bg-[#FF9D50] h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right font-bold text-[#1F2937]">{item.percentage}%</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-border text-center">
            <NavLink
              to="/admin/reports"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17B2BA] hover:underline"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Official Institutional PDF Report</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Recent Submissions & Quick Navigation */}
      <div className="card-container">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#1F2937]">Recent Submissions & Activity</h3>
            <p className="text-xs text-neutral-secondary">Latest confidential feedback submissions recorded by the system</p>
          </div>
          <NavLink to="/admin/forms" className="text-xs font-semibold text-[#17B2BA] hover:underline">
            View All Forms →
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-border">
            <thead>
              <tr>
                <th className="table-header">Department</th>
                <th className="table-header">Subject & Course</th>
                <th className="table-header">Faculty</th>
                <th className="table-header">Submission Time</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/50 bg-white">
              {recentSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-cell text-center text-neutral-secondary py-6">
                    No submissions recorded yet for the selected scope.
                  </td>
                </tr>
              ) : (
                recentSubmissions.map((sub: any) => (
                  <tr key={sub._id} className="hover:bg-[#FFF9D8]/30 transition-colors">
                    <td className="table-cell font-semibold text-[#1F2937]">{sub.department?.name || 'Department'}</td>
                    <td className="table-cell text-neutral-secondary">{sub.subject?.name || 'Subject'}</td>
                    <td className="table-cell font-medium text-[#1F2937]">{sub.teacher?.name || 'Faculty'}</td>
                    <td className="table-cell text-neutral-secondary">
                      {new Date(sub.submittedAt).toLocaleDateString()} at{' '}
                      {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#55E07E]/15 text-[#2E9C4F] border border-[#55E07E]/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Confidential Entry
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
