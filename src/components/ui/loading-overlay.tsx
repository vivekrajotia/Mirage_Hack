'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="text-white flex items-center">
        <Loader2 className="animate-spin h-8 w-8 mr-3" />
        <span className="text-xl">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingOverlay; 