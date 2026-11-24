import React, { useMemo, useState } from 'react';
import { CheckCircle2, Eye, RotateCcw, Search, XCircle } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import type { ActivityEvidence, ActivityStatus, ReviewDecision } from '../../types/truefolio';
import {
  EvidencePreviewModal,
  EvidenceTypeIcon,
  formatBytes,
  formatShortDate,
  LoadingRows,
  ProfileAvatar,
  StatusText,
} from '../ui/CommonUI';

type QueueFilter = 'submitted' | 'changes_requested' | 'approved' | 'rejected' | 'all';

export function FacultyReviewQueuePage() {
  const { db, assignedStudents, isHydrating, isBusy, reviewActivity, navigate } = useDemo();

  const [statusFilter, setStatusFilter] = useState<QueueFilter>('submitted');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [previewEvidence, setPreviewEvidence] = useState<ActivityEvidence | null>(null);

  const assignedIds = useMemo(
    () => new Set(assignedStudents.map((s) => s.id)),
    [assignedStudents]
  );

  const cohortActivities = useMemo(
    () =>
      db.activities
        .filter((a) => assignedIds.has(a.student_id) && a.status !== 'draft')
        .sort((a, b) =>
          (b.submitted_at ?? b.updated_at).localeCompare(a.submitted_at ?? a.updated_at)
        ),
    [db.activities, assignedIds]
  );

  const filteredQueue = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return cohortActivities.filter((act) => {
      if (statusFilter !== 'all' && act.status !== statusFilter) return false;
      if (studentFilter !== 'all' && act.student_id !== studentFilter) return false;
      if (q) {
        const stu = assignedStudents.find((s) => s.id === act.student_id);
        const match =
          act.title.toLowerCase().includes(q) ||
          act.organization.toLowerCase().includes(q) ||
          (stu?.full_name.toLowerCase().includes(q) ?? false);
        if (!match) return false;
      }
      return true;
    });
  }, [cohortActivities, statusFilter, studentFilter, searchQuery, assignedStudents]);

  const selectedActivity = useMemo(() => {
    if (filteredQueue.length === 0) return null;
    if (!selectedActivityId) return filteredQueue[0];
    return filteredQueue.find((a) => a.id === selectedActivityId) ?? filteredQueue[0];
  }, [filteredQueue, selectedActivityId]);

  const selectedStudent = useMemo(() => {
    if (!selectedActivity) return null;
    return assignedStudents.find((s) => s.id === selectedActivity.student_id) ?? null;
  }, [assignedStudents, selectedActivity]);

  const evidenceList = useMemo(() => {
    if (!selectedActivity) return [];
    return db.activity_evidence.filter((e) => e.activity_id === selectedActivity.id);
  }, [db.activity_evidence, selectedActivity]);

  const reviewHistory = useMemo(() => {
    if (!selectedActivity) return [];
    return db.activity_reviews
      .filter((r) => r.activity_id === selectedActivity.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [db.activity_reviews, selectedActivity]);

  if (isHydrating) {
    return <LoadingRows count={4} />;
  }

  const handleDecision = async (decision: ReviewDecision) => {
    if (!selectedActivity) return;
    const trimmed = feedback.trim();
    if ((decision === 'changes_requested' || decision === 'rejected') && trimmed.length < 10) {
      setFeedbackError(
        'Please provide constructive feedback (at least 10 characters) when requesting changes or rejecting.'
      );
      return;
    }

    setFeedbackError(null);
    const defaultApproveNote = 'Verified submitted details and supporting evidence. Approved for credit.';
    const ok = await reviewActivity({
      activityId: selectedActivity.id,
      decision,
      feedback: trimmed || defaultApproveNote,
    });

    if (ok) {
      setFeedback('');
    }
  };

  const tabs: { id: QueueFilter; label: string; count: number }[] = [
    {
      id: 'submitted',
      label: 'Pending Review',
      count: cohortActivities.filter((a) => a.status === 'submitted').length,
    },
    {
      id: 'changes_requested',
      label: 'Changes Requested',
      count: cohortActivities.filter((a) => a.status === 'changes_requested').length,
    },
    {
      id: 'approved',
      label: 'Approved',
      count: cohortActivities.filter((a) => a.status === 'approved').length,
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: cohortActivities.filter((a) => a.status === 'rejected').length,
    },
    { id: 'all', label: 'All Submissions', count: cohortActivities.length },
  ];

  const canActOnSelected =
    selectedActivity &&
    (selectedActivity.status === 'submitted' || selectedActivity.status === 'changes_requested');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-walnut-900">
          Faculty Review Queue
        </h1>
        <p className="text-sm text-walnut-600 mt-1">
          Inspect evidence and issue verification decisions across your assigned student cohort.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-morning-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-walnut-900 text-white'
                  : 'bg-morning-50 text-walnut-700 hover:bg-morning-100 border border-morning-200'
              }`}
            >
              {tab.label}{' '}
              <span className="font-mono tabular-nums opacity-80">({tab.count})</span>
            </button>
          ))}
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
              placeholder="Search by student name, activity title, or organization..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-morning-300 bg-morning-50/50 text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
            />
          </label>

          <select
            aria-label="Filter queue by assigned student"
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="rounded-lg border border-morning-300 bg-morning-50/50 px-3 py-2 text-xs font-medium text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            <option value="all">All Assigned Students</option>
            {assignedStudents.map((stu) => (
              <option key={stu.id} value={stu.id}>
                {stu.full_name} ({stu.roll_number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredQueue.length === 0 ? (
        <div className="rounded-xl border border-dashed border-morning-300 bg-white p-12 text-center">
          <p className="font-display text-lg font-semibold text-walnut-900">
            No submissions in this queue view
          </p>
          <p className="text-xs text-walnut-600 mt-1">
            {statusFilter === 'submitted'
              ? 'All pending student submissions have been processed. Switch tabs to inspect past reviews.'
              : 'Try clearing your search or student filter.'}
          </p>
          {statusFilter !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setStudentFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-xs font-medium text-walnut-800 bg-morning-100 hover:bg-morning-200 rounded-lg"
            >
              Show All Submissions
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Submission Queue List */}
          <div className="lg:col-span-5 space-y-2.5">
            {filteredQueue.map((act) => {
              const stu = assignedStudents.find((s) => s.id === act.student_id);
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
                    setFeedback('');
                    setFeedbackError(null);
                  }}
                  className={`w-full text-left rounded-xl border p-4 transition-colors ${
                    isSelected
                      ? 'bg-white border-amber-600 shadow-xs'
                      : 'bg-white border-morning-200 hover:border-morning-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-walnut-600 mb-1">
                    <span className="font-semibold text-walnut-800 truncate">
                      {stu?.full_name ?? 'Student'}
                    </span>
                    <span className="font-mono tabular-nums shrink-0">
                      {formatShortDate(act.submitted_at ?? act.updated_at)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-walnut-900 leading-snug">
                    {act.title}
                  </h3>
                  <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
                    <StatusText status={act.status as ActivityStatus} />
                    <span className="font-mono tabular-nums text-walnut-500">
                      {act.hours} hrs · {act.credits.toFixed(1)} cr · {evCount} files
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Review Workspace */}
          {selectedActivity && (
            <div className="lg:col-span-7 rounded-xl border border-morning-200 bg-white p-6 space-y-6">
              {/* Student Header */}
              {selectedStudent && (
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-morning-200">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      src={selectedStudent.avatar_url}
                      name={selectedStudent.full_name}
                      sizeClass="h-11 w-11 text-sm"
                    />
                    <div>
                      <p className="text-sm font-semibold text-walnut-900">
                        {selectedStudent.full_name}
                      </p>
                      <p className="text-xs font-mono text-walnut-600">
                        {selectedStudent.roll_number} · {selectedStudent.department}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        view: 'faculty',
                        page: 'student-detail',
                        studentId: selectedStudent.id,
                      })
                    }
                    className="text-xs font-semibold text-amber-800 hover:underline"
                  >
                    Open Student Dossier
                  </button>
                </div>
              )}

              {/* Activity Info */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-mono tabular-nums text-walnut-600">
                    {selectedActivity.category} · {selectedActivity.organization} ·{' '}
                    {selectedActivity.hours} hrs · {selectedActivity.credits.toFixed(1)} credits
                  </p>
                  <StatusText status={selectedActivity.status} />
                </div>
                <h2 className="font-display text-2xl font-semibold text-walnut-900 mt-1.5">
                  {selectedActivity.title}
                </h2>
                <p className="mt-3 text-sm text-walnut-800 leading-relaxed whitespace-pre-line">
                  {selectedActivity.description}
                </p>
                {selectedActivity.outcomes && (
                  <div className="mt-3 rounded-lg bg-morning-50 border border-morning-200 p-3.5">
                    <p className="text-[11px] font-semibold text-walnut-600 uppercase tracking-wider">
                      Reported Outcomes
                    </p>
                    <p className="mt-1 text-xs text-walnut-800 leading-relaxed">
                      {selectedActivity.outcomes}
                    </p>
                  </div>
                )}
              </div>

              {/* Evidence Attachments */}
              <div className="pt-4 border-t border-morning-200 space-y-2.5">
                <h3 className="text-sm font-semibold text-walnut-900">
                  Submitted Evidence ({evidenceList.length})
                </h3>
                {evidenceList.length === 0 ? (
                  <p className="text-xs text-walnut-600">
                    No supporting files were attached to this submission.
                  </p>
                ) : (
                  <div className="divide-y divide-morning-200 rounded-lg border border-morning-200">
                    {evidenceList.map((ev) => (
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
                        <button
                          type="button"
                          onClick={() => setPreviewEvidence(ev)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 rounded shrink-0"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          Inspect
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Faculty Decision Box */}
              <div className="pt-5 border-t border-morning-200 space-y-3">
                <h3 className="text-sm font-semibold text-walnut-900">
                  Record Faculty Verification Decision
                </h3>

                <label className="block">
                  <span className="block text-xs font-medium text-walnut-700 mb-1">
                    Review Feedback (required for Request Changes or Reject)
                  </span>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => {
                      setFeedback(e.target.value);
                      if (feedbackError) setFeedbackError(null);
                    }}
                    placeholder="Enter verification notes, missing documentation requests, or credit confirmation..."
                    className="w-full rounded-lg border border-morning-300 bg-white px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                  />
                  {feedbackError && (
                    <span className="mt-1 block text-xs text-red-700 font-medium">
                      {feedbackError}
                    </span>
                  )}
                </label>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleDecision('approved')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Approve Activity
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleDecision('changes_requested')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-60 rounded-lg transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Request Changes
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleDecision('rejected')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 rounded-lg transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Reject
                  </button>
                </div>

                {!canActOnSelected && (
                  <p className="text-[11px] text-walnut-500">
                    Note: This activity currently has status “{selectedActivity.status}”. Issuing a new decision appends to the audit log and updates the activity status.
                  </p>
                )}
              </div>

              {/* Audit Review History */}
              <div className="pt-5 border-t border-morning-200 space-y-2.5">
                <h3 className="text-sm font-semibold text-walnut-900">
                  Review Audit History ({reviewHistory.length})
                </h3>
                {reviewHistory.length === 0 ? (
                  <p className="text-xs text-walnut-600">
                    No prior reviews recorded for this activity.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {reviewHistory.map((rev) => {
                      const reviewer = db.profiles.find((p) => p.id === rev.reviewer_id);
                      return (
                        <div
                          key={rev.id}
                          className="rounded-lg border border-morning-200 bg-morning-50/60 p-3 space-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <StatusText status={rev.decision} />
                            <span className="text-[11px] font-mono tabular-nums text-walnut-600">
                              {reviewer?.full_name ?? 'Faculty'} · {formatShortDate(rev.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-walnut-800 leading-relaxed">{rev.feedback}</p>
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

      <EvidencePreviewModal
        evidence={previewEvidence}
        onClose={() => setPreviewEvidence(null)}
      />
    </div>
  );
}
