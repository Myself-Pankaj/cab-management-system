import { test } from "node:test";
import assert from "node:assert/strict";
import { saveVehicleWithPhotos } from "../src/features/drivers/save-vehicle.ts";

test("photo retry updates the saved vehicle instead of creating a duplicate", async () => {
  const savedVehicle = { current: undefined };
  const ids = [];
  const photo = new File(["image"], "vehicle.png");
  let pending = [photo];
  let failUpload = true;
  const options = {
    savedVehicle,
    saveDetails: async (id) => {
      ids.push(id);
      return id ?? "new-vehicle";
    },
    photos: pending,
    uploadPhoto: async (id, file) => {
      assert.equal(id, "new-vehicle");
      assert.equal(file, photo);
      if (failUpload) throw new Error("Upload failed");
    },
    photoUploaded: (file) => {
      pending = pending.filter((p) => p !== file);
    },
  };
  await assert.rejects(saveVehicleWithPhotos(options), /Upload failed/);
  assert.equal(savedVehicle.current, "new-vehicle");
  assert.deepEqual(pending, [photo]);
  failUpload = false;
  await saveVehicleWithPhotos({ ...options, photos: pending });
  assert.deepEqual(ids, [undefined, "new-vehicle"]);
  assert.deepEqual(pending, []);
});

test("a partial upload retry only sends the remaining photos", async () => {
  const first = new File(["a"], "front.png");
  const second = new File(["b"], "back.png");
  let pending = [first, second];
  const uploads = [];
  let failUpload = true;
  const options = {
    savedVehicle: { current: "existing-vehicle" },
    saveDetails: async (id) => id,
    photos: pending,
    uploadPhoto: async (_id, photo) => {
      uploads.push(photo.name);
      if (photo === second && failUpload) throw new Error("Upload failed");
    },
    photoUploaded: (file) => {
      pending = pending.filter((p) => p !== file);
    },
  };
  await assert.rejects(saveVehicleWithPhotos(options), /Upload failed/);
  assert.deepEqual(pending, [second]);
  failUpload = false;
  await saveVehicleWithPhotos({ ...options, photos: pending });
  assert.deepEqual(uploads, ["front.png", "back.png", "back.png"]);
});

test("failed detail saving never uploads photos", async () => {
  const savedVehicle = { current: undefined };
  await assert.rejects(
    saveVehicleWithPhotos({
      savedVehicle,
      saveDetails: async () => {
        throw new Error("Save failed");
      },
      photos: [new File(["a"], "front.png")],
      uploadPhoto: async () => assert.fail("Unexpected upload"),
      photoUploaded: () => assert.fail("Unexpected successful upload"),
    }),
    /Save failed/,
  );
  assert.equal(savedVehicle.current, undefined);
});
