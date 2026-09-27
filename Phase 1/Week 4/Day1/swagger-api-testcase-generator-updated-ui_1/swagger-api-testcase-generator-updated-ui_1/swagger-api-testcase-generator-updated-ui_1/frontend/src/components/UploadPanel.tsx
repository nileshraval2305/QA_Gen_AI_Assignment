import { useRef, useState } from "react";

export function UploadPanel({
  busy,
  onUpload,
  onUploadFromUrl,
  onClear,
  visible
}: {
  busy: boolean;
  onUpload: (file: File) => void;
  onUploadFromUrl: (swaggerUrl: string) => void;
  onClear: () => void;
  visible: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [sourceMode, setSourceMode] = useState<"file" | "url">("file");
  const [swaggerUrl, setSwaggerUrl] = useState("");

  const accept = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onUpload(file);
  };

  const submitUrl = () => {
    const trimmed = swaggerUrl.trim();
    if (trimmed) onUploadFromUrl(trimmed);
  };

  return (
    <section className="card upload-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Step 1</span>
          <h2>Upload <mark className="hl hl-green">Swagger</mark> specification</h2>
          <p>Choose a Swagger source, then provide either a URL or a local file.</p>
        </div>
        {visible && <button className="button ghost" type="button" onClick={onClear}>Clear</button>}
      </div>
      <div className="source-toggle" role="radiogroup" aria-label="Swagger source selection">
        <label className="source-option">
          <input type="radio" name="swagger-source" value="file" checked={sourceMode === "file"} onChange={() => setSourceMode("file")} />
          <span>Generate test case from file</span>
        </label>
        <label className="source-option">
          <input type="radio" name="swagger-source" value="url" checked={sourceMode === "url"} onChange={() => setSourceMode("url")} />
          <span>Generate test case from URL</span>
        </label>
      </div>

      {sourceMode === "file" && (
        <button
          type="button"
          className={`drop-zone ${dragging ? "dragging" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); accept(event.dataTransfer.files); }}
          disabled={busy}
        >
          <span className="upload-icon" aria-hidden="true">↑</span>
          <strong>{busy ? "Processing specification…" : "Drop your Swagger file here"}</strong>
          <span>or click to browse</span>
          <small>Maximum 5 MB · .yaml · .yml · .json</small>
        </button>
      )}

      {sourceMode === "url" && (
        <div className="url-panel">
          <label className="url-field">
            <span>Swagger URL</span>
            <input
              type="url"
              placeholder="https://example.com/openapi.yaml"
              value={swaggerUrl}
              onChange={(event) => setSwaggerUrl(event.target.value)}
              disabled={busy}
            />
          </label>
          <div className="url-actions">
            <button className="button primary" type="button" onClick={submitUrl} disabled={busy || !swaggerUrl.trim()}>
              {busy ? "Loading…" : "Load Swagger URL"}
            </button>
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept=".yaml,.yml,.json,application/json,application/yaml" hidden onChange={(e) => accept(e.target.files)} />
    </section>
  );
}
