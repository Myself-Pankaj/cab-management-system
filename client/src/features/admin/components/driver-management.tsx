"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/store/api/enhanced-api";
import type {
  AdminDocumentDto,
  AdminVehicleDocumentDto,
} from "@/store/api/generated/api";
import { apiErrorMessage } from "@/features/auth/api-error";
import { indianTime } from "@/features/booking/components/booking-shared";
import { VehiclePhotos } from "@/features/drivers/components/vehicle-photos";
import { AdminApplications } from "./admin-applications";
import {
  AdminHeading,
  DetailFields,
  QueryStatus,
  StatusBadge,
  readable,
} from "./admin-shared";
import { useAdminConfirmation, type Confirmation } from "./admin-confirmation";
import { PrivateDocument } from "./private-document";
import { RelatedRides } from "./related-rides";
export function DriverManagement() {
  return <AdminApplications />;
}
export function DriverReview({ id }: { id: string }) {
  const query = api.useAdminDriversControllerGetDriverDetailsQuery(
    { profileId: id },
    { refetchOnFocus: true },
  );
  const [reviewVehicle] = api.useAdminDriversControllerReviewVehicleMutation();
  const [review] = api.useAdminDriversControllerReviewProfileMutation(),
    [suspend] = api.useAdminDriversControllerSuspendMutation(),
    [returnApplication] =
      api.useAdminDriversControllerRequestCorrectionsMutation();
  const { confirm, confirmation } = useAdminConfirmation();
  const lock = useRef(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const app = query.currentData?.data;
  async function act(
    title: string,
    action: (confirmation: Confirmation) => Promise<unknown>,
  ) {
    if (lock.current) return;
    lock.current = true;
    try {
      const result = await confirm({ title });
      if (!result) return;
      setBusy(true);
      setError("");
      await action(result);
    } catch (failure) {
      setError(apiErrorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const pending =
    app?.application_status === "PENDING_VERIFICATION" &&
    app.profile.status !== "SUSPENDED";
  const corrections =
    app &&
    [...app.documents, ...app.vehicles.flatMap((v) => v.documents)].some(
      (d) => d.status === "REJECTED" && d.correction,
    );
  return (
    <section>
      <AdminHeading
        title={app?.user?.full_name ?? "Driver details"}
        intro="Profile, compliance, vehicles, and operational history."
        refresh={() => query.refetch()}
        busy={query.isFetching}
      />
      <Link href="/admin/drivers">← All drivers</Link>
      <QueryStatus
        error={query.error}
        loading={query.isLoading}
        retry={() => query.refetch()}
      />
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      {app && (
        <>
          <div className="admin-detail-grid">
            <article className="admin-panel">
              <h2>Driver profile</h2>
              <DetailFields
                items={{
                  Name: app.user?.full_name,
                  Email: app.user?.email,
                  Phone: app.user?.phone_number,
                  Application: <StatusBadge status={app.application_status} />,
                  "Profile status": <StatusBadge status={app.profile.status} />,
                  "User account": app.user ? (
                    <Link href={`/admin/users/${app.user.id}`}>
                      View account →
                    </Link>
                  ) : null,
                }}
              />
              <div className="admin-actions">
                {pending && (
                  <>
                    <button
                      disabled={busy || !app.compliance_approved}
                      onClick={() =>
                        void act("Approve driver", (confirmation) =>
                          review({
                            profileId: id,
                            reviewDriverDto: {
                              ...confirmation,
                              decision: "APPROVED",
                            },
                          }).unwrap(),
                        )
                      }
                    >
                      Approve driver
                    </button>
                    <button
                      disabled={busy || !corrections}
                      onClick={() =>
                        void act(
                          "Return application for corrections",
                          (confirmation) =>
                            review({
                              profileId: id,
                              reviewDriverDto: {
                                ...confirmation,
                                decision: "REJECTED",
                                rejection_reason: confirmation.reason,
                              },
                            }).unwrap(),
                        )
                      }
                    >
                      Return for corrections
                    </button>
                  </>
                )}
                {["APPROVED", "REJECTED"].includes(app.application_status) &&
                  app.profile.status !== "SUSPENDED" && (
                    <button
                      disabled={busy || !corrections}
                      onClick={() =>
                        void act("Request updated documents", (confirmation) =>
                          returnApplication({
                            profileId: id,
                            suspendDriverDto: confirmation,
                          }).unwrap(),
                        )
                      }
                    >
                      Request corrections
                    </button>
                  )}
                {app.profile.status === "APPROVED" && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      void act("Suspend driver", (confirmation) =>
                        suspend({
                          profileId: id,
                          suspendDriverDto: confirmation,
                        }).unwrap(),
                      )
                    }
                  >
                    Suspend driver
                  </button>
                )}
              </div>
            </article>
            <article className="admin-panel">
              <h2>Compliance review</h2>
              <StatusBadge
                status={app.ride_eligible ? "ELIGIBLE" : "REVIEW_REQUIRED"}
              />
              <p className="admin-muted">
                All supplied documents, vehicle details, and photos must be
                approved before new assignments. Metadata corrections return
                documents to pending review.
              </p>
              {app.profile.status === "SUSPENDED" && (
                <p className="admin-error">
                  Driver suspended. Resolve existing rides through ride
                  operations.
                </p>
              )}
              <p className="admin-muted">
                Flag an item and give a correction reason to immediately unlock
                it for the driver. Other approved items remain unchanged.
              </p>
            </article>
          </div>
          <section className="admin-section">
            <h2>Driver documents</h2>
            <div className="admin-detail-grid">
              {app.documents.map((document) => (
                <DocumentReview
                  key={document.id}
                  document={document}
                  pending={!!pending}
                  canReview={
                    app.profile.status !== "SUSPENDED" &&
                    app.application_status !== "DRAFT"
                  }
                />
              ))}
            </div>
          </section>
          {app.vehicles.map((vehicle) => (
            <article className="admin-panel admin-section" key={vehicle.id}>
              <div className="admin-document-heading">
                <h2>{vehicle.vehicle_number}</h2>
                <Link href={`/admin/vehicles/${vehicle.id}`}>
                  Vehicle details & edit →
                </Link>
              </div>
              {(["DETAILS", "PHOTOS"] as const).map((group) => {
                const status =
                  group === "DETAILS"
                    ? vehicle.details_review_status
                    : vehicle.photos_review_status;
                const reason =
                  group === "DETAILS"
                    ? vehicle.details_rejection_reason
                    : vehicle.photos_rejection_reason;
                const label =
                  group === "DETAILS" ? "Vehicle details" : "Vehicle photos";
                return (
                  <div key={group} className="admin-panel">
                    <h3>{label}</h3>
                    <StatusBadge status={status} />
                    {reason && <p className="admin-error">{reason}</p>}
                    {group === "PHOTOS" &&
                      vehicle.photos_correction_completed &&
                      status === "REJECTED" && (
                        <p>Replacement saved; awaiting driver resubmission.</p>
                      )}
                    <div className="admin-actions">
                      <button
                        disabled={busy || !pending || status === "APPROVED"}
                        onClick={() =>
                          void act(
                            `Approve ${label.toLowerCase()}`,
                            (confirmation) =>
                              reviewVehicle({
                                vehicleId: vehicle.id,
                                reviewVehicleDto: {
                                  ...confirmation,
                                  group,
                                  expected_revision: vehicle.review_revision,
                                  decision: "APPROVED",
                                },
                              }).unwrap(),
                          )
                        }
                      >
                        Approve {label.toLowerCase()}
                      </button>
                      <button
                        disabled={
                          busy ||
                          app.profile.status === "SUSPENDED" ||
                          app.application_status === "DRAFT"
                        }
                        onClick={() =>
                          void act(
                            `Request correction for ${label.toLowerCase()}`,
                            (confirmation) =>
                              reviewVehicle({
                                vehicleId: vehicle.id,
                                reviewVehicleDto: {
                                  ...confirmation,
                                  group,
                                  expected_revision: vehicle.review_revision,
                                  decision: "REJECTED",
                                },
                              }).unwrap(),
                          )
                        }
                      >
                        Request correction
                      </button>
                    </div>
                  </div>
                );
              })}
              <DetailFields
                items={{
                  Category: vehicle.vehicle_type,
                  Make: vehicle.make,
                  Model: vehicle.model,
                  Color: vehicle.color,
                  Year: vehicle.manufacturing_year,
                  Activity: (
                    <StatusBadge
                      status={vehicle.is_active ? "ACTIVE" : "INACTIVE"}
                    />
                  ),
                }}
              />
              <VehiclePhotos images={vehicle.images} />
              <div className="admin-detail-grid">
                {vehicle.documents.map((document) => (
                  <DocumentReview
                    key={document.id}
                    vehicle
                    document={document}
                    pending={!!pending}
                    canReview={
                      app.profile.status !== "SUSPENDED" &&
                      app.application_status !== "DRAFT"
                    }
                  />
                ))}
              </div>
            </article>
          ))}
          <RelatedRides driverProfileId={id} />
          <article className="admin-panel admin-section">
            <h2>Review history</h2>
            {app.audit.length === 0 && (
              <p className="admin-muted">No review actions yet.</p>
            )}
            {app.audit.map((item) => (
              <div className="admin-audit" key={item.id}>
                <StatusBadge status={item.decision} />
                <p>{item.reason ?? "No reason recorded"}</p>
                <small className="admin-muted">
                  {readable(item.document_kind)} · {indianTime(item.created_at)}{" "}
                  · Reviewer {item.reviewed_by}
                </small>
                {item.details && (
                  <details>
                    <summary>Change details</summary>
                    <pre>{JSON.stringify(item.details, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </article>
        </>
      )}
      {confirmation}
    </section>
  );
}
export function DocumentReview({
  document,
  vehicle = false,
  pending,
  canReview,
}: {
  document: AdminDocumentDto | AdminVehicleDocumentDto;
  vehicle?: boolean;
  pending: boolean;
  canReview: boolean;
}) {
  const [driverReview] = api.useAdminDriversControllerReviewDocumentMutation(),
    [vehicleReview] =
      api.useAdminDriversControllerReviewVehicleDocumentMutation();
  const [correctDriver] =
      api.useAdminDriversControllerCorrectDocumentMutation(),
    [correctVehicle] =
      api.useAdminDriversControllerCorrectVehicleDocumentMutation();
  const [mode, setMode] = useState<"IMAGE" | "METADATA" | "BOTH">("IMAGE"),
    [fields, setFields] = useState<("document_number" | "expiry_date")[]>([
      "document_number",
    ]),
    [editing, setEditing] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [editBaseline, setEditBaseline] = useState(document);
  const lock = useRef(false);
  const { confirm, confirmation } = useAdminConfirmation();
  async function run(
    title: string,
    action: (result: Confirmation) => Promise<unknown>,
  ) {
    if (lock.current) return;
    lock.current = true;
    try {
      const result = await confirm({ title });
      if (!result) return;
      setBusy(true);
      setError("");
      await action(result);
      setEditing(false);
    } catch (failure) {
      setError(apiErrorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function decide(decision: "APPROVED" | "REJECTED") {
    return run(
      `${decision === "APPROVED" ? "Approve" : "Request correction for"} ${readable(document.document_type)}`,
      (result) => {
        const dto = {
          ...result,
          decision,
          expected_revision: document.revision,
          ...(decision === "REJECTED"
            ? {
                rejection_reason: result.reason,
                correction_mode: mode,
                metadata_fields: mode === "IMAGE" ? [] : fields,
              }
            : {}),
        };
        return (
          vehicle
            ? vehicleReview({ documentId: document.id, reviewDocumentDto: dto })
            : driverReview({ documentId: document.id, reviewDocumentDto: dto })
        ).unwrap();
      },
    );
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void run("Correct document details", (result) => {
      const dto = {
        ...result,
        expected_revision: editBaseline.revision,
        document_number: String(data.get("number") ?? ""),
        ...(vehicle || document.document_type === "DRIVING_LICENCE"
          ? { expiry_date: String(data.get("expiry") ?? "") || null }
          : {}),
      };
      return (
        vehicle
          ? correctVehicle({
              documentId: document.id,
              adminDocumentEditDto: dto,
            })
          : correctDriver({
              documentId: document.id,
              adminDocumentEditDto: dto,
            })
      ).unwrap();
    });
  }
  return (
    <article className="admin-document">
      <div className="admin-document-heading">
        <h3>{readable(document.document_type)}</h3>
        <StatusBadge status={document.status} />
      </div>
      <DetailFields
        items={{
          "Document number":
            document.document_type === "AADHAAR"
              ? `•••• •••• ${document.document_number ?? "—"}`
              : document.document_number,
          Expiry: document.expiry_date?.slice(0, 10),
          Revision: document.revision,
        }}
      />
      {document.rejection_reason && (
        <p className="admin-error">{document.rejection_reason}</p>
      )}
      {document.correction && (
        <p className="admin-muted">
          Correction required: {readable(document.correction.mode)} ·{" "}
          {document.correction.fields.map(readable).join(", ")}
        </p>
      )}
      {document.images.map((file) => (
        <PrivateDocument key={file.id} file={file} />
      ))}
      {!document.images.length && (
        <p className="admin-empty">
          Private attachment unavailable. Request a replacement.
        </p>
      )}
      {canReview && (
        <>
          <div className="admin-actions">
            <button
              disabled={busy}
              onClick={() => {
                if (!editing) setEditBaseline(document);
                setEditing((value) => !value);
              }}
            >
              Correct details
            </button>
          </div>
          {editing && (
            <form
              key={editBaseline.revision}
              className="admin-form"
              onSubmit={save}
            >
              {document.revision !== editBaseline.revision && (
                <div className="admin-error" role="status">
                  This document changed while you were editing. Your draft is
                  preserved.
                  <div className="admin-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setEditBaseline(document);
                        setError("");
                      }}
                    >
                      Discard draft and load latest details
                    </button>
                  </div>
                </div>
              )}
              <label>
                Document number
                <input
                  name="number"
                  defaultValue={editBaseline.document_number ?? ""}
                  maxLength={document.document_type === "AADHAAR" ? 4 : 100}
                />
              </label>
              {(vehicle || document.document_type === "DRIVING_LICENCE") && (
                <label>
                  Expiry date
                  <input
                    type="date"
                    name="expiry"
                    defaultValue={editBaseline.expiry_date?.slice(0, 10) ?? ""}
                  />
                </label>
              )}
              <p className="admin-muted">
                Saving resets this document to pending review and blocks new
                assignments until compliance is approved again.
              </p>
              <button className="admin-primary" disabled={busy}>
                Review correction
              </button>
            </form>
          )}
          <div className="admin-form">
            <label>
              Required correction
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as typeof mode)}
              >
                <option value="IMAGE">Replacement file</option>
                <option value="METADATA">Details only</option>
                <option value="BOTH">File and details</option>
              </select>
            </label>
            {mode !== "IMAGE" && (
              <fieldset>
                <legend>Fields to correct</legend>
                {(
                  [
                    "document_number",
                    ...(vehicle || document.document_type === "DRIVING_LICENCE"
                      ? ["expiry_date"]
                      : []),
                  ] as ("document_number" | "expiry_date")[]
                ).map((field) => (
                  <label key={field}>
                    <input
                      type="checkbox"
                      checked={fields.includes(field)}
                      onChange={(event) =>
                        setFields((current) =>
                          event.target.checked
                            ? [...current, field]
                            : current.filter((value) => value !== field),
                        )
                      }
                    />
                    {readable(field)}
                  </label>
                ))}
              </fieldset>
            )}
          </div>
          <div className="admin-actions">
            {pending && (
              <button
                disabled={
                  busy ||
                  !document.images.length ||
                  document.status === "APPROVED"
                }
                onClick={() => void decide("APPROVED")}
              >
                Approve document
              </button>
            )}
            <button
              disabled={busy || (mode !== "IMAGE" && !fields.length)}
              onClick={() => void decide("REJECTED")}
            >
              Request correction
            </button>
          </div>
        </>
      )}
      {busy && <p role="status">Saving review…</p>}
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      {confirmation}
    </article>
  );
}
