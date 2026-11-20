"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type {
  DefinitionsFromApi,
  OverrideResultType,
} from "@reduxjs/toolkit/query";
import { api } from "@/store/api/enhanced-api";
import type { ImageResponseDto } from "@/store/api/generated/api";
import { useAppSelector } from "@/store/hooks";
import { LoadingSkeleton } from "@/components/shared/query-state";
import { apiErrorMessage } from "@/features/auth/api-error";

// Keep private binary requests on the existing session-refresh path. Only serializable
// data crosses RTK Query, and nothing is retained after the viewer unsubscribes.
type DocumentDefinition = OverrideResultType<
  DefinitionsFromApi<typeof api>["mediaControllerViewDocument"],
  string
>;
const documents = api.enhanceEndpoints<
  never,
  { mediaControllerViewDocument: DocumentDefinition }
>({
  endpoints: {
    mediaControllerViewDocument: (definition) => {
      definition.keepUnusedDataFor = 0;
      definition.query = (arg) => ({
        url: `/api/v1/media/documents/${encodeURIComponent(arg.id)}/content`,
        params: { download: "1" },
        cache: "no-store",
        responseHandler: async (response) => {
          if (!response.ok) return response.json();
          const mime =
            response.headers.get("content-type")?.split(";")[0] ??
            "application/octet-stream";
          const bytes = new Uint8Array(await response.arrayBuffer());
          let binary = "";
          for (let i = 0; i < bytes.length; i += 8192)
            binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
          return `data:${mime};base64,${btoa(binary)}`;
        },
      });
    },
  },
});
export function PrivateDocument({
  file,
}: {
  file: Pick<ImageResponseDto, "id" | "mime_type" | "file_name">;
}) {
  const thumbnail = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [opened, setOpened] = useState(false),
    [zoom, setZoom] = useState(1),
    [page, setPage] = useState(1);
  const [load, state] = documents.useLazyMediaControllerViewDocumentQuery();
  const [source, setSource] = useState<{
    url: string;
    bytes: Uint8Array;
    mime: string;
  } | null>(null);
  const [failure, setFailure] = useState("");
  const [retry, setRetry] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const session = useAppSelector((value) => value.session.status);
  useEffect(() => {
    const element = thumbnail.current;
    if (!element || !file.mime_type?.startsWith("image/")) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [file.mime_type]);
  useEffect(() => {
    if ((!opened && !visible) || session === "anonymous") return;
    let active = true;
    let objectUrl: string | undefined;
    const request = load({ id: file.id, download: "1" }, false);
    request
      .unwrap()
      .then((data) => {
        if (!active) return;
        if (typeof data !== "string" || !data.startsWith("data:"))
          throw new Error("Document could not be read.");
        const comma = data.indexOf(","),
          mime = data.slice(5, data.indexOf(";"));
        if (
          ![
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
          ].includes(mime)
        )
          throw new Error("Unsupported document format.");
        const binary = atob(data.slice(comma + 1)),
          bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        objectUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
        setSource({ url: objectUrl, bytes, mime });
        setFailure("");
      })
      .catch((error) => {
        if (active) {
          setSource(null);
          setFailure(apiErrorMessage(error));
        }
      });
    return () => {
      active = false;
      request.abort();
      request.unsubscribe();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setSource(null);
    };
  }, [opened, visible, file.id, load, session, retry]);
  useEffect(() => {
    if (opened && session !== "anonymous") dialog.current?.showModal();
    else dialog.current?.close();
  }, [opened, session]);
  async function download() {
    // A fresh protected request rechecks authorization even when the preview is loaded.
    const result = load({ id: file.id, download: "1" }, false);
    try {
      const data = await result.unwrap();
      if (typeof data !== "string") throw new Error("Download unavailable");
      const response = await fetch(data),
        blob = await response.blob(),
        url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `document.${blob.type === "application/pdf" ? "pdf" : blob.type === "image/jpeg" ? "jpg" : blob.type === "image/png" ? "png" : "webp"}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      if (source) URL.revokeObjectURL(source.url);
      setSource(null);
      setFailure(apiErrorMessage(error));
    } finally {
      result.unsubscribe();
    }
  }
  return (
    <div className="admin-file-preview" ref={thumbnail}>
      <span>
        {file.mime_type === "application/pdf"
          ? "PDF document"
          : "Document image"}{" "}
        · {file.file_name ?? "Private attachment"}
      </span>
      {source &&
        source.mime !== "application/pdf" &&
        session !== "anonymous" && (
          <Image
            unoptimized
            width={420}
            height={240}
            src={source.url}
            alt="Document thumbnail"
            style={{ objectFit: "contain" }}
          />
        )}
      <button
        type="button"
        onClick={() => {
          setFailure("");
          setPage(1);
          setZoom(1);
          setOpened(true);
        }}
      >
        Preview document
      </button>
      <dialog
        ref={dialog}
        className="admin-dialog admin-viewer"
        aria-label="Private document preview"
        onCancel={(event) => {
          event.preventDefault();
          setOpened(false);
        }}
      >
        <div className="admin-document-heading">
          <h2>Private document</h2>
          <button type="button" onClick={() => setOpened(false)}>
            Close
          </button>
        </div>
        <p className="admin-muted">
          Private access · Aadhaar copies must be masked. Upload confirmation is
          not automatic masking verification.
        </p>
        <div className="admin-actions">
          <button
            onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
          >
            Zoom out
          </button>
          <span role="status" aria-label="Zoom level">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((value) => Math.min(3, value + 0.25))}>
            Zoom in
          </button>
          <button onClick={() => void download()} disabled={state.isFetching}>
            Download securely
          </button>
        </div>
        {state.isFetching && <LoadingSkeleton label="Loading private document…" count={1} />}
        {failure && (
          <div role="alert" className="admin-error">
            <p>{failure}</p>
            <button type="button" disabled={state.isFetching} onClick={() => { setFailure(""); setRetry(value => value + 1); }}>Retry document</button>
          </div>
        )}
        {source && session !== "anonymous" && (
          <div className="admin-viewer-stage">
            {source.mime === "application/pdf" ? (
              <PdfPages
                key={source.url}
                bytes={source.bytes}
                zoom={zoom}
                page={page}
                setPage={setPage}
              />
            ) : (
              <Image
                unoptimized
                width={1000}
                height={1400}
                src={source.url}
                alt="Private verification document"
                style={{ width: `${zoom * 100}%`, height: "auto" }}
              />
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
function PdfPages({
  bytes,
  zoom,
  page,
  setPage,
}: {
  bytes: Uint8Array;
  zoom: number;
  page: number;
  setPage: (page: number) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0),
    [error, setError] = useState("");
  useEffect(() => {
    let disposed = false;
    let destroy: (() => void) | undefined;
    void (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      const task = pdfjs.getDocument({
        data: bytes.slice(),
        enableXfa: false,
        useWorkerFetch: false,
        useWasm: false,
        useSystemFonts: true,
        disableFontFace: true,
      });
      destroy = () => {
        void task.destroy();
      };
      if (disposed) {
        destroy();
        return;
      }
      const pdf = await task.promise;
      if (disposed) return;
      setCount(pdf.numPages);
      const documentPage = await pdf.getPage(page);
      if (disposed || !canvas.current) return;
      const target = canvas.current;
      const original = documentPage.getViewport({ scale: 1 });
      const available = Math.max(
        100,
        (target.parentElement?.clientWidth ?? 900) - 24,
      );
      const viewport = documentPage.getViewport({
        scale: Math.min(1.4, available / original.width) * zoom,
      });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      target.width = Math.ceil(viewport.width * ratio);
      target.height = Math.ceil(viewport.height * ratio);
      target.style.width = `${viewport.width}px`;
      target.style.height = `${viewport.height}px`;
      const render = documentPage.render({
        canvas: target,
        viewport,
        transform: [ratio, 0, 0, ratio, 0, 0],
      });
      destroy = () => {
        render.cancel();
        void task.destroy();
      };
      await render.promise;
      if (!disposed) setError("");
    })().catch((failure) => {
      if (!disposed)
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not render PDF. Use the protected download.",
        );
    });
    return () => {
      disposed = true;
      destroy?.();
    };
  }, [bytes, zoom, page]);
  return (
    <>
      <div className="admin-actions">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous page
        </button>
        <span>
          Page {page} of {count || "…"}
        </span>
        <button
          disabled={!count || page >= count}
          onClick={() => setPage(page + 1)}
        >
          Next page
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <canvas ref={canvas} aria-label={`Document page ${page}`} />
    </>
  );
}
