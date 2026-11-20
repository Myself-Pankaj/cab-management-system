"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { useEffect, useState } from "react";

export function VehiclePhotos({
  images,
}: {
  images: { id: string; url: string }[];
}) {
  if (!images.length) return <p className="ui-field-help">No vehicle photos saved yet.</p>;
  return (
    <div className="ui-vehicle-photos" aria-label="Saved vehicle photos">
      {images.map((image, index) => <VehiclePhoto key={image.id} image={image} index={index} />)}
    </div>
  );
}

function VehiclePhoto({ image, index }: { image: { id: string; url: string }; index: number }) {
  const [failed, setFailed] = useState(false);
  return <a href={image.url} target="_blank" rel="noreferrer" className="ui-vehicle-photo" aria-label={`Open vehicle photo ${index + 1} in a new tab`}>
    {failed ? <span className="ui-photo-fallback"><Icon name="car" />Photo unavailable</span> : <Image src={image.url} alt={`Vehicle photo ${index + 1}`} width={200} height={150} unoptimized onError={() => setFailed(true)} />}
    <span>Photo {index + 1} ↗</span>
  </a>;
}

export function SelectedPhoto({ file }: { file: File }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setUrl(String(reader.result));
    reader.readAsDataURL(file);
    return () => {
      reader.onload = null;
      if (reader.readyState === FileReader.LOADING) reader.abort();
    };
  }, [file]);
  return url ? (
    <Image
      src={url}
      alt={`Selected vehicle photo: ${file.name}`}
      width={160}
      height={120}
      style={{ height: "auto", objectFit: "cover" }}
      unoptimized
    />
  ) : null;
}
