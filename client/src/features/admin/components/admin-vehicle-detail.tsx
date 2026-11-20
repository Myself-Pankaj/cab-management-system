"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/store/api/enhanced-api";
import type {
  AdminVehicleEditDto,
  AdminVehicleDto,
} from "@/store/api/generated/api";
import { apiErrorMessage } from "@/features/auth/api-error";
import { indianTime } from "@/features/booking/components/booking-shared";
import { VehiclePhotos } from "@/features/drivers/components/vehicle-photos";
import {
  AdminHeading,
  DetailFields,
  QueryStatus,
  StatusBadge,
} from "./admin-shared";
import { useAdminConfirmation } from "./admin-confirmation";
import { PrivateDocument } from "./private-document";
export function AdminVehicleDetail({ id }: { id: string }) {
  const query = api.useAdminReportingControllerVehicleQuery(
    { id },
    { refetchOnFocus: true },
  );
  const detail = query.currentData?.data;
  return (
    <section>
      <AdminHeading
        title={detail?.vehicle.vehicle_number ?? "Vehicle details"}
        intro="Fleet information, registered driver, documents, and change history."
        refresh={() => query.refetch()}
        busy={query.isFetching}
      />
      <Link href="/admin/vehicles">← All vehicles</Link>
      <QueryStatus
        error={query.error}
        loading={query.isLoading}
        retry={() => query.refetch()}
      />
      {detail && (
        <>
          <div className="admin-detail-grid">
            <article className="admin-panel">
              <h2>Vehicle information</h2>
              <DetailFields
                items={{
                  Registration: detail.vehicle.vehicle_number,
                  Category: detail.vehicle.vehicle_type,
                  Make: detail.vehicle.make,
                  Model: detail.vehicle.model,
                  Color: detail.vehicle.color,
                  Year: detail.vehicle.manufacturing_year,
                  Status: (
                    <StatusBadge
                      status={detail.vehicle.is_active ? "ACTIVE" : "INACTIVE"}
                    />
                  ),
                  Updated: indianTime(detail.vehicle.updated_at),
                }}
              />
              <VehiclePhotos images={detail.vehicle.images} />
            </article>
            <article className="admin-panel">
              <h2>Registered driver</h2>
              <DetailFields
                items={{
                  Name: detail.driver?.full_name,
                  Email: detail.driver?.email,
                  Phone: detail.driver?.phone_number,
                  Profile: (
                    <Link
                      href={`/admin/drivers/${detail.vehicle.driver_profile_id}`}
                    >
                      View driver →
                    </Link>
                  ),
                }}
              />
            </article>
          </div>
          <VehicleForm
            key={detail.vehicle.id}
            vehicle={detail.vehicle}
            refreshedAt={query.fulfilledTimeStamp ?? 0}
            blocking={detail.blocking.map((value) => value.ride_id)}
          />
          <section className="admin-section">
            <h2>Vehicle documents</h2>
            <div className="admin-detail-grid">
              {detail.vehicle.documents.map((document) => (
                <article className="admin-document" key={document.id}>
                  <div className="admin-document-heading">
                    <h3>{document.document_type}</h3>
                    <StatusBadge status={document.status} />
                  </div>
                  <DetailFields
                    items={{
                      Number: document.document_number,
                      Expiry: document.expiry_date?.slice(0, 10),
                    }}
                  />
                  {document.images.map((file) => (
                    <PrivateDocument file={file} key={file.id} />
                  ))}
                  <Link
                    href={`/admin/drivers/${detail.vehicle.driver_profile_id}`}
                  >
                    Review or correct document →
                  </Link>
                </article>
              ))}
            </div>
          </section>
          <article className="admin-panel admin-section">
            <h2>Vehicle edit history</h2>
            {detail.audit.length === 0 && (
              <p className="admin-muted">No administrative edits recorded.</p>
            )}
            {detail.audit.map((item) => (
              <div className="admin-audit" key={item.id}>
                <strong>{item.reason ?? "Metadata correction"}</strong>
                <p className="admin-muted">
                  {indianTime(item.created_at)} · Admin {item.actor_id}
                </p>
                <details>
                  <summary>Before and after</summary>
                  <pre>
                    {JSON.stringify(
                      { before: item.before_values, after: item.after_values },
                      null,
                      2,
                    )}
                  </pre>
                </details>
              </div>
            ))}
          </article>
        </>
      )}
    </section>
  );
}
function VehicleForm({
  vehicle,
  blocking,
  refreshedAt,
}: {
  vehicle: AdminVehicleDto;
  blocking: string[];
  refreshedAt: number;
}) {
  const [update, state] =
    api.useAdminReportingControllerUpdateVehicleMutation();
  const [error, setError] = useState(""),
    [blockedReply, setBlockedReply] = useState<{
      ids: string[];
      at: number;
    } | null>(null),
    [editing, setEditing] = useState(false);
  const [record, setRecord] = useState(vehicle);
  const blocked =
    blockedReply && blockedReply.at > refreshedAt ? blockedReply.ids : blocking;
  const lock = useRef(false);
  const { confirm, confirmation } = useAdminConfirmation();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    try {
      const data = new FormData(event.currentTarget);
      const category = (
        ["SEATER_4", "SEATER_5", "SEATER_7", "SEATER_12"] as const
      ).find((value) => value === data.get("category"));
      if (!category) throw new Error("Choose a vehicle category.");
      const number = String(data.get("number")).trim().toUpperCase(),
        active = data.get("active") === "on";
      const reasonRequired =
        number !== record.vehicle_number ||
        category !== record.vehicle_type ||
        active !== record.is_active;
      const result = await confirm({
        title: "Save vehicle changes",
        reasonRequired,
        description: reasonRequired
          ? "Registration or category changes require renewed compliance review. Active assignments block vehicle editing."
          : "These metadata corrections will be recorded in the vehicle history.",
      });
      if (!result) return;
      const dto: AdminVehicleEditDto = {
        ...result,
        expected_updated_at: record.updated_at,
        vehicle_number: number,
        vehicle_type: category,
        make: String(data.get("make") ?? ""),
        model: String(data.get("model") ?? ""),
        color: String(data.get("color") ?? ""),
        ...(data.get("year")
          ? { manufacturing_year: Number(data.get("year")) }
          : {}),
        is_active: active,
      };
      setError("");
      await update({ id: vehicle.id, adminVehicleEditDto: dto }).unwrap();
      setEditing(false);
    } catch (failure) {
      setError(apiErrorMessage(failure));
      if (failure && typeof failure === "object" && "data" in failure) {
        const data = failure.data;
        if (data && typeof data === "object" && "error" in data) {
          const issue = data.error;
          if (issue && typeof issue === "object" && "details" in issue) {
            const details = issue.details;
            if (
              details &&
              typeof details === "object" &&
              "blockingRideIds" in details &&
              Array.isArray(details.blockingRideIds)
            )
              setBlockedReply({
                ids: details.blockingRideIds.filter(
                  (id): id is string => typeof id === "string",
                ),
                at: Date.now(),
              });
          }
        }
      }
    } finally {
      lock.current = false;
    }
  }
  return (
    <article className="admin-panel">
      <div className="admin-document-heading">
        <h2>Edit vehicle</h2>
        <button
          disabled={state.isLoading || (!editing && !!blocked.length)}
          onClick={() => {
            if (!editing) setRecord(vehicle);
            setEditing((value) => !value);
          }}
        >
          {editing ? "Cancel editing" : "Edit details"}
        </button>
      </div>
      {!!blocked.length && (
        <div className="admin-error">
          Vehicle editing is blocked by active rides or pending offers.
          <div className="admin-actions">
            {[...new Set(blocked)].map((id) => (
              <Link key={id} href={`/admin/rides/${id}`}>
                View blocking ride →
              </Link>
            ))}
          </div>
        </div>
      )}
      {editing && (
        <form key={record.updated_at} className="admin-form" onSubmit={submit}>
          {vehicle.updated_at !== record.updated_at && (
            <div className="admin-error" role="status">
              This vehicle changed while you were editing. Your draft is
              preserved.
              <div className="admin-actions">
                <button
                  type="button"
                  onClick={() => {
                    setRecord(vehicle);
                    setError("");
                  }}
                >
                  Discard draft and load latest details
                </button>
              </div>
            </div>
          )}
          <fieldset disabled={state.isLoading || !!blocked.length}>
            <div className="admin-details">
              <label>
                Registration number
                <input
                  name="number"
                  required
                  maxLength={30}
                  defaultValue={record.vehicle_number}
                />
              </label>
              <label>
                Category
                <select
                  name="category"
                  defaultValue={record.vehicle_type ?? "SEATER_4"}
                >
                  {[4, 5, 7, 12].map((seats) => (
                    <option key={seats} value={`SEATER_${seats}`}>
                      {seats} seats
                    </option>
                  ))}
                </select>
              </label>
              {(["make", "model", "color"] as const).map((field) => (
                <label key={field}>
                  {field[0].toUpperCase() + field.slice(1)}
                  <input
                    name={field}
                    maxLength={field === "color" ? 50 : 100}
                    defaultValue={record[field] ?? ""}
                  />
                </label>
              ))}
              <label>
                Manufacturing year
                <input
                  name="year"
                  type="number"
                  min={1980}
                  max={2100}
                  defaultValue={record.manufacturing_year ?? ""}
                />
              </label>
              <label>
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={record.is_active}
                />
                Active vehicle
              </label>
            </div>
            <div className="admin-actions">
              <button type="submit" className="admin-primary">
                {state.isLoading ? "Saving…" : "Review changes"}
              </button>
            </div>
          </fieldset>
        </form>
      )}
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      {confirmation}
    </article>
  );
}
