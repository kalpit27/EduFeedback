import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading platform data...',
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div className="relative">
        <Loader2 className="w-10 h-10 animate-spin text-[#1DCED8]" />
      </div>
      <p className="text-sm font-medium text-neutral-secondary">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9D8]/20">
        {content}
      </div>
    );
  }

  return content;
};
