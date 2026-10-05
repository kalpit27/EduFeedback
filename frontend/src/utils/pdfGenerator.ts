import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  formTitle: string;
  department: string;
  course: string;
  academicClass: string;
  semester: string;
  subject: string;
  teacher: string;
  totalEligible: number;
  submittedCount: number;
  pendingCount: number;
  participationRate: number;
  overallAverage: number;
  categoryBreakdown: { category: string; average: number; count: number }[];
  questionAnalytics: {
    text: string;
    category: string;
    type: string;
    averageScore: number | null;
    responseCount: number;
    qualitativeRemarks?: string[];
  }[];
}

export const generateInstitutionalPDFReport = (data: ReportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryCyan: [number, number, number] = [29, 206, 216]; // #1DCED8
  const darkText: [number, number, number] = [31, 41, 55]; // #1F2937
  const accentOrange: [number, number, number] = [255, 157, 80]; // #FF9D50
  const successGreen: [number, number, number] = [85, 224, 126]; // #55E07E

  // Header Banner
  doc.setFillColor(29, 206, 216);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('APEX INSTITUTE OF HIGHER LEARNING', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL ACADEMIC FEEDBACK & PEDAGOGICAL EVALUATION REPORT', 14, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 145, 18);

  // Document Title & Scope Box
  doc.setFillColor(255, 249, 216); // cream #FFF9D8
  doc.roundedRect(14, 30, 182, 38, 3, 3, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(14, 30, 182, 38, 3, 3, 'S');

  doc.setTextColor(...darkText);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(data.formTitle, 18, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Department: ${data.department}`, 18, 46);
  doc.text(`Course & Class: ${data.course} - ${data.academicClass} (${data.semester})`, 18, 52);
  doc.text(`Subject: ${data.subject}`, 18, 58);

  doc.text(`Instructor: ${data.teacher}`, 115, 46);
  doc.text(`Evaluation Period: Academic Year 2025-2026`, 115, 52);
  doc.text(`Confidentiality Protocol: Standard ISO/IEC 27001`, 115, 58);

  // KPI Summary Cards
  const cardY = 74;
  const cardWidth = 43;
  const cardHeight = 22;

  // Card 1: Total Enrolled
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.text('ELIGIBLE STUDENTS', 18, cardY + 7);
  doc.setFontSize(14);
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.text(String(data.totalEligible), 18, cardY + 16);

  // Card 2: Submissions
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(60, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL SUBMISSIONS', 64, cardY + 7);
  doc.setFontSize(14);
  doc.setTextColor(...primaryCyan);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.submittedCount} (${data.participationRate}%)`, 64, cardY + 16);

  // Card 3: Pending
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(106, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text('PENDING RESPONSES', 110, cardY + 7);
  doc.setFontSize(14);
  doc.setTextColor(...accentOrange);
  doc.setFont('helvetica', 'bold');
  doc.text(String(data.pendingCount), 110, cardY + 16);

  // Card 4: Overall Rating
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(152, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text('OVERALL SCORE', 156, cardY + 7);
  doc.setFontSize(14);
  doc.setTextColor(46, 156, 79);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.overallAverage.toFixed(2)} / 5.0`, 156, cardY + 16);

  // Category Breakdown Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.text('1. Category-Wise Performance Summary', 14, 106);

  const categoryRows = data.categoryBreakdown.map((c) => [
    c.category,
    `${c.average.toFixed(2)} / 5.00`,
    c.count > 0 ? (c.average >= 4.5 ? 'Outstanding' : c.average >= 4.0 ? 'Exceeds Expectations' : 'Meets Expectations') : 'N/A',
  ]);

  autoTable(doc, {
    startY: 110,
    head: [['Evaluation Domain / Category', 'Domain Average Score', 'Benchmark Rating']],
    body: categoryRows,
    theme: 'grid',
    headStyles: { fillColor: [29, 206, 216], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
  });

  // Question-by-Question Analysis Table
  const nextY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Itemized Question Responses & Evaluation', 14, nextY);

  const questionRows = data.questionAnalytics.map((q, idx) => [
    `Q${idx + 1}`,
    q.text,
    q.category,
    q.averageScore !== null ? `${q.averageScore.toFixed(2)} / 5.0` : 'Qualitative / MCQ',
    `${q.responseCount} answers`,
  ]);

  autoTable(doc, {
    startY: nextY + 4,
    head: [['#', 'Question Item', 'Category', 'Avg Score', 'Responses']],
    body: questionRows,
    theme: 'striped',
    headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 90 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 22 },
    },
  });

  // Footer & Institutional Verification
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(229, 231, 235);
  doc.line(14, pageHeight - 20, 196, pageHeight - 20);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Apex Institute Internal Academic Quality Assurance Cell (IQAC)', 14, pageHeight - 13);
  doc.text('Document digitally generated and certified by Institute Feedback SaaS Platform.', 14, pageHeight - 9);

  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Academic Dean Signature: ___________________', 120, pageHeight - 11);

  // Save / Trigger Download
  const filename = `Institute_Feedback_Report_${data.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
