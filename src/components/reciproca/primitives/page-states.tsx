import type { ReactNode } from "react";
import { Button } from "./button";

export function PageHeader({
  title,
  subtitle,
  badge,
  action,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div className="page-header-copy">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {(badge || action) && (
        <div className="page-header-actions">
          {badge}
          {action}
        </div>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-chip" />
      <div className="skeleton skeleton-line lg" />
      <div className="skeleton skeleton-line md" />
      <div className="skeleton skeleton-line sm" />
    </div>
  );
}

export function SkeletonMatchCard() {
  return (
    <div className="card match-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-ring" />
      <div className="match-main">
        <div className="skeleton skeleton-chip" />
        <div className="skeleton skeleton-line lg" />
        <div className="skeleton skeleton-line md" />
        <div className="skeleton skeleton-reason" />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-state" role="status">
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-message">{message}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="empty-state error-state" role="alert">
      <p className="empty-state-title">Something went wrong</p>
      <p className="empty-state-message">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function DemoBanner({ businessName }: { businessName: string }) {
  return (
    <div className="demo-banner" role="note">
      <span className="demo-banner-dot" />
      Viewing as <strong>{businessName}</strong> — demo mode, no account required
    </div>
  );
}
