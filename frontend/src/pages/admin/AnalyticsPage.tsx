import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Filter,
  TrendingUp,
  Award,
  BookOpen,
  Users,
  CheckCircle,
  FileDown,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { api } from '../../services/api.js';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const url = selectedDept ? `/analytics/overview?department=${selectedDept}` : '/analytics/overview';
        const [analyticsRes, deptRes]: any = await Promise.all([
          api.get(url),
          departments.length === 0 ? api.get('/departments') : Promise.resolve({ data: departments }),
        ]);

        if (analyticsRes.success) setData(analyticsRes.data);
        if (deptRes?.data && departments.length === 0) setDepartments(deptRes.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedDept]);

  if (loading && !data) return <LoadingSpinner message="Aggregating multi-dimensional analytics from MongoDB..." />;

  const deptComparisons = data?.departmentComparisons || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const ratingDistribution = data?.ratingDistribution || [];

  const pieColors = ['#55E07E', '#1DCED8', '#FF9D50', '#FBBF24', '#F87171'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Institutional Quality & Feedback Analytics</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            Cross-departmental performance metrics, pedagogical satisfaction indexes, and longitudinal trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-secondary" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs py-1.5 px-3 border border-neutral-border rounded-btn bg-white font-medium"
            >
              <option value="">All Departments (Institute-wide)</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <NavLink to="/admin/reports" className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF Report</span>
          </NavLink>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Ratings Bar Chart */}
        <div className="card-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1F2937]">Pedagogical Domain Benchmark</h3>
              <p className="text-xs text-neutral-secondary">Average ratings (1.0 to 5.0) per evaluation category</p>
            </div>
            <Award className="w-4 h-4 text-[#17B2BA]" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categoryBreakdown}
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: '#1F2937' }} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} / 5.0`, 'Category Average']}
                />
                <Bar dataKey="average" fill="#1DCED8" radius={[0, 4, 4, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Score Distribution Donut */}
        <div className="card-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1F2937]">Feedback Score Distribution</h3>
              <p className="text-xs text-neutral-secondary">Proportion of student rating stars across all active forms</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#E6853A]" />
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratingDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="stars"
                >
                  {ratingDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any) => [`${val} ratings`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Comparison Table */}
      <div className="card-container overflow-hidden p-0">
        <div className="p-4 border-b border-neutral-border bg-neutral-light/50">
          <h3 className="text-sm font-bold text-[#1F2937]">Institutional Department Matrix</h3>
          <p className="text-xs text-neutral-secondary">Direct comparison of response participation and pedagogical score averages</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-border">
            <thead>
              <tr>
                <th className="table-header">Department</th>
                <th className="table-header">Code</th>
                <th className="table-header">Enrolled Students</th>
                <th className="table-header">Submissions</th>
                <th className="table-header">Participation Rate</th>
                <th className="table-header">Average Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/50 bg-white">
              {deptComparisons.map((dept: any) => (
                <tr key={dept.departmentId} className="hover:bg-[#FFF9D8]/20">
                  <td className="table-cell font-bold text-[#1F2937]">{dept.name}</td>
                  <td className="table-cell font-mono text-xs font-bold text-[#17B2BA]">{dept.code}</td>
                  <td className="table-cell text-neutral-secondary">{dept.totalStudents}</td>
                  <td className="table-cell font-semibold text-[#1F2937]">{dept.totalResponses}</td>
                  <td className="table-cell">
                    <span className="font-bold text-[#2E9C4F] bg-[#55E07E]/15 px-2 py-0.5 rounded-full text-xs">
                      {dept.participation}%
                    </span>
                  </td>
                  <td className="table-cell font-bold text-[#17B2BA]">
                    {dept.averageRating.toFixed(2)} / 5.0
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
