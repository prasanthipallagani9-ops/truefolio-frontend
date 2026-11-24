import React, { useMemo, useState } from 'react';
import { AlertCircle, Eye, FilePlus2, Trash2 } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { readFileAsDataUrl, validateEvidenceFile } from '../../demo/demoStore';
import type { ActivityEvidence } from '../../types/truefolio';
import {
  EvidencePreviewModal,
  EvidenceTypeIcon,
  formatBytes,
  formatShortDate,
  LoadingRows,
  StatusText,
} from '../ui/CommonUI';

type TypeFilter = 'all' | 'image' | 'pdf' | 'text';

export function StudentEvidencePage() {
  const { db, activeProfile, isHydrating, attachEvidence, removeEvidence } = useDemo();
  const studentId = activeProfile?.id ?? '';

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [targetActivityId, setTargetActivityId] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ActivityEvidence | null>(null);

  const studentActivities = useMemo(
    () => db.activities.filter((a) => a.student_id === studentId),
    [db.activities, studentId]
  );

  const editableActivities = useMemo(
    () =>
      studentActivities.filter(
        (a) => a.status === 'draft' || a.status === 'changes_requested'
      ),
    [studentActivities]
  );

  const studentEvidence = useMemo(() => {
    return db.activity_evidence
      .filter((e) => e.student_id === studentId)
      .filter((e) => {
        if (typeFilter === 'image') return e.mime_type.startsWith('image/');
        if (typeFilter === 'pdf') return e.mime_type === 'application/pdf';
        if (typeFilter === 'text') return e.mime_type === 'text/plain';
        return true;
      })
      .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
  }, [db.activity_evidence, studentId, typeFilter]);

  if (isHydrating || !activeProfile) {
    return <LoadingRows count={3} />;
  }

  const effectiveTargetId =
    targetActivityId && editableActivities.some((a) => a.id === targetActivityId)
      ? targetActivityId
      : editableActivities[0]?.id ?? '';

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !effectiveTargetId) return;
    setUploadError(null);
    for (const file of Array.from(files)) {
      const err = validateEvidenceFile(file);
      if (err) {
        setUploadError(err);
        continue;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        await attachEvidence({
          activityId: effectiveTargetId,
          studentId,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileSize: file.size,
          previewDataUrl: dataUrl,
        });
      } catch (readErr) {
        setUploadError(
          readErr instanceof Error ? readErr.message : 'Unable to read selected file.'
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-walnut-900">
            Evidence Vault
          </h1>
          <p className="text-sm text-walnut-600 mt-1">
            Inspect uploaded certificates, lab notes, and PDFs stored locally for demo verification.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <section className="rounded-xl border border-morning-200 bg-white p-5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h2 className="text-sm font-semibold text-walnut-900">
              Add Evidence to an Editable Activity
            </h2>
            <p className="text-xs text-walnut-600">
              Accepted formats: PNG, JPG, WebP, SVG, PDF, TXT (max 2.00 MB per file). Files are stored as browser data URLs and mirrored under the <span className="font-mono">activity-evidence</span> bucket path convention.
            </p>
          </div>

          {editableActivities.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label="Target activity for evidence upload"
                value={effectiveTargetId}
                onChange={(e) => setTargetActivityId(e.target.value)}
                className="rounded-lg border border-morning-300 bg-morning-50 px-3 py-2 text-xs font-medium text-walnut-900 max-w-xs"
              >
                {editableActivities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title} ({act.status === 'changes_requested' ? 'Changes Requested' : 'Draft'})
                  </option>
                ))}
              </select>

              <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer transition-colors whitespace-nowrap">
                <FilePlus2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Choose File</span>
                <input
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.txt"
                  className="sr-only"
                  onChange={(e) => {
                    handleUpload(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          ) : (
            <span className="text-xs text-walnut-600">
              Create a draft activity or withdraw a submitted one to attach new files.
            </span>
          )}
        </div>

        {uploadError && (
          <div
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800 flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </section>

      {/* Type Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ['all', 'All Files'],
            ['image', 'Images & Certificates'],
            ['pdf', 'PDF Documents'],
            ['text', 'Text Logs'],
          ] as [TypeFilter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTypeFilter(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              typeFilter === key
                ? 'bg-walnut-900 text-white'
                : 'bg-white border border-morning-200 text-walnut-700 hover:bg-morning-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Evidence Grid */}
      {studentEvidence.length === 0 ? (
        <div className="rounded-xl border border-dashed border-morning-300 bg-white p-12 text-center">
          <p className="font-display text-lg font-semibold text-walnut-900">
            No evidence files match this view
          </p>
          <p className="text-xs text-walnut-600 mt-1">
            Select a draft or changes-requested activity above to attach certificates, photos, PDFs, or text logs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentEvidence.map((ev) => {
            const parentActivity = studentActivities.find((a) => a.id === ev.activity_id);
            const canDelete =
              parentActivity &&
              (parentActivity.status === 'draft' ||
                parentActivity.status === 'changes_requested');
            const isImg = ev.mime_type.startsWith('image/');

            return (
              <article
                key={ev.id}
                className="rounded-xl border border-morning-200 bg-white overflow-hidden flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => setPreviewItem(ev)}
                  className="h-40 w-full bg-morning-50 border-b border-morning-200 flex items-center justify-center overflow-hidden hover:opacity-95 transition-opacity"
                >
                  {isImg && ev.preview_data_url ? (
                    <img
                      src={ev.preview_data_url}
                      alt={ev.file_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-walnut-600">
                      <EvidenceTypeIcon mimeType={ev.mime_type} />
                      <span className="text-xs font-mono uppercase">
                        {ev.mime_type.split('/')[1] ?? 'file'}
                      </span>
                    </div>
                  )}
                </button>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-walnut-900 truncate">
                      {ev.file_name}
                    </p>
                    <p className="text-[11px] font-mono tabular-nums text-walnut-500 mt-0.5">
                      {formatBytes(ev.file_size)} · {formatShortDate(ev.uploaded_at)}
                    </p>
                    {parentActivity && (
                      <div className="mt-2.5 pt-2.5 border-t border-morning-100 space-y-1">
                        <p className="text-xs font-medium text-walnut-800 truncate">
                          {parentActivity.title}
                        </p>
                        <StatusText status={parentActivity.status} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(ev)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      Preview File
                    </button>

                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => removeEvidence(ev.id)}
                        className="inline-flex items-center gap-1 text-xs text-red-700 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Remove
                      </button>
                    ) : (
                      <span className="text-[11px] text-walnut-500">Locked</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <EvidencePreviewModal evidence={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
}
