"use client";

import { useId, useState } from "react";
import { Button, Input } from "@heroui/react";
import type { EligibleDriverDto } from "@/store/api/generated/api";
import { Icon } from "@/components/ui/icon";
import { apiErrorMessage } from "@/features/auth/api-error";

export function AvailableDriverPicker({
  drivers,
  loading,
  error,
  disabled,
  retry,
}: {
  drivers: EligibleDriverDto[];
  loading: boolean;
  error: unknown;
  disabled: boolean;
  retry: () => void;
}) {
  const id = useId();
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const matches = drivers.filter((driver) =>
    `${driver.full_name} ${driver.vehicle_number} ${driver.vehicle_type.replace("SEATER_", "")} seats`
      .toLocaleLowerCase()
      .includes(query),
  );
  const selected = matches.find(
    (driver) => `${driver.driver_profile_id}:${driver.vehicle_id}` === selection,
  );
  const unavailable = disabled || loading || Boolean(error);

  return (
    <div className="driver-picker" aria-busy={loading}>
      <div className="driver-picker-search">
        <label htmlFor={id}>Search available drivers</label>
        <Input
          id={id}
          type="search"
          value={search}
          placeholder="Driver name, vehicle number or seats"
          autoComplete="off"
          disabled={disabled}
          onChange={(event) => {
            setSearch(event.target.value);
            setSelection("");
          }}
        />
      </div>
      {loading ? (
        <p role="status" className="ui-muted">Checking available drivers…</p>
      ) : error ? (
        <div role="alert" className="booking-error">
          <p>{apiErrorMessage(error)}</p>
          <Button type="button" variant="secondary" onPress={retry}>Try again</Button>
        </div>
      ) : drivers.length === 0 ? (
        <div className="driver-picker-empty" role="status">
          <p>No available drivers for this trip.</p>
          <Button type="button" variant="ghost" onPress={retry}>Check again</Button>
        </div>
      ) : (
        <>
          <p className="driver-picker-count" role="status">
            {matches.length} of {drivers.length} available {drivers.length === 1 ? "driver and vehicle" : "driver and vehicle options"}
          </p>
          {matches.length ? (
            <fieldset className="driver-picker-list" disabled={unavailable}>
              <legend className="ui-sr-only">Choose a driver and vehicle</legend>
              {matches.map((driver) => {
                const value = `${driver.driver_profile_id}:${driver.vehicle_id}`;
                return (
                  <label className="driver-picker-option" key={value}>
                    <input
                      type="radio"
                      name="driver"
                      value={value}
                      checked={selected ? selection === value : false}
                      onChange={() => setSelection(value)}
                      required
                    />
                    <span className="driver-picker-identity">
                      <strong>{driver.full_name}</strong>
                      <span><Icon name="car" width={17} height={17} />{driver.vehicle_number} · {driver.vehicle_type.replace("SEATER_", "")} seats</span>
                    </span>
                    {selection === value && <Icon name="check" width={20} height={20} />}
                  </label>
                );
              })}
            </fieldset>
          ) : (
            <div className="driver-picker-empty" role="status">
              <p>No drivers match “{search.trim()}”.</p>
              <Button type="button" variant="ghost" onPress={() => { setSearch(""); setSelection(""); }}>Clear search</Button>
            </div>
          )}
        </>
      )}
      <div className="driver-picker-footer">
        <p className="ui-muted">
          {selected && !unavailable
            ? `${selected.full_name} · ${selected.vehicle_number}`
            : "Select a driver to send an offer."}
        </p>
        <Button type="submit" className="booking-primary" isDisabled={unavailable || !selected}>
          Send offer
        </Button>
      </div>
    </div>
  );
}
