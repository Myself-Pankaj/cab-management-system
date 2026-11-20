"use client";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@heroui/react";
import { StatusBadge } from "@/components/shared/record-details";
import { api } from "@/store/api/enhanced-api";
import type {
  AdminDocumentDto,
  AdminVehicleDocumentDto,
  CreateDriverDocumentDto,
  CreateVehicleDocumentDto,
} from "@/store/api/generated/api";
import { apiErrorMessage } from "@/features/auth/api-error";
import { showNotification } from "@/components/ui/notifications";
import { SelectedPhoto } from "./vehicle-photos";

export const documentLabels: Record<string, string> = {
  DRIVING_LICENCE: "Driving licence",
  RC: "Registration certificate (RC)",
  PUC: "PUC certificate",
  INSURANCE: "Insurance",
  AADHAAR: "Masked Aadhaar",
};
export function DocumentEditor({
  type,
  vehicleId,
  document,
  draft,
  correctionsAllowed,
  selectedDocumentIds,
  onBusyChange,
}: {
  type: string;
  vehicleId?: string;
  document?: AdminDocumentDto | AdminVehicleDocumentDto;
  draft: boolean;
  correctionsAllowed: boolean;
  selectedDocumentIds: readonly string[];
  onBusyChange: (change: number) => void;
}) {
  const [saveDriver] = api.useDriversControllerAddDocumentMutation();
  const [updateDriver] = api.useDriversControllerUpdateDocumentMutation();
  const [saveVehicle] = api.useDriversControllerAddVehicleDocumentMutation();
  const [updateVehicle] =
    api.useDriversControllerUpdateVehicleDocumentMutation();
  const [upload] = api.useMediaControllerUploadDocumentMutation();
  const [editing, setEditing] = useState(!document);
  const [formVersion, setFormVersion] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const savedId = useRef(document?.id);
  const revision = useRef(document?.revision);
  const correction = document?.correction;
  const canCorrect =
    correctionsAllowed &&
    document?.status === "REJECTED" &&
    selectedDocumentIds.includes(document.id) &&
    !!correction;
  const editable = draft || canCorrect;
  const showForm = editable && (editing || canCorrect);
  const metadataFields = correction?.fields ?? [];
  const canChange = (field: "document_number" | "expiry_date") =>
    draft || metadataFields.includes(field);
  const imageRequired = draft
    ? !document?.images.length
    : correction?.mode !== "METADATA" && !correction?.image_completed;
  const imageAllowed = draft || imageRequired;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    onBusyChange(1);
    const values = new FormData(event.currentTarget);
    try {
      const number = String(values.get("number") ?? "").trim();
      const expiry = String(values.get("expiry") ?? "");
      if (imageRequired && !file)
        throw new Error("Choose a replacement document file.");
      if (
        !savedId.current ||
        number !== (document?.document_number ?? "") ||
        expiry !== (document?.expiry_date ?? "")
      ) {
        const changes = {
          ...(canChange("document_number") && number
            ? { document_number: number }
            : {}),
          ...(canChange("expiry_date") && expiry
            ? { expiry_date: expiry }
            : {}),
          ...(savedId.current ? { expected_revision: revision.current } : {}),
        };
        const result = vehicleId
          ? savedId.current
            ? await updateVehicle({
              vehicleId,
              documentId: savedId.current,
              createVehicleDocumentDto: {
                ...changes,
                document_type:
                  type as CreateVehicleDocumentDto["document_type"],
              },
            }).unwrap()
            : await saveVehicle({
              vehicleId,
              createVehicleDocumentDto: {
                ...changes,
                document_type:
                  type as CreateVehicleDocumentDto["document_type"],
              },
            }).unwrap()
          : savedId.current
            ? await updateDriver({
              documentId: savedId.current,
              createDriverDocumentDto: {
                ...changes,
                document_type:
                  type as CreateDriverDocumentDto["document_type"],
              },
            }).unwrap()
            : await saveDriver({
              createDriverDocumentDto: {
                ...changes,
                document_type:
                  type as CreateDriverDocumentDto["document_type"],
              },
            }).unwrap();
        savedId.current = result.data.document.id;
        revision.current = result.data.document.revision;
      }
      if (file && savedId.current && revision.current !== undefined) {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.onerror = () => reject(new Error("Could not read the image."));
          reader.readAsDataURL(file);
        });
        const result = await upload({
          uploadDocumentDto: {
            owner_type: vehicleId ? "VEHICLE_DOCUMENT" : "DRIVER_DOCUMENT",
            owner_id: savedId.current,
            expected_revision: revision.current,
            content_base64: content,
            ...(type === "AADHAAR" ? { aadhaar_copy: "MASKED" as const } : {}),
          },
        }).unwrap();
        revision.current = result.data.document_revision;
        setFile(null);
      }
      showNotification("success", "Document saved.");
      setEditing(false);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : apiErrorMessage(failure),
      );
    } finally {
      pending.current = false;
      setBusy(false);
      onBusyChange(-1);
    }
  }
  return (
    <article className="operations-card onboarding-document">
      <div className="onboarding-card-heading">
        <h3>{documentLabels[type] ?? type}</h3>
        <StatusBadge status={document?.status ?? "PENDING"} label={document?.status === "REJECTED"
          ? "Needs correction"
          : document?.status === "APPROVED"
            ? "Approved"
            : document?.images.length
              ? "Uploaded"
              : type === "AADHAAR"
                ? "Optional"
                : "Missing"} />
      </div>
      {document?.rejection_reason && (
        <p className="booking-error">{document.rejection_reason}</p>
      )}
      {correction && (
        <p>
          Required:{" "}
          {correction.mode === "IMAGE"
            ? "replacement image"
            : correction.mode === "METADATA"
              ? "details correction"
              : "details and image correction"}
          {metadataFields.length
            ? ` (${metadataFields.map((f) => f.replaceAll("_", " ")).join(", ")})`
            : ""}
          {correction.image_completed ? " · Replacement image saved" : ""}
        </p>
      )}
      {document?.images.map((image) => (
        <a key={image.id} href={image.url} target="_blank" rel="noreferrer">
          View saved document
        </a>
      ))}
      {!showForm && (
        <>
          {document?.document_number && (
            <p>
              {type === "AADHAAR"
                ? `•••• •••• ${document.document_number}`
                : document.document_number}
            </p>
          )}
          {document?.expiry_date && <p>Expires {document.expiry_date}</p>}
          {editable && (
            <Button
              type="button"
              onPress={() => {
                revision.current = document?.revision;
                savedId.current = document?.id;
                setEditing(true);
              }}
            >
              Edit document
            </Button>
          )}
        </>
      )}
      {showForm && (
        <form key={formVersion} className="booking-form" onSubmit={submit} aria-busy={busy}>
          <label>
            {type === "AADHAAR"
              ? "Last four Aadhaar digits"
              : "Document number (optional)"}
            <input
              name="number"
              defaultValue={document?.document_number ?? ""}
              readOnly={!canChange("document_number")}
              pattern={type === "AADHAAR" ? "[0-9]{4}" : undefined}
              maxLength={type === "AADHAAR" ? 4 : 100}
              disabled={busy}
            />
          </label>
          {(vehicleId || type === "DRIVING_LICENCE") && (
            <label>
              Expiry date (optional)
              <input
                type="date"
                name="expiry"
                defaultValue={document?.expiry_date ?? ""}
                readOnly={!canChange("expiry_date")}
                disabled={busy}
              />
            </label>
          )}
          {imageAllowed && (
            <label>
              {document?.images.length ? "Replacement image" : "Document image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                disabled={busy}
                onChange={(event) => {
                  const selected = event.target.files?.[0];
                  if (
                    selected &&
                    (![
                      "image/jpeg",
                      "image/png",
                      "image/webp",
                      "application/pdf",
                    ].includes(selected.type) ||
                      !selected.size ||
                      selected.size > 10 * 1024 * 1024)
                  ) {
                    setError("Choose a JPEG, PNG, WebP, or PDF up to 10 MB.");
                    event.target.value = "";
                    return;
                  }
                  setError("");
                  setFile(selected ?? null);
                }}
              />
            </label>
          )}
          {file &&
            (file.type === "application/pdf" ? (
              <p>PDF selected: {file.name}</p>
            ) : (
              <SelectedPhoto file={file} />
            ))}
          {type === "AADHAAR" && file && (
            <label className="onboarding-checkbox">
              <input type="checkbox" required disabled={busy} />I confirm this
              is a masked Aadhaar copy.
            </label>
          )}
          <p className="operations-muted">
            JPEG, PNG, WebP or PDF · up to 10 MB · private storage
          </p>
          <div className="onboarding-actions">
            {document && !canCorrect && (
              <Button
                type="button"
                isDisabled={busy}
                onPress={() => {
                  setFile(null);
                  setError("");
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" isDisabled={busy}>
              {busy ? "Saving…" : "Save document"}
            </Button>
          </div>
        </form>
      )}
      {error && (
        <div>
          <p role="alert" className="booking-error">
            {error}
          </p>
          <Button
            type="button"
            isDisabled={busy}
            onPress={() => {
              revision.current = document?.revision;
              savedId.current = document?.id;
              setFile(null);
              setError("");
              setFormVersion((value) => value + 1);
            }}
          >
            Reload saved details
          </Button>
        </div>
      )}
    </article>
  );
}
