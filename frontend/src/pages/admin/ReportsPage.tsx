import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Building2,
  Calendar,
  Award,
  CheckCircle2,
  Sparkles,
  Printer,
} from 'lucide-react';
import { FeedbackForm } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { generateInstitutionalPDFReport } from '../../utils/pdfGenerator.js';
import { api } from '../../services/api.js';

export const ReportsPage: React.FC = () => {
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [formAnalytics, setFormAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const res: any = await api.get('/forms');
        const list = res.data || [];
        setForms(list);
        if (list.length > 0) {
          setSelectedFormId(list[0]._id);
        }
      } catch (err) {
        console.error('Failed to load forms for reporting', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  useEffect(() => {
    const fetchDetailedFormAnalytics = async () => {
      if (!selectedFormId) return;
      try {
        setLoading(true);
        const res: any = await api.get(`/analytics/forms/${selectedFormId}`);
        if (res.success) {
          setFormAnalytics(res.data);
        }
      } catch (err) {
        console.error('Failed to load form detailed analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetailedFormAnalytics();
  }, [selectedFormId]);

  const handleDownloadPDF = () => {
    if (!formAnalytics) return;
    setGenerating(true);
    try {
      const f = formAnalytics.form || {};
      const m = formAnalytics.metrics || {};
      generateInstitutionalPDFReport({
        formTitle: f.title || 'Course Evaluation Report',
        department: f.department?.name || 'Academic Department',
        course: f.course?.name || 'Program',
        academicClass: f.academicClass?.name || 'FY/SY/TY',
        semester: f.semester?.name || 'Semester',
        subject: f.subject?.name || 'Academic Subject',
        teacher: f.teacher?.name || 'Faculty Member',
        totalEligible: m.totalEligible || 0,
        submittedCount: m.submittedCount || 0,
        pendingCount: m.pendingCount || 0,
        participationRate: m.participationRate || 0,
        overallAverage: m.overallAverage || 4.2,
        categoryBreakdown: formAnalytics.categoryBreakdown || [],
        questionAnalytics: formAnalytics.questionAnalytics || [],
      });
    } catch (err) {
      console.error('PDF Generation Error', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading && !formAnalytics) return <LoadingSpinner message="Preparing institutional report engine..." />;

  const form = formAnalytics?.form;
  const metrics = formAnalytics?.metrics;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-neutral-border shadow-subtle">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Official Institutional PDF Reporting</h1>
          <p className="text-xs text-neutral-secondary mt-0.5">
            Generate certified academic evaluation documents for accreditation (NAAC/ABET/IQAC) and internal review
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="text-xs py-2 px-3 border border-neutral-border rounded-btn bg-white font-medium max-w-xs focus:ring-2 focus:ring-[#1DCED8]/40"
          >
            {forms.map((f: any) => (
              <option key={f._id} value={f._id}>
                {f.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadPDF}
            disabled={generating || !formAnalytics}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-hover"
          >
            <Download className="w-4 h-4" />
            <span>{generating ? 'Generating Document...' : 'Download Official PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Report Preview Document Card */}
      {formAnalytics && (
        <div className="bg-white border border-neutral-border rounded-card p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-6">
          {/* Institutional Letterhead Banner */}
          <div className="border-b-2 border-[#1DCED8] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E6853A]">
                Official Academic Quality Assurance Cell (IQAC)
              </span>
              <h2 className="text-xl font-extrabold text-[#1F2937] tracking-tight mt-0.5">
                APEX INSTITUTE OF HIGHER LEARNING
              </h2>
              <p className="text-xs text-neutral-secondary">
                Confidential Pedagogical Evaluation & Faculty Feedback Assessment
              </p>
            </div>

            <div className="text-right sm:self-center">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Certified Document
              </span>
              <p className="text-[10px] text-neutral-secondary mt-1">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Scope Header Box */}
          <div className="bg-[#FFF9D8]/30 border border-[#FF9D50]/30 rounded-card p-4 space-y-2">
            <h3 className="text-sm font-bold text-[#1F2937]">{form?.title}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-neutral-secondary pt-1">
              <div>
                <span className="font-semibold text-[#1F2937]">Department:</span> {form?.department?.name}
              </div>
              <div>
                <span className="font-semibold text-[#1F2937]">Course & Term:</span> {form?.course?.name} ({form?.semester?.name})
              </div>
              <div>
                <span className="font-semibold text-[#1F2937]">Subject:</span> {form?.subject?.name}
              </div>
              <div>
                <span className="font-semibold text-[#1F2937]">Assigned Faculty:</span>{' '}
                <span className="text-[#17B2BA] font-bold">{form?.teacher?.name}</span>
              </div>
              <div>
                <span className="font-semibold text-[#1F2937]">Academic Year:</span> 2025-2026
              </div>
              <div>
                <span className="font-semibold text-[#1F2937]">Status:</span> {form?.status}
              </div>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-neutral-light rounded-btn border border-neutral-border text-center">
              <p className="text-[10px] uppercase font-bold text-neutral-secondary">Eligible Students</p>
              <p className="text-xl font-extrabold text-[#1F2937] mt-1">{metrics?.totalEligible}</p>
            </div>
            <div className="p-3.5 bg-neutral-light rounded-btn border border-neutral-border text-center">
              <p className="text-[10px] uppercase font-bold text-neutral-secondary">Submissions</p>
              <p className="text-xl font-extrabold text-[#17B2BA] mt-1">
                {metrics?.submittedCount} ({metrics?.participationRate}%)
              </p>
            </div>
            <div className="p-3.5 bg-neutral-light rounded-btn border border-neutral-border text-center">
              <p className="text-[10px] uppercase font-bold text-neutral-secondary">Pending</p>
              <p className="text-xl font-extrabold text-[#E6853A] mt-1">{metrics?.pendingCount}</p>
            </div>
            <div className="p-3.5 bg-neutral-light rounded-btn border border-neutral-border text-center">
              <p className="text-[10px] uppercase font-bold text-neutral-secondary">Overall Score</p>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">
                {metrics?.overallAverage?.toFixed(2)} / 5.0
              </p>
            </div>
          </div>

          {/* Domain Breakdown Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
              1. Pedagogical Domain Score Averages
            </h4>
            <div className="border border-neutral-border rounded-btn overflow-hidden">
              <table className="min-w-full divide-y divide-neutral-border text-xs">
                <thead className="bg-[#1DCED8]/10 text-[#17B2BA]">
                  <tr>
                    <th className="px-4 py-2 text-left font-bold">Domain / Category</th>
                    <th className="px-4 py-2 text-left font-bold">Score Average</th>
                    <th className="px-4 py-2 text-left font-bold">Qualitative Benchmark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border/60 bg-white">
                  {formAnalytics.categoryBreakdown?.map((cat: any) => (
                    <tr key={cat.category}>
                      <td className="px-4 py-2 font-medium text-[#1F2937]">{cat.category}</td>
                      <td className="px-4 py-2 font-bold text-[#17B2BA]">{cat.average.toFixed(2)} / 5.00</td>
                      <td className="px-4 py-2 text-neutral-secondary">
                        {cat.average >= 4.5 ? 'Outstanding (Tier 1)' : cat.average >= 4.0 ? 'Exceeds Expectations' : 'Meets Expectations'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Question Breakdown Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
              2. Detailed Item Responses
            </h4>
            <div className="border border-neutral-border rounded-btn overflow-hidden">
              <table className="min-w-full divide-y divide-neutral-border text-xs">
                <thead className="bg-neutral-light text-[#1F2937]">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold w-10">#</th>
                    <th className="px-3 py-2 text-left font-bold">Question Description</th>
                    <th className="px-3 py-2 text-left font-bold">Domain</th>
                    <th className="px-3 py-2 text-left font-bold">Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border/60 bg-white">
                  {formAnalytics.questionAnalytics?.map((q: any, i: number) => (
                    <tr key={q.id}>
                      <td className="px-3 py-2 font-mono text-neutral-secondary">Q{i + 1}</td>
                      <td className="px-3 py-2 font-medium text-[#1F2937]">{q.text}</td>
                      <td className="px-3 py-2 text-neutral-secondary">{q.category}</td>
                      <td className="px-3 py-2 font-bold text-[#17B2BA]">
                        {q.averageScore !== null ? `${q.averageScore.toFixed(2)} / 5.0` : 'MCQ / Text'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Institutional Signature Footer */}
          <div className="pt-6 border-t border-neutral-border flex items-center justify-between text-xs text-neutral-secondary">
            <div>
              <p className="font-semibold text-[#1F2937]">Confidential Institutional Document</p>
              <p className="text-[11px]">Enforced under Academic Feedback Data Privacy Protocol</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-gray-400">_________________________________</p>
              <p className="text-[11px] font-bold text-[#1F2937] mt-1">Dean of Academic Affairs & IQAC</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
