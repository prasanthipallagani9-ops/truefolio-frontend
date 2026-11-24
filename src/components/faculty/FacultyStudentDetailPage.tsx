import React, { useMemo, useState } from 'react';
import { ArrowLeft, Award, ExternalLink, Eye } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { computeStudentProgress } from '../../demo/demoStore';
import type { ActivityEvidence } from '../../types/truefolio';
import {
  EvidencePreviewModal,
  formatShortDate,
  LoadingRows,
  ProfileAvatar,
  StatusText,
} from '../ui/CommonUI';

export function FacultyStudentDetailPage({ studentId }: { studentId?: string }) {
  const { db, assignedStudents, isHydrating, navigate } = useDemo();
  const [previewEvidence, setPreviewEvidence] = useState<ActivityEvidence | null>(null);

  const student = useMemo(
    () =>
      assignedStudents.find((s) => s.id === studentId) ?? assignedStudents[0] ?? null,
    [assignedStudents, studentId]
  );

  const progress = useMemo(
    () => (student ? computeStudentProgress(student.id, db) : null),
    [student, db]
  );

  const activities = useMemo(() => {
    if (!student) return [];
    return db.activities
      .filter((a) => a.student_id === student.id && a.status !== 'draft')
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [db.activities, student]);

  const projects = useMemo(() => {
    if (!student) return [];
    return db.projects.filter((p) => p.student_id === student.id);
  }, [db.projects, student]);

  if (isHydrating) {
    return <LoadingRows count={4} />;
  }

  if (!student || !progress) {
    return (
      <div className="rounded-xl border border-morning-200 bg-white p-8 text-center">
        <p className="font-display text-lg font-semibold text-walnut-900">
          Student dossier not found
        </p>
        <button
          type="button"
          onClick={() => navigate({ view: 'faculty', page: 'students' })}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <button
          type="button"
          onClick={() => navigate({ view: 'faculty', page: 'students' })}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-walnut-700 hover:text-walnut-900 mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Assigned Students
        </button>

        {/* Student Profile Summary */}
        <div className="rounded-xl border border-morning-200 bg-white p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <ProfileAvatar
              src={student.avatar_url}
              name={student.full_name}
              sizeClass="h-16 w-16 text-lg"
            />
            <div>
              <p className="text-xs font-mono text-walnut-600">
                {student.roll_number} · {student.department} · {student.academic_year}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-walnut-900 mt-0.5">
                {student.full_name}
              </h1>
              <p className="text-sm text-walnut-700 mt-1">{student.portfolio_headline}</p>
            </div>
          </div>

          {progress.submittedCount > 0 && (
            <button
              type="button"
              onClick={() => navigate({ view: 'faculty', page: 'reviews' })}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg whitespace-nowrap shrink-0"
            >
              Review {progress.submittedCount} Pending{' '}
              {progress.submittedCount === 1 ? 'Submission' : 'Submissions'}
            </button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-morning-200 bg-white p-5">
          <p className="text-xs text-walnut-600">Verified Credits</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-walnut-900 tabular-nums">
            {progress.verifiedCredits.toFixed(1)} / {progress.targetCredits.toFixed(1)}
          </p>
        </div>
        <div className="rounded-xl border border-morning-200 bg-white p-5">
          <p className="text-xs text-walnut-600">Verified Hours</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-walnut-900 tabular-nums">
            {progress.verifiedHours} hrs
          </p>
        </div>
        <div className="rounded-xl border border-morning-200 bg-white p-5">
          <p className="text-xs text-walnut-600">Approved / Pending</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-walnut-900 tabular-nums">
            {progress.approvedCount} / {progress.submittedCount}
          </p>
        </div>
        <div className="rounded-xl border border-morning-200 bg-white p-5">
          <p className="text-xs text-walnut-600">Earned Achievements</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-emerald-800 tabular-nums">
            {progress.achievements.filter((a) => a.earned).length} / {progress.achievements.length}
          </p>
        </div>
      </div>

      {/* Submitted & Reviewed Activities */}
      <section className="rounded-xl border border-morning-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-walnut-900">
            Submitted &amp; Verified Activities ({activities.length})
          </h2>
          <p className="text-xs text-walnut-600 mt-0.5">
            Draft entries remain private to the student until submitted for review.
          </p>
        </div>

        {activities.length === 0 ? (
          <p className="text-xs text-walnut-600 py-4">
            This student has not submitted any activities yet.
          </p>
        ) : (
          <div className="divide-y divide-morning-200">
            {activities.map((act) => {
              const evs = db.activity_evidence.filter((e) => e.activity_id === act.id);
              return (
                <div key={act.id} className="py-4 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-walnut-900">{act.title}</h3>
                      <p className="text-xs font-mono tabular-nums text-walnut-600 mt-0.5">
                        {act.category} · {act.organization} · {formatShortDate(act.activity_date)} ·{' '}
                        {act.hours} hrs · {act.credits.toFixed(1)} cr
                      </p>
                    </div>
                    <StatusText status={act.status} />
                  </div>
                  <p className="text-xs text-walnut-700 leading-relaxed">{act.description}</p>
                  {evs.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {evs.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => setPreviewEvidence(ev)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:underline"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{ev.file_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Projects & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 rounded-xl border border-morning-200 bg-white p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-walnut-900">
            Documented Projects ({projects.length})
          </h2>
          {projects.length === 0 ? (
            <p className="text-xs text-walnut-600">No projects documented yet.</p>
          ) : (
            <div className="divide-y divide-morning-200">
              {projects.map((proj) => (
                <div key={proj.id} className="py-3.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-walnut-900">{proj.title}</h3>
                    {proj.demo_url && (
                      <a
                        href={proj.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:underline shrink-0"
                      >
                        <span>Demo</span>
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-walnut-700">{proj.tagline}</p>
                  <p className="text-[11px] font-mono text-walnut-500">
                    {proj.role_label} · {proj.tech_stack.join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-5 rounded-xl border border-morning-200 bg-white p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-walnut-900">
            Milestone Status
          </h2>
          <div className="space-y-2.5">
            {progress.achievements.map((ach) => (
              <div
                key={ach.id}
                className="flex items-center justify-between gap-3 py-2 border-b border-morning-100 last:border-b-0 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Award
                    className={`h-4 w-4 shrink-0 ${
                      ach.earned ? 'text-amber-700' : 'text-walnut-400'
                    }`}
                  />
                  <span className="font-medium text-walnut-900 truncate">{ach.title}</span>
                </div>
                <span
                  className={`font-mono tabular-nums shrink-0 ${
                    ach.earned ? 'text-emerald-800 font-semibold' : 'text-walnut-500'
                  }`}
                >
                  {ach.earned
                    ? 'Earned'
                    : `${ach.progressCurrent}/${ach.progressTarget} ${ach.unit}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <EvidencePreviewModal
        evidence={previewEvidence}
        onClose={() => setPreviewEvidence(null)}
      />
    </div>
  );
}
