import { useEffect, useState } from "react";
import type { TemplateManifest } from "@/types";

interface Props {
  onSelect: (fileUrl: string, unit?: { scale: number; label: string }) => void;
}

export function TemplateSelector({ onSelect }: Props) {
  const [templates, setTemplates] = useState<TemplateManifest["templates"]>([]);

  useEffect(() => {
    const basePath = import.meta.env.BASE_URL;
    fetch(`${basePath}templates/manifest.json`)
      .then((res) => res.json())
      .then((data: TemplateManifest) => setTemplates(data.templates))
      .catch(() => setTemplates([]));
  }, []);

  if (templates.length === 0) return null;

  const basePath = import.meta.env.BASE_URL;

  return (
    <div className="mt-4">
      <div className="mb-2 text-xs text-text-dim">テンプレート</div>
      <div className="flex gap-2">
        {templates.map((t) => (
          <button
            key={t.file}
            type="button"
            className="rounded-sm border border-border bg-surface-hover px-3 py-1.5 text-sm text-text hover:bg-accent hover:text-white transition-colors"
            onClick={() => onSelect(`${basePath}templates/${t.file}`, t.unit)}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
