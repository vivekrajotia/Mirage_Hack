'use client';

import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Sparkles, Bot, Zap, Activity } from 'lucide-react';
import Image from 'next/image';

interface LoadingPageProps {
  onLoadingComplete: () => void;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentTeamMember, setCurrentTeamMember] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState('initializing');
  const [particles, setParticles] = useState<Array<{left: number, top: number, size: string, delay: number, duration: number}>>([]);
  const [tradingIcons, setTradingIcons] = useState<Array<{left: number, top: number, delay: number, duration: number, icon: string}>>([]);
  const [mounted, setMounted] = useState(false);

  const teamMembers = ['Vivek', 'Subham', 'Daksh', 'Nishchay'];
  const loadingPhases = [
    'Initializing TradeVision...',
    'Loading AI Canvas...',
    'Syncing Market Data...',
    'Calibrating Analytics...',
    'Preparing Dashboard...',
    'Ready to Trade!'
  ];

  useEffect(() => {
    // Generate particles and trading icons on client side only
    const generatedParticles = [...Array(50)].map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: ['small', 'medium', 'large'][i % 3],
      delay: i * 0.1,
      duration: 2 + Math.random() * 2
    }));

    const generatedTradingIcons = [...Array(8)].map((_, i) => ({
      left: 10 + (i * 12),
      top: 20 + (i * 8),
      delay: i * 0.5,
      duration: 3 + Math.random() * 2,
      icon: i % 2 === 0 ? '📈' : '💰'
    }));

    setParticles(generatedParticles);
    setTradingIcons(generatedTradingIcons);
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setTimeout(() => onLoadingComplete(), 800);
          return 100;
        }
        return prev + 1;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setLoadingPhase(prev => {
        const currentIndex = loadingPhases.indexOf(prev);
        return loadingPhases[(currentIndex + 1) % loadingPhases.length];
      });
    }, 1200);

    return () => clearInterval(phaseInterval);
  }, []);

  useEffect(() => {
    const teamInterval = setInterval(() => {
      setCurrentTeamMember(prev => (prev + 1) % teamMembers.length);
    }, 1000);

    return () => clearInterval(teamInterval);
  }, []);

  const Particle = ({ delay = 0, size = 'small', left = 0, top = 0, duration = 2 }: { 
    delay?: number; 
    size?: 'small' | 'medium' | 'large';
    left?: number;
    top?: number;
    duration?: number;
  }) => {
    const sizeClass = size === 'small' ? 'w-1 h-1' : size === 'medium' ? 'w-2 h-2' : 'w-3 h-3';
    
    return (
      <div
        className={`absolute bg-blue-400 rounded-full opacity-70 animate-pulse ${sizeClass}`}
        style={{
          left: `${left}%`,
          top: `${top}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {mounted && particles.map((particle, i) => (
          <Particle 
            key={i} 
            delay={particle.delay} 
            size={particle.size as 'small' | 'medium' | 'large'} 
            left={particle.left}
            top={particle.top}
            duration={particle.duration}
          />
        ))}
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 loading-grid"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 p-8">
        {/* Logo and Title */}
        <div className="relative logo-container animate-slide-up">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-30 animate-pulse-glow"></div>
          <div className="relative bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full p-6 shadow-2xl animate-glow">
            <BarChart2 className="w-16 h-16 text-white animate-bounce" />
          </div>
        </div>

        <div className="space-y-4 animate-slide-up">
          <h1 className="loading-title text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
            TradeVision
          </h1>
          <p className="loading-subtitle text-xl md:text-2xl text-slate-300 font-medium tracking-wide">
            AI-Powered Trading Analytics Platform
          </p>
        </div>

        {/* Loading phase */}
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            {[Bot, Sparkles, TrendingUp, Activity].map((Icon, index) => (
              <Icon 
                key={index} 
                className={`w-6 h-6 text-cyan-400 ${index === Math.floor(progress / 25) ? 'animate-spin' : 'animate-pulse'}`}
              />
            ))}
          </div>
          <span className="text-lg text-slate-300 font-medium min-w-[250px] text-left">
            {loadingPhases[Math.floor(progress / (100 / loadingPhases.length))]}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md space-y-2 animate-slide-up">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden progress-bar-shimmer">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Team members */}
        <div className="space-y-3 animate-slide-up">
          <p className="text-sm text-slate-200 uppercase tracking-wider font-semibold">Built by Team</p>
          <div className="flex flex-wrap justify-center gap-3">
            {teamMembers.map((member, index) => (
              <div
                key={member}
                className={`team-member-card px-4 py-2 rounded-full border transition-all duration-300 ${
                  index === currentTeamMember
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-transparent shadow-lg scale-110 animate-glow'
                    : 'bg-slate-700 text-white border-slate-500 hover:border-slate-400'
                }`}
              >
                <span className="font-semibold">{member}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Powered by Taomish */}
        <div className="space-y-2 animate-slide-up mt-8">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-lg text-slate-200 font-semibold animate-pulse bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(56, 189, 248, 0.5)' }}>
              Powered by
            </span>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src="/logo-dark-mode.png"
                  alt="Taomish Logo"
                  width={180}
                  height={60}
                  className="object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent px-2">Taomish</span>';
                    }
                  }}
                />
              </div>
              <div className="relative w-16 h-10">
                <Image
                  src="/waving-indian-flag-design-with-blue-chakra.png"
                  alt="Indian Flag"
                  width={64}
                  height={40}
                  className="object-contain"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '🇮🇳';
                      parent.className = 'text-3xl flex items-center justify-center';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hackathon badge */}
        <div className="absolute top-8 right-8 hackathon-badge text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
          <Zap className="w-4 h-4 inline mr-2" />
          Hackathon Project
        </div>

      </div>

      {/* Floating trading elements */}
      <div className="absolute inset-0 pointer-events-none">
        {mounted && tradingIcons.map((icon, i) => (
          <div
            key={i}
            className="absolute text-green-400 opacity-20 trading-icon animate-float"
            style={{
              left: `${icon.left}%`,
              top: `${icon.top}%`,
              animationDelay: `${icon.delay}s`,
              animationDuration: `${icon.duration}s`,
            }}
          >
            {icon.icon}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingPage; 