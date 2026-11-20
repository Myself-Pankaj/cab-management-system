"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
export type Confirmation = { reason: string; operation_id: string };
type Request = {
  title: string;
  description?: string;
  reasonRequired?: boolean;
  showReason?: boolean;
  confirmLabel?: string;
};
export function useConfirmation() {
  const [request, setRequest] = useState<Request | null>(null);
  const resolve = useRef<((result: Confirmation | null) => void) | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    if (request && !element?.open) element?.showModal();
    return () => {
      element?.close();
      if (request && previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [request]);
  useEffect(
    () => () => {
      resolve.current?.(null);
    },
    [],
  );
  function finish(result: Confirmation | null) {
    resolve.current?.(result);
    resolve.current = null;
    setRequest(null);
  }
  function confirm(next: Request) {
    resolve.current?.(null);
    setRequest(next);
    return new Promise<Confirmation | null>((done) => {
      resolve.current = done;
    });
  }
  const confirmation: ReactNode = request && (
    <dialog
      ref={dialog}
      className="ui-confirm-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        finish(null);
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const reason = String(
            new FormData(event.currentTarget).get("reason") ?? "",
          ).trim();
          if (request.showReason !== false && request.reasonRequired !== false && !reason) {
            const field = event.currentTarget.elements.namedItem("reason");
            if (field instanceof HTMLTextAreaElement) {
              field.setCustomValidity(
                "Enter a reason before confirming this action.",
              );
              field.reportValidity();
            }
            return;
          }
          finish({ reason, operation_id: crypto.randomUUID() });
        }}
      >
        <p className="eyebrow">Confirm action</p>
        <h2 id={titleId}>{request.title}</h2>
        <p className="ui-muted">
          {request.description ??
            "Your decision and changes will be recorded in the audit history."}
        </p>
        {request.showReason !== false && <label>
          Reason{" "}
          {request.reasonRequired === false ? "(optional)" : "(required)"}
          <textarea
            name="reason"
            onInput={(event) => event.currentTarget.setCustomValidity("")}
            required={request.reasonRequired !== false}
            maxLength={1000}
            rows={4}
          />
        </label>}
        <div className="ui-dialog-actions">
          <button type="button" autoFocus onClick={() => finish(null)}>
            Keep reviewing
          </button>
          <button className="booking-primary" type="submit">
            {request.confirmLabel ?? "Confirm action"}
          </button>
        </div>
      </form>
    </dialog>
  );
  return { confirm, confirmation };
}
