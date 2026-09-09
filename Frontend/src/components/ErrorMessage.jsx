import React from 'react';

export function ErrorMessage({ message, className = '' }) {
  if (!message) return null;
  return (
    <div className={`error-banner ${className}`} role="alert">
      <span className="error-icon" aria-hidden="true">⚠️</span>
      <span>{message}</span>
    </div>
  );
}
