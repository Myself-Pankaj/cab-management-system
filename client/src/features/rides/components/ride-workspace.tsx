"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { AvailableDriverPicker } from "./available-driver-picker";
import { QueryState } from "@/components/shared/query-state";
import { api } from "@/store/api/enhanced-api";
import { vehicleCategoryLabels } from "@/features/booking/booking-labels";
import {
  indianTime,
  money,
} from "@/features/booking/components/booking-shared";
import {
  useConfirmation,
  type Confirmation,
} from "@/components/shared/confirmation";
import {
  DetailFields,
  StatusBadge,
} from "@/components/shared/record-details";
import { apiErrorMessage } from "@/features/auth/api-error";
export function RideWorkspace({
  id,
  admin = false,
}: {
  id: string;
  admin?: boolean;
}) {
  const router = useRouter();
  const { confirm, confirmation } = useConfirmation();
  const driverQuery = api.useDriverRidesControllerDetailQuery(
    { id },
    { skip: admin, refetchOnFocus: true },
  );
  const adminQuery = api.useAdminRidesControllerGetDetailQuery(
    { id },
    { skip: !admin, refetchOnFocus: true },
  );
  const query = admin ? adminQuery : driverQuery,
    detail = query.data?.data;
  const [accept] = api.useDriverRidesControllerAcceptMutation(),
    [reject] = api.useDriverRidesControllerRejectMutation(),
    [start] = api.useDriverRidesControllerStartMutation(),
    [complete] = api.useDriverRidesControllerCompleteMutation();
  const [adminComplete] = api.useAdminRidesControllerCompleteMutation(),
    [assign] = api.useAdminRidesControllerAssignMutation(),
    [revoke] = api.useAdminRidesControllerRevokeMutation(),
    [cancel] = api.useAdminRidesControllerCancelMutation(),
    [adminStart] = api.useAdminRidesControllerUpdateStatusMutation();
  const candidates = api.useAdminRidesControllerEligibleQuery(
    { id },
    {
      skip:
        !admin ||
        !detail ||
        !["PENDING_ASSIGNMENT", "DRIVER_ASSIGNED"].includes(detail.ride.status),
      refetchOnFocus: true,
    },
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false),
    operation = useRef<string | null>(null);
  async function run(
    action: (confirmation: Confirmation) => Promise<unknown>,
    title = "Confirm ride action",
  ) {
    if (lock.current) return;
    lock.current = true;
    setError("");
    try {
      const confirmation = await confirm({
        title,
        showReason: admin,
        reasonRequired: admin,
        description: admin
          ? "Review the current ride before confirming. This action will be recorded in the audit history."
          : "Confirm this action for the current ride. Review the journey and any collection amount before continuing.",
      });
      if (!confirmation) return;
      setBusy(true);
      await action(confirmation);
    } catch (failure) {
      setError(apiErrorMessage(failure));
      void query.refetch();
      if (admin && !candidates.isUninitialized) void candidates.refetch();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (!detail)
    return (
      <section className="booking-page page-width">
        <QueryState loading={query.isLoading} error={query.error} retry={() => { void query.refetch(); }} loadingLabel="Loading ride…" />
        <p>
          <Link href={admin ? "/admin/rides" : "/driver"}>Back to rides</Link>
        </p>
      </section>
    );
  const {
    ride,
    payment_summary: payment,
    offers,
    permitted_actions: actions,
  } = detail;
  const current = offers.find(
    (o) =>
      ["PENDING", "ACCEPTED"].includes(o.status) &&
      !o.released_at &&
      !o.cancelled_at,
  );
  const identityOffer =
    ride.status === "COMPLETED"
      ? offers.find(
        (offer) =>
          offer.status === "ACCEPTED" &&
          !offer.released_at &&
          !offer.cancelled_at &&
          (!detail.completion ||
            offer.driver_profile_id === detail.completion.driver_profile_id),
      )
      : current;
  const historicalIdentity = identityOffer?.identity;
  async function completeRide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    operation.current ??= crypto.randomUUID();
    const dto = {
      operation_id: operation.current,
      expected_outstanding: payment.remaining_amount,
      declared_cash: Number(form.get("cash") ?? 0),
    };
    await run(
      (result) =>
        admin
          ? adminComplete({
            id,
            completeDriverRideDto: { ...dto, note: result.reason },
          }).unwrap()
          : complete({ id, completeDriverRideDto: dto }).unwrap(),
      "Declare collection and complete ride",
    );
  }
  return (
    <section className="booking-page page-width operations-page">
      <Link href={admin ? "/admin/rides" : "/driver"}>← All rides</Link>
      <div className="booking-heading">
        <p className="eyebrow">{ride.status.replaceAll("_", " ")}</p>
        <h1>
          {ride.pickup_address} → {ride.destination_address}
        </h1>
        <p>
          {indianTime(ride.pickup_at)} ·{" "}
          {vehicleCategoryLabels[ride.requested_vehicle_category]} ·{" "}
          {ride.passenger_count} passengers
        </p>
      </div>
      <Button
        onPress={() => {
          void query.refetch();
          if (admin && !candidates.isUninitialized) void candidates.refetch();
        }}
        isDisabled={busy || query.isFetching}
      >
        Refresh ride
      </Button>
      {error && (
        <p role="alert" className="booking-error">
          {error} Refresh and review the current assignment and balance before
          retrying.
        </p>
      )}
      {admin && current && (
        <article className="operations-card">
          <h2>
            {current.status === "PENDING"
              ? "Offer sent · awaiting acceptance"
              : "Driver accepted"}
          </h2>
          <p>
            {current.status === "PENDING"
              ? `Offer expires ${indianTime(current.expires_at)}. Acceptance confirms the ride. Rejection or expiry returns it to awaiting assignment.`
              : "The driver has confirmed this booking."}
          </p>
        </article>
      )}
      <div className="operations-grid">
        <article className="operations-card">
          <h2>Journey details</h2>
          {(detail.vehicle || historicalIdentity) && (
            <DetailFields
              items={{
                Driver:
                  admin &&
                    (identityOffer?.driver_profile_id ??
                      ride.driver_profile_id) ? (
                    <Link
                      href={`/admin/drivers/${identityOffer?.driver_profile_id ?? ride.driver_profile_id}`}
                    >
                      {historicalIdentity?.driver_name ??
                        identityOffer?.driver_profile_id ??
                        ride.driver_profile_id}
                    </Link>
                  ) : (
                    (historicalIdentity?.driver_name ??
                      identityOffer?.driver_profile_id ??
                      ride.driver_profile_id)
                  ),
                Vehicle: historicalIdentity
                  ? `${historicalIdentity.vehicle_number} · ${historicalIdentity.vehicle_category.replace("SEATER_", "")} seats`
                  : `${detail.vehicle?.vehicle_number ?? "Unavailable"}${ride.status === "COMPLETED" ? " · Current details; historical snapshot unavailable" : ` · ${detail.vehicle?.make ?? ""} ${detail.vehicle?.model ?? ""}`}`,
              }}
            />
          )}

          <DetailFields
            items={{
              "Requested cab":
                vehicleCategoryLabels[ride.requested_vehicle_category],
              "Passenger count": ride.passenger_count,
              Pickup: ride.pickup_exact_location ?? ride.pickup_address,
              Destination: ride.exact_destination ?? ride.destination_address,
              "Pickup · IST": indianTime(ride.pickup_at),
              "Return · IST": ride.return_at
                ? indianTime(ride.return_at)
                : "One way",
              Status: <StatusBadge status={ride.status} />,
              "Booking ID": ride.id,
            }}
          />
          {ride.return_at && (
            <p>Return journey starts: {indianTime(ride.return_at)}</p>
          )}
          <p>
            {ride.distance_km} km · {ride.estimated_duration_minutes} minutes
            driving
          </p>
          {ride.special_requests && <p>Requests: {ride.special_requests}</p>}
          {ride.cancellation_reason && (
            <p>Cancellation: {ride.cancellation_reason}</p>
          )}
          <h3>Passengers</h3>
          {detail.passengers.map((p) => (
            <p key={p.id}>
              {p.name} · <a href={`tel:${p.phone}`}>{p.phone}</a>
            </p>
          ))}
        </article>
        <article className="operations-card">
          <h2>Payment</h2>
          <div className="admin-financial">
            <DetailFields
              items={{
                "Total fare": <strong>{money(payment.estimated_fare)}</strong>,
                "Paid amount": <strong>{money(payment.paid_amount)}</strong>,
                [ride.status === "CANCELLED"
                  ? "Recorded balance"
                  : "Outstanding balance"]: (
                    <strong>{money(payment.remaining_amount)}</strong>
                  ),
                Status: <StatusBadge status={payment.summary_status} />,
              }}
            />
          </div>
          {ride.status === "CANCELLED" && (
            <p className="admin-muted">
              Cancelled booking. The recorded balance is not an instruction to
              collect.
            </p>
          )}
          {detail.payments.map((transaction) => (
            <div className="admin-audit" key={transaction.id}>
              <StatusBadge status={transaction.status} />
              <p>
                {money(transaction.amount)} · {transaction.payment_type}
              </p>
              {admin && (
                <Link href={`/admin/payments/${transaction.id}`}>
                  Transaction details →
                </Link>
              )}
            </div>
          ))}
          {detail.completion && (
            <p>
              Receipt declared by {detail.completion.declared_by} on{" "}
              {indianTime(detail.completion.created_at)}:{" "}
              {money(detail.completion.declared_cash)}
            </p>
          )}
        </article>
      </div>
      {!admin && current && actions.includes("accept") && (
        <form
          className="operations-card booking-form"
          onSubmit={(e) => {
            e.preventDefault();
            const reason = String(new FormData(e.currentTarget).get("reason") ?? "");
            void run(async () => {
              await reject({
                id: current.id,
                offerReasonDto: {
                  reason,
                },
              }).unwrap();
              router.replace("/driver");
            }, "Reject assignment offer");
          }}
        >
          <h2>Respond to assignment</h2>
          <p>Expires {indianTime(current.expires_at)}</p>
          <label>
            Rejection reason (optional)
            <input name="reason" maxLength={1000} />
          </label>
          <div className="operations-toolbar">
            <Button
              isDisabled={busy}
              onPress={() => {
                void run(() => accept({ id: current.id }).unwrap(), "Accept this ride?");
              }}
            >
              Accept ride
            </Button>
            <Button type="submit" isDisabled={busy}>
              Reject offer
            </Button>
          </div>
        </form>
      )}
      {actions.includes("start") && (
        <Button
          className="booking-primary"
          isDisabled={busy}
          onPress={() => {
            void run((result) =>
              admin
                ? adminStart({
                  id,
                  updateRideStatusDto: {
                    status: "IN_PROGRESS",
                    reason: result.reason,
                  },
                }).unwrap()
                : start({ id }).unwrap(),
              "Start this ride?",
            );
          }}
        >
          Start ride
        </Button>
      )}
      {actions.includes("complete") && (
        <form className="operations-card booking-form" onSubmit={completeRide}>
          <h2>Complete ride</h2>
          <p>
            {payment.remaining_amount > 0
              ? `Collect exactly ${money(payment.remaining_amount)} before submitting this declaration.`
              : "This ride is fully paid. No cash is due."}
          </p>
          <label>
            Cash actually received (INR)
            <input
              key={payment.remaining_amount}
              type="number"
              name="cash"
              min={0}
              step="0.01"
              required
              defaultValue={payment.remaining_amount === 0 ? 0 : undefined}
            />
          </label>
          <label>
            <input type="checkbox" required /> I declare that the amount above
            was actually received{admin ? " by the assigned driver" : " by me"}.
          </label>

          <p className="operations-muted">
            This declaration is recorded in the collection audit.
          </p>
          <Button type="submit" className="booking-primary" isDisabled={busy}>
            {busy ? "Saving…" : "Declare collection and complete"}
          </Button>
        </form>
      )}
      {admin && ride.status === "PENDING_ASSIGNMENT" && (
          <form
            className="operations-card booking-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (candidates.isFetching || candidates.error) return;
              const choice = new FormData(e.currentTarget).get("driver");
              const candidate = candidates.currentData?.data.drivers.find(
                (d) => `${d.driver_profile_id}:${d.vehicle_id}` === choice,
              );
              if (candidate)
                void run(
                  (result) =>
                    assign({
                      id,
                      assignRideDto: {
                        ...result,
                        driver_profile_id: candidate.driver_profile_id,
                        vehicle_id: candidate.vehicle_id,
                      },
                    }).unwrap(),
                  `Send offer to ${candidate.full_name}?`,
                );
            }}
          >
            <h2>Choose an available driver</h2>
            <p>
              Requested cab:{" "}
              <strong>
                {vehicleCategoryLabels[ride.requested_vehicle_category]}
              </strong>{" "}
              · {ride.passenger_count} passengers
            </p>
            <AvailableDriverPicker
              drivers={candidates.currentData?.data.drivers ?? []}
              loading={candidates.isFetching}
              error={candidates.error}
              disabled={busy}
              retry={() => { void candidates.refetch(); }}
            />
            <p className="operations-muted">
              Only available drivers with eligible vehicles are shown. The driver must accept the offer to confirm the ride.
            </p>
          </form>
        )}
      {admin &&
        current &&
        ["DRIVER_ASSIGNED", "CONFIRMED"].includes(ride.status) && (
          <form
            className="operations-card booking-form"
            onSubmit={(e) => {
              e.preventDefault();
              void run(
                (result) =>
                  revoke({
                    id,
                    offerId: current.id,
                    adminOfferReasonDto: result,
                  }).unwrap(),
                "Release ride assignment",
              );
            }}
          >
            <h2>
              {ride.status === "CONFIRMED"
                ? "Release accepted assignment"
                : "Revoke unanswered offer"}
            </h2>

            <Button type="submit" isDisabled={busy}>
              Release for reassignment
            </Button>
          </form>
        )}
      {admin &&
        [
          "PENDING_PAYMENT",
          "PAYMENT_FAILED",
          "PENDING_ASSIGNMENT",
          "DRIVER_ASSIGNED",
          "CONFIRMED",
        ].includes(ride.status) && (
          <form
            className="operations-card booking-form"
            onSubmit={(e) => {
              e.preventDefault();
              void run(
                (result) => cancel({ id, cancelRideDto: result }).unwrap(),
                "Cancel booking",
              );
            }}
          >
            <h2>Cancel booking</h2>

            <Button type="submit" isDisabled={busy}>
              Cancel booking
            </Button>
          </form>
        )}
      <article className="operations-card">
        <h2>Assignment history</h2>
        {offers.length === 0 && <p>No offers yet.</p>}
        {offers.map((offer) => (
          <div className="operations-history" key={offer.id}>
            <strong>
              {offer.status === "PENDING"
                ? "Offer sent · awaiting acceptance"
                : offer.status}
            </strong>
            <p>
              {offer.identity
                ? `${offer.identity.driver_name} · ${offer.identity.vehicle_number} · ${offer.identity.vehicle_category}`
                : `Driver ${offer.driver_profile_id} · Vehicle ${offer.vehicle_id} · Historical display snapshot unavailable`}
            </p>
            <p>
              {indianTime(offer.created_at)} · expires{" "}
              {indianTime(offer.expires_at)}
            </p>
            {admin && (
              <p>
                Sent by {offer.assigned_by ?? "System"}
                {offer.responded_at
                  ? ` · responded ${indianTime(offer.responded_at)}`
                  : ""}
              </p>
            )}
            {offer.reason && <p>{offer.reason}</p>}
            {offer.released_at && (
              <p>
                Released: {offer.release_reason}
                {admin &&
                  ` · by ${offer.released_by ?? "System"} · ${indianTime(offer.released_at)}`}
              </p>
            )}
            {offer.cancelled_at && (
              <p>Booking cancelled {indianTime(offer.cancelled_at)}</p>
            )}
          </div>
        ))}
      </article>
      <article className="operations-card">
        <h2>Ride history</h2>
        {detail.status_history.map((item) => (
          <p key={item.id}>
            {indianTime(item.created_at)} · {item.new_status} · {item.note}
            {admin && ` · by ${item.changed_by ?? "System"}`}
          </p>
        ))}
      </article>
      {confirmation}
    </section>
  );
}
