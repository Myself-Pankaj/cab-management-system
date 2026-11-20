"use client";
import { useState, type FormEvent } from "react";
import { Button, Card, CardContent, Checkbox, Form } from "@heroui/react";
import { QueryState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/record-details";
import { api } from "@/store/api/enhanced-api";
import type {
  UpdateCabCategoryDto,
  VehicleCategoryResponseDto,
} from "@/store/api/generated/api";
import { BookingField } from "@/features/booking/components/booking-shared";
import { CabImage } from "@/features/booking/components/cab-image";
import { apiErrorMessage } from "@/features/auth/api-error";
function CategoryEditor({ cab }: { cab: VehicleCategoryResponseDto }) {
  const [name, setName] = useState(cab.display_name);
  const [description, setDescription] = useState(cab.description);
  const [image, setImage] = useState(cab.image_url ?? "");
  const [bags, setBags] = useState(String(cab.bag_capacity));
  const [base, setBase] = useState(String(cab.base_fare_inr));
  const [perKm, setPerKm] = useState(String(cab.per_km_rate_inr));
  const [minimum, setMinimum] = useState(String(cab.min_fare_inr));
  const [active, setActive] = useState(cab.is_active);
  const [save, result] = api.useAdminCabsControllerUpdateMutation();
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (result.isLoading) return;
    setError("");
    if (image && !image.startsWith("https://")) {
      setError("Use an HTTPS image URL.");
      return;
    }
    if (!Number.isInteger(Number(bags))) {
      setError("Bag capacity must be a whole number.");
      return;
    }
    const update: UpdateCabCategoryDto = {
      display_name: name.trim(),
      description,
      image_url: image || null,
      bag_capacity: Number(bags),
      base_fare_inr: Number(base),
      per_km_rate_inr: Number(perKm),
      min_fare_inr: Number(minimum),
      is_active: active,
    };
    try {
      await save({
        category: cab.category,
        updateCabCategoryDto: update,
      }).unwrap();
    } catch (failure) {
      setError(apiErrorMessage(failure));
    }
  }
  return (
    <Card className="cab-card admin-cab">
      <CabImage src={image} name={name} />
      <small className="ui-image-caption">Category image preview · passengers book a category, not this exact vehicle</small>
      <CardContent>
        <Form
          onSubmit={submit}
          validationBehavior="native"
          className="booking-form"
        >
          <StatusBadge status={cab.is_active ? "ACTIVE" : "INACTIVE"} label={cab.is_active ? "Available for booking" : "Unavailable for booking"} />
          <p className="eyebrow">
            {cab.category} · {cab.seat_limit} FIXED SEATS
          </p>
          <BookingField
            label="Cab display name"
            value={name}
            onChange={setName}
            required
            maxLength={50}
          />
          <BookingField
            label="Description"
            value={description}
            onChange={setDescription}
            maxLength={500}
          />
          <BookingField
            label="Image URL (optional, HTTPS)"
            value={image}
            onChange={setImage}
            type="url"
          />
          <h2>Capacity & pricing</h2>
          <div className="booking-field-grid">
            <BookingField
              label="Bag capacity"
              value={bags}
              onChange={setBags}
              type="number"
              min={0}
              max={30}
              required
            />
            <BookingField
              label="Base fare (INR)"
              value={base}
              onChange={setBase}
              type="number"
              min={0}
              max={1000000}
              required
            />
            <BookingField
              label="Per kilometre (INR)"
              value={perKm}
              onChange={setPerKm}
              type="number"
              min={0}
              max={1000000}
              required
            />
            <BookingField
              label="Minimum fare (INR)"
              value={minimum}
              onChange={setMinimum}
              type="number"
              min={0}
              max={1000000}
              required
            />
          </div>
          <Checkbox isSelected={active} onChange={setActive}>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content>Available for passenger booking</Checkbox.Content>
          </Checkbox>
          {error && (
            <p role="alert" className="booking-error">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="booking-primary"
            isDisabled={result.isLoading}
          >
            {result.isLoading ? "Saving…" : "Save category"}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
export function CabCatalog() {
  const result = api.useAdminCabsControllerListQuery();
  return (
    <section className="booking-page page-width">
      <div className="booking-heading">
        <p className="eyebrow">ADMINISTRATION</p>
        <h1>Comfort, thoughtfully curated.</h1>
        <p>
          Manage the four cab categories passengers can book. Changes apply to
          new quotes; historical booking fares stay unchanged.
        </p>
      </div>
      <QueryState loading={result.isLoading} error={result.error} empty={result.data?.data.length === 0}
        emptyTitle="No cab categories found." emptyDescription="Refresh to check the current catalog."
        retry={() => { void result.refetch(); }} loadingLabel="Loading cab catalog…" />
      <div className="cab-grid">
        {result.data?.data.map((cab) => (
          <CategoryEditor key={JSON.stringify(cab)} cab={cab} />
        ))}
      </div>
    </section>
  );
}
