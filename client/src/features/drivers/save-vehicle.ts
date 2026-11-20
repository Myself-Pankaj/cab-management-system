export async function saveVehicleWithPhotos({
  savedVehicle,
  saveDetails,
  photos,
  uploadPhoto,
  photoUploaded,
}: {
  savedVehicle: { current: string | undefined };
  saveDetails: (id: string | undefined) => Promise<string>;
  photos: readonly File[];
  uploadPhoto: (vehicleId: string, photo: File) => Promise<void>;
  photoUploaded: (photo: File) => void;
}) {
  const id = await saveDetails(savedVehicle.current);
  // Persist before uploading so a failed photo never causes a second registration.
  savedVehicle.current = id;
  for (const photo of photos) {
    await uploadPhoto(id, photo);
    photoUploaded(photo);
  }
}
