'use client';

import React, { useState, useEffect } from 'react';
import LoadingPage from './loading-page';
import DashboardPage from './dashboard-page';
import { useSearchParams } from 'next/navigation';

const AppWrapper: React.FC<{ eodDates: string[] }> = ({ eodDates }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingPage onLoadingComplete={handleLoadingComplete} />;
  }

  return <DashboardPage eodDates={eodDates} />;
};

export default AppWrapper; 