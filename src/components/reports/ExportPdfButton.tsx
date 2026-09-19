import { useState } from "react";
import { classNames } from "@/utils/format";
import { downloadReportPdf } from "@/utils/reportPdf";

interface ExportPdfButtonProps {
  reportId: string;
  variant?: "primary" | "ghost";
  showStatus?: boolean;
}

export function ExportPdfButton({
  reportId,
  variant = "primary",
  showStatus = true,
}: ExportPdfButtonProps) {
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">(
    "idle",
  );
  const [filename, setFilename] = useState<string | null>(null);

  async function handleExport() {
    setStatus("working");
    setFilename(null);
    try {
      const name = await downloadReportPdf(reportId);
      setFilename(name);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <button
        type="button"
        className={classNames("btn", variant === "ghost" && "btn--ghost")}
        onClick={() => {
          void handleExport();
        }}
        disabled={status === "working"}
        aria-busy={status === "working"}
      >
        {status === "working" ? "Preparing PDF…" : "Export PDF"}
      </button>
      {showStatus && status === "done" && filename ? (
        <p className="export-status" role="status">
          Downloaded {filename}
        </p>
      ) : null}
      {showStatus && status === "error" ? (
        <p className="export-status" role="alert">
          The PDF could not be created. Try again.
        </p>
      ) : null}
    </div>
  );
}
