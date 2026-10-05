import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar.js';
import { TopNavbar } from '../components/common/TopNavbar.js';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageMeta = (pathname: string) => {
    if (pathname.startsWith('/admin/academics')) return { title: 'Academic Structure', breadcrumbs: ['Academics'] };
    if (pathname.startsWith('/admin/people')) return { title: 'Students, Faculty & Parents', breadcrumbs: ['People'] };
    if (pathname.startsWith('/admin/forms/new')) return { title: 'Dynamic Form Builder', breadcrumbs: ['Forms', 'Builder'] };
    if (pathname.startsWith('/admin/forms')) return { title: 'Feedback Forms & Responses', breadcrumbs: ['Forms'] };
    if (pathname.startsWith('/admin/analytics')) return { title: 'Institute Analytics & Intelligence', breadcrumbs: ['Analytics'] };
    if (pathname.startsWith('/admin/reports')) return { title: 'Institutional PDF Reports', breadcrumbs: ['Reports'] };
    if (pathname.startsWith('/admin/attendance')) return { title: 'Institutional Attendance', breadcrumbs: ['Attendance'] };
    if (pathname.startsWith('/admin/complaints') || pathname.endsWith('/complaints')) return { title: 'Complaints & Concerns', breadcrumbs: ['Helpdesk'] };
    if (pathname.startsWith('/admin/settings')) return { title: 'System & Institute Settings', breadcrumbs: ['Settings'] };

    if (pathname.startsWith('/teacher/feedback')) return { title: 'Confidential Participation Tracker', breadcrumbs: ['Feedback'] };
    if (pathname.startsWith('/teacher/attendance')) return { title: 'Subject Attendance Manager', breadcrumbs: ['Attendance'] };
    if (pathname.startsWith('/teacher/evaluations')) return { title: 'Student Progress Evaluations', breadcrumbs: ['Remarks'] };

    if (pathname.startsWith('/student/forms')) return { title: 'Academic Feedback Forms', breadcrumbs: ['Feedback'] };
    if (pathname.startsWith('/student/attendance')) return { title: 'My Attendance Records', breadcrumbs: ['Attendance'] };
    if (pathname.startsWith('/student/remarks')) return { title: 'Faculty Evaluations & Remarks', breadcrumbs: ['Remarks'] };

    if (pathname.startsWith('/parent/attendance')) return { title: 'Child Attendance Record', breadcrumbs: ['Attendance'] };
    if (pathname.startsWith('/parent/feedback')) return { title: 'Teacher Evaluation Reports', breadcrumbs: ['Faculty Remarks'] };
    if (pathname.startsWith('/parent/survey')) return { title: 'Parent Institutional Survey', breadcrumbs: ['Survey'] };

    if (pathname.startsWith('/profile')) return { title: 'User Profile & Preferences', breadcrumbs: ['Account'] };

    return { title: 'Institutional Dashboard', breadcrumbs: ['Overview'] };
  };

  const { title, breadcrumbs } = getPageMeta(location.pathname);

  return (
    <div className="min-h-screen flex bg-[#FFF9D8]/15 text-[#1F2937]">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={title}
          breadcrumbs={breadcrumbs}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
