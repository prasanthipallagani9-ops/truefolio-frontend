import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileCode2,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react';
import type { ActivityEvidence, ActivityStatus } from '../../types/truefolio';

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const STATUS_META: Record<
  ActivityStatus,
  { label: string; textClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  draft: {
    label: 'Draft',
    textClass: 'text-walnut-600',
    icon: FileText,
  },
  submitted: {
    label: 'Pending Review',
    textClass: 'text-amber-700',
    icon: Clock,
  },
  changes_requested: {
    label: 'Changes Requested',
    textClass: 'text-orange-700',
    icon: RotateCcw,
  },
  approved: {
    label: 'Approved',
    textClass: 'text-emerald-800',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    textClass: 'text-red-800',
    icon: XCircle,
  },
};

/**
 * Unboxed semantic status indicator: icon + explicit label text, zero pill capsules.
 */
export function StatusText({ status }: { status: ActivityStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${meta.textClass}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}

export function ProfileAvatar({
  src,
  name,
  sizeClass = 'h-11 w-11',
}: {
  src?: string;
  name: string;
  sizeClass?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  if (!src || failed) {
    return (
      <div
        className={`${sizeClass} shrink-0 rounded-lg bg-morning-100 border border-morning-200 flex items-center justify-center font-display font-semibold text-walnut-800`}
        aria-label={name}
      >
        {initials || 'TF'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${sizeClass} shrink-0 rounded-lg object-cover border border-morning-200 bg-morning-100`}
    />
  );
}

export function EvidenceTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="h-4 w-4 text-red-700 shrink-0" aria-hidden="true" />;
  }
  return <FileCode2 className="h-4 w-4 text-walnut-700 shrink-0" aria-hidden="true" />;
}

export function EvidencePreviewModal({
  evidence,
  onClose,
}: {
  evidence: ActivityEvidence | null;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!evidence) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [evidence, onClose]);

  if (!evidence) return null;

  const isImage = evidence.mime_type.startsWith('image/');
  const isPdf = evidence.mime_type === 'application/pdf';
  const isText = evidence.mime_type === 'text/plain';

  let decodedText = '';
  if (isText && evidence.preview_data_url) {
    try {
      const [, payload = ''] = evidence.preview_data_url.split(',');
      if (evidence.preview_data_url.includes(';base64,')) {
        decodedText = atob(payload);
      } else {
        decodedText = decodeURIComponent(payload);
      }
    } catch {
      decodedText = 'Unable to decode text file preview.';
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-walnut-950/60 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl bg-white border border-morning-200 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-morning-200 bg-morning-50">
          <div className="min-w-0">
            <h3
              id="evidence-modal-title"
              className="font-display text-lg font-semibold text-walnut-900 truncate"
            >
              {evidence.file_name}
            </h3>
            <p className="text-xs text-walnut-600 font-mono tabular-nums mt-0.5 truncate">
              {evidence.mime_type} · {formatBytes(evidence.file_size)} · Uploaded{' '}
              {formatShortDate(evidence.uploaded_at)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {evidence.preview_data_url && (
              <a
                href={evidence.preview_data_url}
                download={evidence.file_name}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-walnut-800 bg-white border border-morning-300 rounded-lg hover:bg-morning-100 transition-colors whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="p-2 rounded-lg text-walnut-700 hover:bg-morning-200 transition-colors focus-visible:outline-2 focus-visible:outline-amber-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-auto bg-morning-50/60 flex-1 min-h-[280px] flex items-center justify-center">
          {!evidence.preview_data_url ? (
            <div className="text-center max-w-md py-10">
              <AlertCircle className="h-8 w-8 text-amber-700 mx-auto mb-2" />
              <p className="text-sm font-medium text-walnut-900">
                Local preview unavailable for this file
              </p>
              <p className="text-xs text-walnut-600 mt-1">
                Storage path reference: <span className="font-mono">{evidence.file_path}</span>
              </p>
            </div>
          ) : isImage ? (
            <img
              src={evidence.preview_data_url}
              alt={evidence.file_name}
              className="max-h-[65vh] w-auto rounded-lg border border-morning-200 bg-white object-contain"
            />
          ) : isPdf ? (
            <iframe
              src={evidence.preview_data_url}
              title={evidence.file_name}
              className="w-full h-[62vh] rounded-lg border border-morning-200 bg-white"
            />
          ) : isText ? (
            <pre className="w-full max-h-[62vh] overflow-auto rounded-lg border border-morning-200 bg-white p-4 text-xs font-mono text-walnut-900 whitespace-pre-wrap leading-relaxed">
              {decodedText}
            </pre>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-walnut-800">
                Preview not supported inline for {evidence.mime_type}. Use Download above to inspect.
              </p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-morning-200 bg-white text-xs text-walnut-600 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono truncate">Bucket path: {evidence.file_path}</span>
          <span>Local browser preview only (not uploaded to remote storage)</span>
        </div>
      </div>
    </div>
  );
}

export function LoadingRows({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading records">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="h-20 rounded-xl border border-morning-200 bg-white p-4 animate-pulse flex items-center justify-between gap-4"
        >
          <div className="space-y-2 flex-1">
            <div className="h-4 w-48 bg-morning-100 rounded" />
            <div className="h-3 w-72 bg-morning-100 rounded" />
          </div>
          <div className="h-4 w-24 bg-morning-100 rounded" />
        </div>
      ))}
    </div>
  );
}
