"use client";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@heroui/react";
import { useConfirmation } from "@/components/shared/confirmation";
import { StatusBadge } from "@/components/shared/record-details";
import { api } from "@/store/api/enhanced-api";
import { apiErrorMessage } from "@/features/auth/api-error";
import { showNotification } from "@/components/ui/notifications";
import type {
  AdminVehicleDto,
  CreateDriverVehicleDto,
} from "@/store/api/generated/api";
import { saveVehicleWithPhotos } from "../save-vehicle";
import { SelectedPhoto, VehiclePhotos } from "./vehicle-photos";
export function VehicleEditor({
  vehicle,
  editable,
  photosEditable,
  onBusyChange,
}: {
  vehicle?: AdminVehicleDto;
  editable: boolean;
  photosEditable: boolean;
  onBusyChange: (change: number) => void;
}) {
  const { confirm, confirmation } = useConfirmation();
  const [editing, setEditing] = useState(!vehicle);
  const [create] = api.useDriversControllerAddVehicleMutation(),
    [update] = api.useDriversControllerUpdateVehicleMutation();
  const [upload] = api.useMediaControllerUploadVehiclePhotoMutation();
  const [deleteImage] = api.useMediaControllerDeleteImageMutation();
  const savedId = useRef(vehicle?.id);
  const pending = useRef(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    onBusyChange(1);
    setError("");
    const data = new FormData(event.currentTarget);
    const dto: CreateDriverVehicleDto = {
      vehicle_number: String(data.get("number")),
      vehicle_type: String(
        data.get("category"),
      ) as CreateDriverVehicleDto["vehicle_type"],
      make: String(data.get("make") ?? ""),
      model: String(data.get("model") ?? ""),
      color: String(data.get("color") ?? ""),
      expected_revision: vehicle?.review_revision,
      ...(data.get("year")
        ? { manufacturing_year: Number(data.get("year")) }
        : {}),
    };
    try {
      await saveVehicleWithPhotos({
        savedVehicle: savedId,
        saveDetails: async (id) => {
          if (!editable && id) return id;
          const result = id
            ? await update({
                vehicleId: id,
                createDriverVehicleDto: dto,
              }).unwrap()
            : await create({ createDriverVehicleDto: dto }).unwrap();
          return result.data.vehicle.id;
        },
        photos,
        uploadPhoto: async (vehicleId, photo) => {
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(",")[1]);
            reader.onerror = () =>
              reject(new Error("Could not read the photo."));
            reader.readAsDataURL(photo);
          });
          await upload({
            vehicleId,
            uploadVehiclePhotoDto: {
              content_base64: content,
              expected_revision: vehicle?.review_revision,
            },
          }).unwrap();
        },
        photoUploaded: (photo) =>
          setPhotos((current) => current.filter((file) => file !== photo)),
      });
      showNotification("success", "Vehicle saved.");
      setEditing(false);
    } catch (failure) {
      setError(apiErrorMessage(failure));
    } finally {
      pending.current = false;
      setBusy(false);
      onBusyChange(-1);
    }
  }
  if (!editing || (!editable && !photosEditable))
    return (
      <article className="operations-card">
        <div className="onboarding-card-heading">
          <h3>Registered vehicle</h3>
          <StatusBadge
            status={vehicle?.details_review_status ?? "PENDING"}
            label={`Details: ${vehicle?.details_review_status?.toLowerCase() ?? "pending"}`}
          />
        </div>
        <p>
          <strong>{vehicle?.vehicle_number ?? "Vehicle saved"}</strong> ·{" "}
          {vehicle?.vehicle_type?.replaceAll("_", " ")}
        </p>
        <p>
          {vehicle?.make} {vehicle?.model}
        </p>
        <StatusBadge
          status={vehicle?.photos_review_status ?? "PENDING"}
          label={`Photos: ${vehicle?.photos_review_status?.toLowerCase() ?? "pending"}`}
        />
        {vehicle?.details_rejection_reason && (
          <p className="booking-error">
            Vehicle details: {vehicle.details_rejection_reason}
          </p>
        )}
        {vehicle?.photos_rejection_reason && (
          <p className="booking-error">
            Vehicle photos: {vehicle.photos_rejection_reason}
          </p>
        )}
        <VehiclePhotos images={vehicle?.images ?? []} />
        {(editable || photosEditable) && (
          <Button type="button" onPress={() => setEditing(true)}>
            Edit vehicle
          </Button>
        )}
      </article>
    );
  return (
    <>
      {confirmation}
      <form
        className="operations-card booking-form"
        onSubmit={submit}
        aria-busy={busy}
      >
        <h3>{vehicle ? "Your vehicle" : "Register a vehicle"}</h3>
        {vehicle?.details_rejection_reason && (
          <p className="booking-error">
            Vehicle details: {vehicle.details_rejection_reason}
          </p>
        )}
        {vehicle?.photos_rejection_reason && (
          <p className="booking-error">
            Vehicle photos: {vehicle.photos_rejection_reason}
          </p>
        )}
        <fieldset
          className="booking-form onboarding-fieldset"
          disabled={busy || !editable}
        >
          <label>
            Registration number
            <input
              name="number"
              defaultValue={vehicle?.vehicle_number}
              maxLength={30}
              required
            />
          </label>
          <label>
            Category
            <select
              name="category"
              defaultValue={vehicle?.vehicle_type ?? "SEATER_4"}
            >
              {[4, 5, 7, 12].map((n) => (
                <option key={n} value={`SEATER_${n}`}>
                  {n} seater
                </option>
              ))}
            </select>
          </label>
          <label>
            Make
            <input
              name="make"
              defaultValue={vehicle?.make ?? ""}
              maxLength={100}
            />
          </label>
          <label>
            Model
            <input
              name="model"
              defaultValue={vehicle?.model ?? ""}
              maxLength={100}
            />
          </label>
          <label>
            Color
            <input
              name="color"
              defaultValue={vehicle?.color ?? ""}
              maxLength={50}
            />
          </label>
          <label>
            Manufacturing year
            <input
              name="year"
              type="number"
              min={1980}
              max={2100}
              defaultValue={vehicle?.manufacturing_year ?? ""}
            />
          </label>
        </fieldset>
        <p>Add at least one photo before submitting your application.</p>
        <fieldset
          className="booking-form onboarding-fieldset"
          disabled={busy || !photosEditable}
        >
          <VehiclePhotos images={vehicle?.images ?? []} />
          {vehicle?.images.map((image, index) => (
            <Button
              key={image.id}
              type="button"
              isDisabled={busy}
              onPress={async () => {
                if (pending.current) return;
                pending.current = true;
                setBusy(true);
                onBusyChange(1);
                setError("");
                try {
                  const decision = await confirm({
                    title: `Remove vehicle photo ${index + 1}?`,
                    description:
                      "This photo will be removed from your vehicle. At least one saved photo is required before submitting an application.",
                    showReason: false,
                    confirmLabel: "Remove photo",
                  });
                  if (!decision) return;
                  await deleteImage({
                    id: image.id,
                    expectedRevision: vehicle?.review_revision,
                  }).unwrap();
                } catch (failure) {
                  setError(apiErrorMessage(failure));
                } finally {
                  pending.current = false;
                  setBusy(false);
                  onBusyChange(-1);
                }
              }}
            >
              Remove photo {index + 1}
            </Button>
          ))}
          <label>
            Vehicle photos (JPEG, PNG, WebP; up to 10 MB each)
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = "";
                if (
                  files.some(
                    (file) =>
                      !["image/jpeg", "image/png", "image/webp"].includes(
                        file.type,
                      ) ||
                      file.size === 0 ||
                      file.size > 10 * 1024 * 1024,
                  )
                ) {
                  setError(
                    "Choose JPEG, PNG, or WebP photos up to 10 MB each.",
                  );
                  return;
                }
                setError("");
                setPhotos((current) => [...current, ...files]);
              }}
            />
          </label>
          {photos.map((file, index) => (
            <div key={index}>
              <SelectedPhoto file={file} />
              <Button
                type="button"
                isDisabled={busy}
                onPress={() =>
                  setPhotos((current) => current.filter((_, i) => i !== index))
                }
              >
                Remove selected photo {index + 1}
              </Button>
            </div>
          ))}
        </fieldset>
        {error && (
          <p role="alert" className="booking-error">
            {error}
          </p>
        )}
        {vehicle && (
          <Button
            type="button"
            isDisabled={busy}
            onPress={() => {
              setPhotos([]);
              setError("");
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" isDisabled={busy}>
          {busy ? "Saving…" : "Save vehicle"}
        </Button>
      </form>
    </>
  );
}
