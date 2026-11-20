"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { StatusBadge } from "@/components/shared/record-details";
import { QueryState } from "@/components/shared/query-state";
import { Icon } from "@/components/ui/icon";
import { api } from "@/store/api/enhanced-api";
import type { DriverOnboardingDataDto } from "@/store/api/generated/api";
import { apiErrorMessage } from "@/features/auth/api-error";
import { VehicleEditor } from "./vehicle-editor";
import { DocumentEditor, documentLabels } from "./document-editor";
import { VehiclePhotos } from "./vehicle-photos";

function SavedApplication({
  app,
  editStep,
}: {
  app: DriverOnboardingDataDto;
  editStep?: (step: number) => void;
}) {
  return (
    <div className="onboarding-summary">
      {app.vehicles.map((vehicle) => (
        <article className="operations-card" key={vehicle.id}>
          <div className="onboarding-card-heading">
            <h3>Registered vehicle</h3>
            {editStep &&
              (app.can_edit_vehicle || app.can_edit_vehicle_photos) && (
                <Button onPress={() => editStep(0)}>Edit</Button>
              )}
          </div>
          <p>
            <strong>{vehicle.vehicle_number}</strong> ·{" "}
            {vehicle.vehicle_type?.replaceAll("_", " ")}
          </p>
          <p>
            {vehicle.make} {vehicle.model}
          </p>
          <StatusBadge
            status={vehicle.details_review_status}
            label={`Vehicle details: ${vehicle.details_review_status.toLowerCase()}`}
          />
          <StatusBadge
            status={vehicle.photos_review_status}
            label={`Vehicle photos: ${vehicle.photos_review_status.toLowerCase()}`}
          />
          {vehicle.details_rejection_reason && (
            <p className="booking-error">{vehicle.details_rejection_reason}</p>
          )}
          {vehicle.photos_rejection_reason && (
            <p className="booking-error">{vehicle.photos_rejection_reason}</p>
          )}
          <VehiclePhotos images={vehicle.images} />
        </article>
      ))}
      <article className="operations-card">
        <div className="onboarding-card-heading">
          <h3>Document details</h3>
          {editStep && (
            <Button onPress={() => editStep(1)}>View documents</Button>
          )}
        </div>
        {[...app.documents, ...app.vehicles.flatMap((v) => v.documents)].map(
          (doc) => (
            <div className="onboarding-summary-row" key={doc.id}>
              <strong>
                {documentLabels[doc.document_type] ?? doc.document_type}
              </strong>
              <StatusBadge
                status={doc.status}
                label={
                  doc.status === "REJECTED"
                    ? "Needs correction"
                    : doc.status === "PENDING"
                      ? "Awaiting review"
                      : "Approved"
                }
              />
              {doc.rejection_reason && (
                <p className="booking-error">{doc.rejection_reason}</p>
              )}
              {doc.images.map((image) => (
                <a
                  key={image.id}
                  href={image.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View document
                </a>
              ))}
            </div>
          ),
        )}
      </article>
    </div>
  );
}
function OnboardingSteps({ app }: { app: DriverOnboardingDataDto }) {
  const vehicleComplete = app.checklist.vehicle && app.checklist.vehicle_photo;
  const initialStep =
    app.application_status === "REJECTED"
      ? app.vehicles.some(
          (v) =>
            v.details_review_status === "REJECTED" ||
            v.photos_review_status === "REJECTED",
        )
        ? 0
        : 1
      : !vehicleComplete
        ? 0
        : !app.complete
          ? 1
          : 2;
  const [step, setStep] = useState(initialStep);
  const [pending, setPending] = useState(0);
  const onBusyChange = useCallback(
    (change: number) => setPending((value) => value + change),
    [],
  );
  const [submit, result] = api.useDriversControllerSubmitMutation();
  const [error, setError] = useState("");
  const busy = pending > 0 || result.isLoading;
  const draft = app.application_status === "DRAFT";
  const legacy = app.vehicles.length > 1;
  return (
    <>
      <nav aria-label="Onboarding steps" className="onboarding-stepper">
        {["Vehicle", "Documents", "Review & Submit"].map((label, index) => (
          <button
            key={label}
            type="button"
            aria-current={step === index ? "step" : undefined}
            disabled={
              busy ||
              (index > 0 && !vehicleComplete) ||
              (index === 2 && !app.complete)
            }
            onClick={() => setStep(index)}
          >
            <span className="onboarding-step-number">{index + 1}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {legacy && (
        <p role="alert" className="booking-error">
          Multiple saved vehicles need admin resolution before you can edit or
          submit this application.
        </p>
      )}
      <section
        className="onboarding-step"
        hidden={step !== 0}
        aria-label="Vehicle information"
      >
        <div className="onboarding-card-heading">
          <h2>Vehicle information</h2>
          <span>{vehicleComplete ? "Complete" : "Required"}</span>
        </div>
        {legacy ? (
          <SavedApplication app={app} />
        ) : (
          <VehicleEditor
            vehicle={app.vehicles[0]}
            editable={app.can_edit_vehicle}
            photosEditable={app.can_edit_vehicle_photos}
            onBusyChange={onBusyChange}
          />
        )}
        <div className="onboarding-actions">
          <Button
            isDisabled={busy || !vehicleComplete || legacy}
            onPress={() => setStep(1)}
          >
            Continue to Documents
          </Button>
        </div>
      </section>
      {!draft &&
        !app.verification?.correction_document_ids.length &&
        !app.vehicles.some(
          (v) =>
            v.details_review_status !== "APPROVED" ||
            v.photos_review_status !== "APPROVED",
        ) && (
          <p role="status">
            Admin needs to select the documents requiring correction before you
            can edit or resubmit. Contact admin for the next step.
          </p>
        )}
      <section
        className="onboarding-step"
        hidden={step !== 1}
        aria-label="Document details"
      >
        <h2>{draft ? "Required documents" : "Correct rejected documents"}</h2>
        <p>
          {draft
            ? "Save your details and images once. Use Edit to make changes before submitting."
            : "Only items flagged by admin can be changed. Previously approved documents, vehicle details, and photos are preserved."}
        </p>
        <div className="onboarding-document-grid">
          {["DRIVING_LICENCE", "AADHAAR"].map((type) => (
            <DocumentEditor
              key={type}
              type={type}
              document={app.documents.find((d) => d.document_type === type)}
              draft={draft && !legacy}
              correctionsAllowed={!draft && !legacy}
              selectedDocumentIds={
                app.verification?.correction_document_ids ?? []
              }
              onBusyChange={onBusyChange}
            />
          ))}
          {app.vehicles.map((vehicle) =>
            ["RC", "PUC", "INSURANCE"].map((type) => (
              <DocumentEditor
                key={`${vehicle.id}-${type}`}
                type={type}
                vehicleId={vehicle.id}
                document={vehicle.documents.find(
                  (d) => d.document_type === type,
                )}
                draft={draft && !legacy}
                correctionsAllowed={!draft && !legacy}
                selectedDocumentIds={
                  app.verification?.correction_document_ids ?? []
                }
                onBusyChange={onBusyChange}
              />
            )),
          )}
        </div>
        <p className="operations-muted">
          Masked Aadhaar and bank details are optional.
        </p>
        <div className="onboarding-actions">
          <Button isDisabled={busy} onPress={() => setStep(0)}>
            Back
          </Button>
          <Button
            isDisabled={busy || !app.complete || legacy}
            onPress={() => setStep(2)}
          >
            Continue to Review
          </Button>
        </div>
      </section>
      <section
        className="onboarding-step"
        hidden={step !== 2}
        aria-label="Review and submit"
      >
        <h2>Review your application</h2>
        <p>Check your saved information before sending it to admin.</p>
        <SavedApplication app={app} editStep={setStep} />
        {error && (
          <p role="alert" className="booking-error">
            {error}
          </p>
        )}
        <div className="onboarding-actions">
          <Button isDisabled={busy} onPress={() => setStep(1)}>
            Back
          </Button>
          <Button
            isDisabled={busy || !app.can_submit || legacy}
            onPress={async () => {
              setError("");
              try {
                await submit().unwrap();
              } catch (failure) {
                setError(apiErrorMessage(failure));
              }
            }}
          >
            {result.isLoading
              ? "Submitting…"
              : draft
                ? "Submit for admin review"
                : "Resubmit corrected documents"}
          </Button>
        </div>
      </section>
    </>
  );
}
export function DriverOnboarding() {
  const query = api.useDriversControllerGetOnboardingQuery(undefined, {
    refetchOnFocus: true,
  });
  const app = query.data?.data;
  if (!app)
    return (
      <section className="booking-page page-width">
        <QueryState
          loading={query.isLoading}
          error={query.error}
          retry={() => {
            void query.refetch();
          }}
          loadingLabel="Loading your application…"
        />
      </section>
    );
  const editable =
    ["DRAFT", "REJECTED"].includes(app.application_status) &&
    app.profile.status !== "SUSPENDED";
  return (
    <section className="booking-page page-width operations-page onboarding-page">
      <div className="booking-heading">
        <p className="eyebrow">DRIVER ONBOARDING</p>
        <h1>Your next journey starts here.</h1>
        <p>
          Save your vehicle, add your documents, then submit for admin review.
        </p>
      </div>
      <div className="operations-card">
        <div className="onboarding-card-heading">
          <StatusBadge
            status={
              app.profile.status === "SUSPENDED"
                ? "SUSPENDED"
                : app.application_status
            }
            label={
              app.profile.status === "SUSPENDED"
                ? "Account suspended"
                : `Application: ${app.application_status === "PENDING_VERIFICATION" ? "Pending review" : app.application_status.toLowerCase().replaceAll("_", " ")}`
            }
          />
          <Button
            isDisabled={query.isFetching}
            onPress={() => {
              void query.refetch();
            }}
          >
            Refresh status
          </Button>
        </div>
        {app.verification?.rejection_reason && (
          <p className="booking-error">{app.verification.rejection_reason}</p>
        )}
        {app.application_status === "PENDING_VERIFICATION" && (
          <p>
            Your application is under review. You can view the saved details
            while you wait.
          </p>
        )}
        {app.profile.status === "APPROVED" && !app.ride_eligible && (
          <p role="status">
            New ride actions are paused until all documents, vehicle details,
            and photos are approved. You can finish an already-started ride.
          </p>
        )}
        {app.profile.status === "SUSPENDED" && (
          <p role="alert">
            Your account is suspended. Contact admin to resolve your rides.
          </p>
        )}
        <Link href="/driver">Driver dashboard</Link>
      </div>
      <div className="ui-checklist" aria-label="Application readiness">
        <span
          data-complete={Boolean(
            app.checklist.vehicle && app.checklist.vehicle_photo,
          )}
        >
          <Icon
            name={
              app.checklist.vehicle && app.checklist.vehicle_photo
                ? "check"
                : "car"
            }
          />
          Vehicle & photo{" "}
          {app.checklist.vehicle && app.checklist.vehicle_photo
            ? "saved"
            : "required"}
        </span>
        <span data-complete={app.complete}>
          <Icon name={app.complete ? "check" : "user"} />
          {app.complete
            ? "Required details saved"
            : "Required details incomplete"}
        </span>
        <span
          data-complete={
            app.application_status === "APPROVED" &&
            app.profile.status !== "SUSPENDED"
          }
        >
          <Icon
            name={
              app.application_status === "APPROVED" &&
              app.profile.status !== "SUSPENDED"
                ? "check"
                : "clock"
            }
          />
          {app.application_status === "APPROVED" &&
          app.profile.status !== "SUSPENDED"
            ? "Application approved"
            : "Admin approval required"}
        </span>
      </div>
      {editable ? (
        <OnboardingSteps app={app} />
      ) : (
        <SavedApplication app={app} />
      )}
    </section>
  );
}
