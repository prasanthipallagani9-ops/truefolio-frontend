import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Eye,
  FilePlus2,
  Lock,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import {
  ACTIVITY_CATEGORIES,
  readFileAsDataUrl,
  validateEvidenceFile,
} from '../../demo/demoStore';
import type {
  Activity,
  ActivityCategory,
  ActivityEvidence,
  ActivityStatus,
} from '../../types/truefolio';
import {
  EvidencePreviewModal,
  EvidenceTypeIcon,
  formatBytes,
  formatShortDate,
  LoadingRows,
  StatusText,
} from '../ui/CommonUI';

type StatusFilter = 'all' | ActivityStatus;

interface ActivityFormState {
  id?: string;
  title: string;
  category: ActivityCategory;
  organization: string;
  activity_date: string;
  hours: string;
  credits: string;
  description: string;
  outcomes: string;
  status: ActivityStatus;
}

const EMPTY_FORM: ActivityFormState = {
  title: '',
  category: 'Research',
  organization: '',
  activity_date: new Date().toISOString().slice(0, 10),
  hours: '12',
  credits: '0.5',
  description: '',
  outcomes: '',
  status: 'draft',
};

export function StudentActivitiesPage() {
  const {
    db,
    activeProfile,
    isHydrating,
    isBusy,
    saveActivity,
    submitActivityForReview,
    withdrawActivityToDraft,
    deleteActivity,
    attachEvidence,
    removeEvidence,
  } = useDemo();

  const studentId = activeProfile?.id ?? '';

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<ActivityFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ActivityFormState, string>>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<
    { fileName: string; mimeType: string; fileSize: number; previewDataUrl: string }[]
  >([]);
  const [previewEvidence, setPreviewEvidence] = useState<ActivityEvidence | null>(null);

  const studentActivities = useMemo(
    () =>
      db.activities
        .filter((a) => a.student_id === studentId)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    [db.activities, studentId]
  );

  const filteredActivities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return studentActivities.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (q) {
        const match =
          a.title.toLowerCase().includes(q) ||
          a.organization.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [studentActivities, statusFilter, categoryFilter, searchQuery]);

  const selectedActivity = useMemo(() => {
    if (!selectedActivityId) return filteredActivities[0] ?? null;
    return (
      filteredActivities.find((a) => a.id === selectedActivityId) ??
      studentActivities.find((a) => a.id === selectedActivityId) ??
      filteredActivities[0] ??
      null
    );
  }, [selectedActivityId, filteredActivities, studentActivities]);

  const evidenceForSelected = useMemo(() => {
    if (!selectedActivity) return [];
    return db.activity_evidence.filter((e) => e.activity_id === selectedActivity.id);
  }, [db.activity_evidence, selectedActivity]);

  const reviewsForSelected = useMemo(() => {
    if (!selectedActivity) return [];
    return db.activity_reviews
      .filter((r) => r.activity_id === selectedActivity.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [db.activity_reviews, selectedActivity]);

  if (isHydrating || !activeProfile) {
    return <LoadingRows count={4} />;
  }

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setUploadError(null);
    setPendingAttachments([]);
    setEditorOpen(true);
  };

  const openEditModal = (activity: Activity) => {
    setForm({
      id: activity.id,
      title: activity.title,
      category: activity.category,
      organization: activity.organization,
      activity_date: activity.activity_date,
      hours: String(activity.hours),
      credits: String(activity.credits),
      description: activity.description,
      outcomes: activity.outcomes,
      status: activity.status,
    });
    setFormErrors({});
    setUploadError(null);
    setPendingAttachments([]);
    setEditorOpen(true);
  };

  const validateForm = (): boolean => {
    const errs: Partial<Record<keyof ActivityFormState, string>> = {};
    if (!form.title.trim()) errs.title = 'Activity title is required.';
    if (!form.organization.trim()) errs.organization = 'Organization or lab name is required.';
    if (!form.activity_date) errs.activity_date = 'Activity date is required.';
    const hoursNum = Number(form.hours);
    if (Number.isNaN(hoursNum) || hoursNum <= 0) {
      errs.hours = 'Enter hours greater than 0.';
    }
    const creditsNum = Number(form.credits);
    if (Number.isNaN(creditsNum) || creditsNum < 0 || creditsNum > 10) {
      errs.credits = 'Credits must be between 0 and 10.';
    }
    if (!form.description.trim() || form.description.trim().length < 15) {
      errs.description = 'Provide a clear description (at least 15 characters).';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveForm = async (submitImmediately: boolean) => {
    if (!validateForm()) return;

    const saved = await saveActivity(
      {
        id: form.id,
        student_id: studentId,
        title: form.title.trim(),
        category: form.category,
        organization: form.organization.trim(),
        activity_date: form.activity_date,
        hours: Number(form.hours),
        credits: Number(form.credits),
        description: form.description.trim(),
        outcomes: form.outcomes.trim(),
        status: form.status === 'changes_requested' && !submitImmediately ? 'draft' : form.status,
        submitted_at: null,
        reviewed_at: null,
      },
      submitImmediately
    );

    if (saved) {
      for (const att of pendingAttachments) {
        await attachEvidence({
          activityId: saved.id,
          studentId,
          fileName: att.fileName,
          mimeType: att.mimeType,
          fileSize: att.fileSize,
          previewDataUrl: att.previewDataUrl,
        });
      }
      setEditorOpen(false);
      setPendingAttachments([]);
      setSelectedActivityId(saved.id);
    }
  };

  const handleFileSelection = async (
    files: FileList | null,
    targetActivityId?: string
  ) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    for (const file of Array.from(files)) {
      const validationMessage = validateEvidenceFile(file);
      if (validationMessage) {
        setUploadError(validationMessage);
        continue;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const mimeType = file.type || 'application/octet-stream';
        if (targetActivityId) {
          await attachEvidence({
            activityId: targetActivityId,
            studentId,
            fileName: file.name,
            mimeType,
            fileSize: file.size,
            previewDataUrl: dataUrl,
          });
        } else {
          setPendingAttachments((prev) => [
            ...prev,
            {
              fileName: file.name,
              mimeType,
              fileSize: file.size,
              previewDataUrl: dataUrl,
            },
          ]);
        }
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Unable to read selected file.');
      }
    }
  };

  const statusTabs: { id: StatusFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: studentActivities.length },
    {
      id: 'draft',
      label: 'Drafts',
      count: studentActivities.filter((a) => a.status === 'draft').length,
    },
    {
      id: 'submitted',
      label: 'Pending',
      count: studentActivities.filter((a) => a.status === 'submitted').length,
    },
    {
      id: 'changes_requested',
      label: 'Changes Requested',
      count: studentActivities.filter((a) => a.status === 'changes_requested').length,
    },
    {
      id: 'approved',
      label: 'Approved',
      count: studentActivities.filter((a) => a.status === 'approved').length,
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: studentActivities.filter((a) => a.status === 'rejected').length,
    },
  ];

  const isSelectedEditable =
    selectedActivity &&
    (selectedActivity.status === 'draft' || selectedActivity.status === 'changes_requested');

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-walnut-900">
            Activity Ledger
          </h1>
          <p className="text-sm text-walnut-600 mt-1">
            Draft experiential records, attach local evidence files, and submit for faculty approval.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Activity
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-xl border border-morning-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-walnut-900 text-white'
                    : 'bg-morning-50 text-walnut-700 hover:bg-morning-100 border border-morning-200'
                }`}
              >
                {tab.label}{' '}
                <span className="font-mono tabular-nums opacity-80">({tab.count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="relative flex-1">
            <Search
              className="h-4 w-4 text-walnut-500 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, organization, or description..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-morning-300 bg-morning-50/50 text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
            />
          </label>

          <select
            aria-label="Filter by activity category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-morning-300 bg-morning-50/50 px-3 py-2 text-xs font-medium text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            <option value="all">All Categories</option>
            {ACTIVITY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split: Activity List + Detail Inspector */}
      {filteredActivities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-morning-300 bg-white p-12 text-center">
          <p className="font-display text-lg font-semibold text-walnut-900">
            No matching activities found
          </p>
          <p className="text-xs text-walnut-600 mt-1 max-w-md mx-auto">
            {studentActivities.length === 0
              ? 'You have not logged any activities yet. Create your first draft to begin.'
              : 'No activities match your current search or filter selection.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {studentActivities.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-medium text-walnut-800 bg-morning-100 hover:bg-morning-200 rounded-lg"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
            >
              Create Activity
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List */}
          <div className="lg:col-span-5 space-y-2.5">
            {filteredActivities.map((act) => {
              const isSelected = selectedActivity?.id === act.id;
              const evCount = db.activity_evidence.filter(
                (e) => e.activity_id === act.id
              ).length;

              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => {
                    setSelectedActivityId(act.id);
                    setConfirmDeleteId(null);
                    setUploadError(null);
                  }}
                  className={`w-full text-left rounded-xl border p-4 transition-colors focus-visible:outline-2 focus-visible:outline-amber-600 ${
                    isSelected
                      ? 'bg-white border-amber-600 shadow-xs'
                      : 'bg-white border-morning-200 hover:border-morning-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-walnut-900 leading-snug">
                      {act.title}
                    </h3>
                  </div>
                  <p className="text-xs text-walnut-600 mt-1 font-mono tabular-nums">
                    {act.category} · {act.hours} hrs · {act.credits.toFixed(1)} cr
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
                    <StatusText status={act.status} />
                    <span className="text-walnut-500 font-mono tabular-nums">
                      {evCount} {evCount === 1 ? 'file' : 'files'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Activity Inspector */}
          {selectedActivity && (
            <div className="lg:col-span-7 rounded-xl border border-morning-200 bg-white p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-morning-200">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-walnut-600 font-mono tabular-nums">
                    <span>{selectedActivity.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatShortDate(selectedActivity.activity_date)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedActivity.hours} hrs</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedActivity.credits.toFixed(1)} credits</span>
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-walnut-900 mt-1.5">
                    {selectedActivity.title}
                  </h2>
                  <p className="text-sm text-walnut-700 mt-0.5">
                    {selectedActivity.organization}
                  </p>
                </div>

                <StatusText status={selectedActivity.status} />
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {isSelectedEditable ? (
                  <>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => openEditModal(selectedActivity)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-walnut-900 bg-morning-100 hover:bg-morning-200 rounded-lg transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => submitActivityForReview(selectedActivity.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      {selectedActivity.status === 'changes_requested'
                        ? 'Resubmit for Review'
                        : 'Submit for Review'}
                    </button>
                  </>
                ) : selectedActivity.status === 'submitted' ? (
                  <>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => withdrawActivityToDraft(selectedActivity.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-walnut-900 bg-morning-100 hover:bg-morning-200 rounded-lg transition-colors"
                    >
                      <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Withdraw to Draft
                    </button>
                    <span className="inline-flex items-center gap-1.5 text-xs text-walnut-600">
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                      Withdraw to Draft if you need to edit before review.
                    </span>
                  </>
                ) : selectedActivity.status === 'approved' ? (
                  <button
                    type="button"
                    disabled
                    title="Verified records are locked after faculty approval"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-walnut-500 bg-morning-100 rounded-lg cursor-not-allowed"
                  >
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    Locked (Verified by Faculty)
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => openEditModal(selectedActivity)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-walnut-900 bg-morning-100 hover:bg-morning-200 rounded-lg transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Revise &amp; Redraft
                  </button>
                )}

                {selectedActivity.status !== 'approved' && (
                  <>
                    {confirmDeleteId === selectedActivity.id ? (
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-red-800 font-medium">Confirm delete?</span>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={async () => {
                            await deleteActivity(selectedActivity.id);
                            setConfirmDeleteId(null);
                            setSelectedActivityId(null);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg"
                        >
                          Yes, Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1.5 text-xs font-medium text-walnut-700 bg-morning-100 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(selectedActivity.id)}
                        className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Description & Outcomes */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-walnut-600 uppercase tracking-wider">
                    Activity Description
                  </h3>
                  <p className="mt-1.5 text-sm text-walnut-800 leading-relaxed whitespace-pre-line">
                    {selectedActivity.description}
                  </p>
                </div>

                {selectedActivity.outcomes && (
                  <div>
                    <h3 className="text-xs font-semibold text-walnut-600 uppercase tracking-wider">
                      Measurable Outcomes &amp; Deliverables
                    </h3>
                    <p className="mt-1.5 text-sm text-walnut-800 leading-relaxed whitespace-pre-line">
                      {selectedActivity.outcomes}
                    </p>
                  </div>
                )}
              </div>

              {/* Supporting Evidence Section */}
              <div className="pt-5 border-t border-morning-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-walnut-900">
                      Supporting Evidence ({evidenceForSelected.length})
                    </h3>
                    <p className="text-xs text-walnut-600">
                      PNG, JPG, WebP, SVG, PDF, or TXT up to 2.00 MB per file (stored locally).
                    </p>
                  </div>

                  {isSelectedEditable ? (
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-walnut-900 bg-morning-100 hover:bg-morning-200 border border-morning-300 rounded-lg cursor-pointer transition-colors">
                      <FilePlus2 className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
                      <span>Attach File</span>
                      <input
                        type="file"
                        multiple
                        accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.txt"
                        className="sr-only"
                        onChange={(e) => {
                          handleFileSelection(e.target.files, selectedActivity.id);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  ) : (
                    <span className="text-[11px] text-walnut-500">
                      Attachments locked while {selectedActivity.status.replace('_', ' ')}
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

                {evidenceForSelected.length === 0 ? (
                  <p className="text-xs text-walnut-600 py-3 px-4 rounded-lg bg-morning-50 border border-morning-200">
                    No evidence attached yet. Attach a certificate, report, or log note before submitting for review.
                  </p>
                ) : (
                  <div className="divide-y divide-morning-200 rounded-lg border border-morning-200">
                    {evidenceForSelected.map((ev) => (
                      <div
                        key={ev.id}
                        className="px-3.5 py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <EvidenceTypeIcon mimeType={ev.mime_type} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-walnut-900 truncate">
                              {ev.file_name}
                            </p>
                            <p className="text-[11px] font-mono tabular-nums text-walnut-500">
                              {formatBytes(ev.file_size)} · {formatShortDate(ev.uploaded_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewEvidence(ev)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-50 rounded"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            Preview
                          </button>
                          {isSelectedEditable && (
                            <button
                              type="button"
                              onClick={() => removeEvidence(ev.id)}
                              aria-label={`Remove ${ev.file_name}`}
                              className="p-1 text-walnut-500 hover:text-red-700 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Faculty Review History */}
              <div className="pt-5 border-t border-morning-200 space-y-3">
                <h3 className="text-sm font-semibold text-walnut-900">
                  Faculty Review History ({reviewsForSelected.length})
                </h3>
                {reviewsForSelected.length === 0 ? (
                  <p className="text-xs text-walnut-600">
                    No faculty reviews recorded yet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {reviewsForSelected.map((rev) => {
                      const reviewer = db.profiles.find((p) => p.id === rev.reviewer_id);
                      return (
                        <div
                          key={rev.id}
                          className="rounded-lg border border-morning-200 bg-morning-50/60 p-3.5 space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <StatusText status={rev.decision} />
                            <span className="text-[11px] font-mono tabular-nums text-walnut-600">
                              {reviewer?.full_name ?? 'Faculty Reviewer'} ·{' '}
                              {formatShortDate(rev.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-walnut-800 leading-relaxed">
                            {rev.feedback}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Create / Edit Modal */}
      {editorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-walnut-950/60 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-editor-title"
        >
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-xl bg-white border border-morning-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-morning-200 bg-morning-50">
              <h2
                id="activity-editor-title"
                className="font-display text-xl font-semibold text-walnut-900"
              >
                {form.id ? 'Edit Activity Record' : 'Log New Activity'}
              </h2>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                aria-label="Close editor"
                className="p-1.5 rounded-lg text-walnut-700 hover:bg-morning-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <label className="block">
                <span className="block text-xs font-semibold text-walnut-800 mb-1">
                  Activity Title *
                </span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Campus Microgrid Load Balancing Study"
                  className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                />
                {formErrors.title && (
                  <span className="mt-1 block text-xs text-red-700">{formErrors.title}</span>
                )}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-walnut-800 mb-1">
                    Category *
                  </span>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value as ActivityCategory }))
                    }
                    className="w-full rounded-lg border border-morning-300 bg-white px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                  >
                    {ACTIVITY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block text-xs font-semibold text-walnut-800 mb-1">
                    Organization / Host Lab *
                  </span>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                    placeholder="e.g., Department Systems Lab"
                    className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                  />
                  {formErrors.organization && (
                    <span className="mt-1 block text-xs text-red-700">
                      {formErrors.organization}
                    </span>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-walnut-800 mb-1">
                    Completion Date *
                  </span>
                  <input
                    type="date"
                    value={form.activity_date}
                    onChange={(e) => setForm((f) => ({ ...f, activity_date: e.target.value }))}
                    className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm font-mono text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                  />
                  {formErrors.activity_date && (
                    <span className="mt-1 block text-xs text-red-700">
                      {formErrors.activity_date}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="block text-xs font-semibold text-walnut-800 mb-1">
                    Hours Logged *
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.hours}
                    onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                    className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm font-mono text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                  />
                  {formErrors.hours && (
                    <span className="mt-1 block text-xs text-red-700">{formErrors.hours}</span>
                  )}
                </label>

                <label className="block">
                  <span className="block text-xs font-semibold text-walnut-800 mb-1">
                    Requested Credits *
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={form.credits}
                    onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))}
                    className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm font-mono text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                  />
                  {formErrors.credits && (
                    <span className="mt-1 block text-xs text-red-700">{formErrors.credits}</span>
                  )}
                </label>
              </div>

              <label className="block">
                <span className="block text-xs font-semibold text-walnut-800 mb-1">
                  Detailed Description *
                </span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe your responsibilities, methods, and scope..."
                  className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                />
                {formErrors.description && (
                  <span className="mt-1 block text-xs text-red-700">
                    {formErrors.description}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-walnut-800 mb-1">
                  Key Outcomes &amp; Impact
                </span>
                <textarea
                  rows={2}
                  value={form.outcomes}
                  onChange={(e) => setForm((f) => ({ ...f, outcomes: e.target.value }))}
                  placeholder="Quantifiable results, artifacts produced, or recognition earned..."
                  className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                />
              </label>

              {/* Inline local evidence attachment for new/edited activities */}
              <div className="rounded-lg border border-morning-200 bg-morning-50 p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-walnut-900">
                      Attach Local Evidence (Optional)
                    </p>
                    <p className="text-[11px] text-walnut-600">
                      PNG, JPG, WebP, SVG, PDF, or TXT · Max 2.00 MB per file
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-walnut-900 bg-white border border-morning-300 rounded-lg cursor-pointer hover:bg-morning-100">
                    <FilePlus2 className="h-3.5 w-3.5 text-amber-700" />
                    <span>Select File</span>
                    <input
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.txt"
                      className="sr-only"
                      onChange={(e) => {
                        handleFileSelection(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-700 font-medium">{uploadError}</p>
                )}

                {pendingAttachments.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {pendingAttachments.map((att, idx) => (
                      <li
                        key={`${att.fileName}-${idx}`}
                        className="flex items-center justify-between text-xs bg-white border border-morning-200 rounded px-3 py-1.5"
                      >
                        <span className="truncate font-medium text-walnut-900">
                          {att.fileName}{' '}
                          <span className="font-mono text-walnut-500">
                            ({formatBytes(att.fileSize)})
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAttachments((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-walnut-500 hover:text-red-700 ml-2"
                          aria-label={`Remove ${att.fileName}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-morning-200 bg-morning-50 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                disabled={isBusy}
                className="px-4 py-2 text-xs font-medium text-walnut-800 bg-white border border-morning-300 hover:bg-morning-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveForm(false)}
                disabled={isBusy}
                className="px-4 py-2 text-xs font-semibold text-walnut-900 bg-morning-200 hover:bg-morning-300 rounded-lg"
              >
                {isBusy ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveForm(true)}
                disabled={isBusy}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                <Send className="h-3.5 w-3.5" />
                {isBusy ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <EvidencePreviewModal
        evidence={previewEvidence}
        onClose={() => setPreviewEvidence(null)}
      />
    </div>
  );
}
