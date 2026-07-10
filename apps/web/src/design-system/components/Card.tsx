import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';

interface CardProps {
  children:   ReactNode;
  hoverable?: boolean;
  padding?:   'sm' | 'md' | 'lg';
  style?:     CSSProperties;
  onClick?:   () => void;
}

const paddingMap = { sm: 16, md: 24, lg: 32 };

export function Card({ children, hoverable = false, padding = 'md', style, onClick }: CardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
      style={{
        background:   'var(--color-surface)',
        border:       `1px solid ${hovered ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
        borderRadius: 12,
        padding:      paddingMap[padding],
        boxShadow:    hovered
          ? '0 4px 12px rgba(15,23,42,0.10), 0 2px 4px rgba(15,23,42,0.06)'
          : '0 1px 3px rgba(15,23,42,0.06)',
        transform:    hovered ? 'translateY(-1px)' : 'none',
        transition:   'box-shadow 200ms ease, border-color 150ms ease, transform 200ms ease',
        cursor:       onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
