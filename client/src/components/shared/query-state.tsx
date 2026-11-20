"use client";

import { Button } from "@heroui/react";
import { apiErrorMessage } from "@/features/auth/api-error";
import { Icon } from "@/components/ui/icon";

export function LoadingSkeleton({ label = "Loading records…", count = 3 }: { label?: string; count?: number }) {
  return (
    <div className="ui-loading" role="status">
      <span className="ui-sr-only">{label}</span>
      <div className="ui-skeleton-grid" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <div className="ui-skeleton-card" key={index}>
            <span className="ui-skeleton ui-skeleton-short" />
            <span className="ui-skeleton ui-skeleton-title" />
            <span className="ui-skeleton" />
            <span className="ui-skeleton ui-skeleton-short" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function QueryState({ error, loading, empty, retry, emptyTitle = "No records match this view.", emptyDescription = "Try another view or clear your filters.", loadingLabel }: {
  error?: unknown; loading: boolean; empty?: boolean; retry: () => unknown;
  emptyTitle?: string; emptyDescription?: string; loadingLabel?: string;
}) {
  if (error) return (
    <div className="ui-state ui-state-error" role="alert">
      <Icon name="notice" />
      <div><h2>We couldn’t load these details.</h2><p>{apiErrorMessage(error)}</p></div>
      <Button isDisabled={loading} onPress={() => { retry(); }}>Try again</Button>
    </div>
  );
  if (loading) return <LoadingSkeleton label={loadingLabel} />;
  if (empty) return (
    <div className="ui-state">
      <Icon name="car" width={32} height={32} />
      <div><h2>{emptyTitle}</h2><p>{emptyDescription}</p></div>
    </div>
  );
  return null;
}
