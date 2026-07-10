import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?:    string | number;
  height?:   string | number;
  radius?:   string | number;
  style?:    CSSProperties;
}

export function Skeleton({ width = '100%', height = 12, radius = 4, style }: SkeletonProps) {
  return (
    <>
      <span style={{
        display:         'inline-block',
        width,
        height,
        borderRadius:    radius,
        background:      'var(--color-surface-alt)',
        backgroundImage: 'linear-gradient(90deg, transparent 0%, var(--color-border) 50%, transparent 100%)',
        backgroundSize:  '200% 100%',
        animation:       'shimmer 1.4s ease-in-out infinite',
        ...style,
      }} />
      <style>{`@keyframes shimmer { 0%{background-position:200% 0;opacity:.6} 50%{opacity:1} 100%{background-position:-200% 0;opacity:.6} }`}</style>
    </>
  );
}
