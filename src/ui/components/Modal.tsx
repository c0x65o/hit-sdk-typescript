/**
 * Modal and Alert Components
 */

import React, { useEffect, useRef } from 'react';
import type { ModalSpec, AlertSpec, UISpec } from '../types';
import { useHitUI } from '../context';
import { RenderChildren } from '../renderer';

interface ModalProps extends ModalSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Modal({
  id,
  title,
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
  registry,
  className,
  style,
}: ModalProps) {
  const { closeModal } = useHitUI();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      closeModal();
    }
  };

  const sizeClasses = {
    sm: 'hit-modal-sm',
    md: 'hit-modal-md',
    lg: 'hit-modal-lg',
    xl: 'hit-modal-xl',
    full: 'hit-modal-full',
  };

  return (
    <div
      className="hit-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      <div
        ref={modalRef}
        className={`hit-modal ${sizeClasses[size]} ${className || ''}`}
        style={style}
      >
        {title && (
          <div className="hit-modal-header">
            <h2 id={`${id}-title`} className="hit-modal-title">
              {title}
            </h2>
            <button
              className="hit-modal-close"
              onClick={() => closeModal()}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        )}

        <div className="hit-modal-body">
          <RenderChildren children={children} registry={registry} />
        </div>

        {footer && footer.length > 0 && (
          <div className="hit-modal-footer">
            <RenderChildren children={footer} registry={registry} />
          </div>
        )}
      </div>
    </div>
  );
}

interface AlertProps extends AlertSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Alert({
  title,
  message,
  variant = 'info',
  dismissible = false,
  className,
  style,
}: AlertProps) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div
      className={`hit-alert hit-alert-${variant} ${className || ''}`}
      style={style}
      role="alert"
    >
      <span className="hit-alert-icon">{icons[variant]}</span>
      <div className="hit-alert-content">
        {title && <div className="hit-alert-title">{title}</div>}
        <div className="hit-alert-message">{message}</div>
      </div>
      {dismissible && (
        <button
          className="hit-alert-dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}

