import React, { useEffect, useState } from 'react';

export type ToastBannerType = 'success' | 'error' | 'info';

const COLORS: Record<ToastBannerType, string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
};
const ICONS: Record<ToastBannerType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ),
  error: (
    <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  info: (
    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>
  ),
};

export interface ToastBannerProps {
  type: ToastBannerType;
  message: string;
  onClose?: () => void;
  duration?: number; // in ms
}

// EA FC/iOS HIG-inspired, springy, minimal animation
const slideIn = `
  @keyframes toast-slide-in {
    0% { opacity: 0; transform: translate(-120%, -80%) scale(0.92) skewX(-8deg); }
    60% { opacity: 1; transform: translate(8px, 0) scale(1.04) skewX(2deg); }
    80% { transform: translate(0, 0) scale(0.98) skewX(0deg); }
    100% { opacity: 1; transform: translate(0, 0) scale(1) skewX(0deg); }
  }
`;
const slideOut = `
  @keyframes toast-slide-out {
    0% { opacity: 1; transform: translate(0, 0) scale(1) skewX(0deg); }
    100% { opacity: 0; transform: translate(-120%, -80%) scale(0.92) skewX(-8deg); }
  }
`;

// The current height is 44px (h-[44px]). We'll increase it to 56px (h-[56px]).
export const ToastBanner: React.FC<ToastBannerProps> = ({ type, message, onClose, duration = 2000 }) => {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!onClose) return;
    if (exiting) return;
    const timer = setTimeout(() => setExiting(true), duration);
    // Progress bar animation
    let frame: number;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100));
      if (elapsed < duration) frame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [onClose, duration, exiting]);

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => onClose && onClose(), 200);
    return () => clearTimeout(timer);
  }, [exiting, onClose]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('toast-banner-anim')) return;
    const style = document.createElement('style');
    style.id = 'toast-banner-anim';
    style.innerHTML = slideIn + slideOut;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  return (
    <div
      className={`fixed top-6 left-6 z-50 flex items-center border border-neutral-200/80 shadow-lg min-w-[260px] max-w-[90vw] h-[56px] px-3 py-2 bg-white/80 backdrop-blur-md bg-clip-padding select-none cursor-pointer font-sans font-semibold text-sm ${COLORS[type]} transition-all duration-200`
        + (exiting
          ? ' animate-toast-slide-out'
          : ' animate-toast-slide-in')
      }
      style={{
        animation: exiting ? 'toast-slide-out 0.2s cubic-bezier(.7,-0.2,.3,1.5) forwards' : 'toast-slide-in 0.25s cubic-bezier(.7,-0.2,.3,1.5) forwards',
        boxShadow: '0 4px 16px 0 rgba(0,0,0,0.13), 0 1.5px 8px 0 rgba(0,0,0,0.08)',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        letterSpacing: '0.01em',
        borderTop: 'none',
        borderBottom: 'none',
        borderRight: 'none',
        background: 'rgba(255,255,255,0.80)',
        // borderRadius removed for sharp borders
      }}
      onClick={() => setExiting(true)}
    >
      {ICONS[type]}
      <span className="flex-1 pr-2 text-neutral-900 truncate">{message}</span>
      {onClose && (
        <button onClick={e => { e.stopPropagation(); setExiting(true); }} className="ml-2 text-lg font-bold text-neutral-400 hover:text-neutral-900 focus:outline-none transition-colors duration-150">×</button>
      )}
      {/* Progress bar */}
      <div className="absolute left-0 bottom-0 h-[3.5px] w-full bg-neutral-200/60 overflow-hidden">
        <div
          className={`h-full ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} transition-all`}
          style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
        />
      </div>
    </div>
  );
};

export default ToastBanner; 