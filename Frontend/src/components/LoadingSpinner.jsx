import React from 'react';

export function LoadingSpinner({ size = 'default', className = '' }) {
  const sizeClass = size === 'sm' ? 'spinner--sm' : size === 'lg' ? 'spinner--lg' : '';
  return <span className={`spinner ${sizeClass} ${className}`} aria-label="Loading..." />;
}

export function ChartSkeleton() {
  return (
    <div className="skeleton skeleton-chart" aria-label="Loading chart..." />
  );
}

export function LoadingOverlay({ text = 'Loading…' }) {
  return (
    <div className="flex-center" style={{ padding: '32px', flexDirection: 'column', gap: '12px' }}>
      <LoadingSpinner size="lg" />
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{text}</span>
    </div>
  );
}
