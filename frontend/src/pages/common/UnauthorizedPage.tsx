import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFF9D8]/20">
      <div className="max-w-md w-full bg-white border border-neutral-border rounded-dialog p-8 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-[#1F2937]">403 - Forbidden Access</h1>
        <p className="text-xs text-neutral-secondary leading-relaxed">
          You do not have administrative permission to view this resource. Academic data isolation and confidentiality protocols prevent unauthorized role access.
        </p>
        <div className="pt-2">
          <NavLink to="/" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portal Dashboard</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
