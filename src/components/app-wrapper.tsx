'use client';

import React, { useState, useEffect } from 'react';
import LoadingPage from './loading-page';
import DashboardPage from './dashboard-page';

const AppWrapper: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // Check if we should show loading page (e.g., on hard refresh)
    const shouldShowLoading = !sessionStorage.getItem('dashboard-loaded');
    
    if (!shouldShowLoading) {
      setIsLoading(false);
      setShowDashboard(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    // Mark dashboard as loaded in session storage
    sessionStorage.setItem('dashboard-loaded', 'true');
    
    // Play a subtle completion sound (optional)
    if (typeof window !== 'undefined') {
      try {
        // Create a short, pleasant notification sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (e) {
        // Ignore audio errors
      }
    }
    
    // Add a small delay for smooth transition
    setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        setShowDashboard(true);
      }, 300);
    }, 100);
  };

  if (isLoading) {
    return <LoadingPage onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className={`transition-opacity duration-500 ${showDashboard ? 'opacity-100' : 'opacity-0'}`}>
      <DashboardPage />
    </div>
  );
};

export default AppWrapper; 