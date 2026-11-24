import React, { useMemo } from 'react';
import { ArrowRight, Award, FolderKanban, Plus, RotateCcw } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { computeStudentProgress } from '../../demo/demoStore';
import { formatShortDate, LoadingRows, ProfileAvatar, StatusText } from '../ui/CommonUI';

export function StudentOverviewPage() {
  const { db, activeProfile, isHydrating, navigate } = useDemo();

  const studentId = activeProfile?.id ?? '';
  const progress = useMemo(
    () => computeStudentProgress(studentId, db),
    [studentId, db]
  );

  const studentActivities = useMemo(
    () =>
      db.activities
        .filter((a) => a.student_id === studentId)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    [db.activities, studentId]
  );

  const latestReviewByActivity = useMemo(() => {
    const map = new Map<string, (typeof db.activity_reviews)[number]>();
    const sorted = [...db.activity_reviews].sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    );
    for (const rev of sorted) {
      if (!map.has(rev.activity_id)) {
        map.set(rev.activity_id, rev);
      }
    }
    return map;
  }, [db.activity_reviews]);

  const attentionActivities = studentActivities.filter(
    (a) => a.status === 'changes_requested' || a.status === 'rejected'
  );

  if (isHydrating || !activeProfile) {
    return <LoadingRows count={4} />;
  }

  return (
    <div className="space-y-8">
      {/* Student Header Summary */}
      <section className="rounded-xl border border-morning-200 bg-white p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <ProfileAvatar
            src={activeProfile.avatar_url}
            name={activeProfile.full_name}
            sizeClass="h-16 w-16 text-lg"
          />
          <div>
            <p className="text-xs text-walnut-600 font-mono tabular-nums">
              {activeProfile.roll_number} · {activeProfile.department} · {activeProfile.academic_year}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-walnut-900 mt-0.5">
              {activeProfile.full_name}
            </h1>
            <p className="text-sm text-walnut-700 mt-1 max-w-2xl">
              {activeProfile.portfolio_headline}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate({ view: 'student', page: 'activities' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Log Activity
          </button>
          <button
            type="button"
            onClick={() => navigate({ view: 'student', page: 'projects' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-walnut-800 bg-morning-100 hover:bg-morning-200 border border-morning-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <FolderKanban className="h-4 w-4" aria-hidden="true" />
            Manage Projects
          </button>
        </div>
      </section>

      {/* 4-column Progress KPI Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-morning-200 bg-white p-5">
          <p className="text-xs text-walnut-600">Verified Credits</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-walnut-900 tabular-nums">
            {progress.verifiedCredits.toFixed(1)}{' '}
            <span className="text-sm font-normal text-walnut-500">
              / {progress.targetCredits.toFixed(1)}
            </span>
          </p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-morning-100 overflow-hidden">
            <div
              className="h-full bg-amber-600 rounded-full transition-all"
              style={{ width: `${progress.creditCompletionPct}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-morning-200 bg-white p-5">
          <p className="text-xs text-walnut-600">Verified Hours</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-walnut-900 tabular-nums">
            {progress.verifiedHours}
            <span className="text-sm font-normal text-walnut-500"> hrs</span>
          </p>
          <p className="mt-2 text-xs text-walnut-600 font-mono tabular-nums">
            {progress.totalLoggedHours} total logged hrs
          </p>
        </div>

        <div className="rounded-xl border border-morning-200 bg-white p-5">
          <p className="text-xs text-walnut-600">Approved Activities</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-emerald-800 tabular-nums">
            {progress.approvedCount}
            <span className="text-sm font-normal text-walnut-500">
              {' '}
              / {progress.totalActivities}
            </span>
          </p>
          <p className="mt-2 text-xs text-walnut-600 font-mono tabular-nums">
            {progress.submittedCount} pending · {progress.draftCount} draft
          </p>
        </div>

        <div className="rounded-xl border border-morning-200 bg-white p-5">
          <p className="text-xs text-walnut-600">Portfolio Artifacts</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-walnut-900 tabular-nums">
            {progress.projectCount}
            <span className="text-sm font-normal text-walnut-500"> projects</span>
          </p>
          <p className="mt-2 text-xs text-walnut-600 font-mono tabular-nums">
            {progress.evidenceCount} evidence files
          </p>
        </div>
      </section>

      {/* Action Needed / Faculty Review Feedback Alert */}
      {attentionActivities.length > 0 && (
        <section className="rounded-xl border border-orange-200 bg-orange-50/60 p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-orange-700" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold text-walnut-900">
                Faculty Feedback Requiring Attention
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate({ view: 'student', page: 'activities' })}
              className="text-xs font-semibold text-amber-800 hover:underline whitespace-nowrap"
            >
              Open Activities
            </button>
          </div>
          <div className="space-y-3">
            {attentionActivities.map((act) => {
              const latestRev = latestReviewByActivity.get(act.id);
              return (
                <div
                  key={act.id}
                  className="rounded-lg border border-morning-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-semibold text-walnut-900">{act.title}</span>
                      <span className="text-walnut-400" aria-hidden="true">·</span>
                      <StatusText status={act.status} />
                    </div>
                    {latestRev && (
                      <p className="text-xs text-walnut-700 leading-relaxed">
                        Faculty note: “{latestRev.feedback}”
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate({ view: 'student', page: 'activities' })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-walnut-900 bg-morning-100 hover:bg-morning-200 rounded-lg shrink-0"
                  >
                    <span>Review &amp; Update</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Two-Column Detail Split: Category Breakdown + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Breakdown Table */}
        <section className="lg:col-span-5 rounded-xl border border-morning-200 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-walnut-900">
            Credits &amp; Hours by Category
          </h2>
          <p className="text-xs text-walnut-600 mt-1">
            Calculated live from approved and pending records in demo storage.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-morning-200 text-walnut-600">
                  <th className="py-2.5 font-medium">Category</th>
                  <th className="py-2.5 font-medium text-right">Approved</th>
                  <th className="py-2.5 font-medium text-right">Pending</th>
                  <th className="py-2.5 font-medium text-right">Verified Hrs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-morning-100">
                {progress.categoryBreakdown.map((row) => (
                  <tr key={row.category} className="hover:bg-morning-50/70">
                    <td className="py-2.5 font-medium text-walnut-900">{row.category}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-emerald-800">
                      {row.verifiedCount}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-amber-700">
                      {row.pendingCount}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums font-medium text-walnut-900">
                      {row.verifiedHours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Activities */}
        <section className="lg:col-span-7 rounded-xl border border-morning-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-walnut-900">
                Recent Activity Ledger
              </h2>
              <p className="text-xs text-walnut-600 mt-1">
                Most recently updated experiential records and review states.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate({ view: 'student', page: 'activities' })}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 whitespace-nowrap"
            >
              View All ({studentActivities.length})
            </button>
          </div>

          {studentActivities.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-morning-300 bg-morning-50 p-8 text-center">
              <p className="text-sm font-medium text-walnut-900">No activities logged yet</p>
              <p className="text-xs text-walnut-600 mt-1">
                Log your first research study, internship, or workshop to start earning verified credits.
              </p>
              <button
                type="button"
                onClick={() => navigate({ view: 'student', page: 'activities' })}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                Log First Activity
              </button>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-morning-200">
              {studentActivities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-walnut-900 truncate">{act.title}</p>
                    <p className="text-xs text-walnut-600 mt-0.5 font-mono tabular-nums">
                      {act.category} · {act.organization} · {formatShortDate(act.activity_date)} ·{' '}
                      {act.hours} hrs
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StatusText status={act.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Achievements & Milestones */}
      <section className="rounded-xl border border-morning-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-walnut-900">
              Calculated Achievements &amp; Milestones
            </h2>
            <p className="text-xs text-walnut-600 mt-1">
              Derived automatically from faculty-approved activities and documented projects.
            </p>
          </div>
          <p className="text-xs font-mono tabular-nums text-walnut-700">
            {progress.achievements.filter((a) => a.earned).length} / {progress.achievements.length}{' '}
            earned
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {progress.achievements.map((ach) => {
            const pct = Math.min(
              100,
              Math.round((ach.progressCurrent / ach.progressTarget) * 100)
            );
            return (
              <div
                key={ach.id}
                className={`rounded-xl border p-4 ${
                  ach.earned
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-morning-200 bg-morning-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Award
                      className={`h-4 w-4 shrink-0 ${
                        ach.earned ? 'text-amber-700' : 'text-walnut-500'
                      }`}
                      aria-hidden="true"
                    />
                    <h3 className="text-sm font-semibold text-walnut-900">{ach.title}</h3>
                  </div>
                  <span
                    className={`text-[11px] font-semibold whitespace-nowrap ${
                      ach.earned ? 'text-emerald-800' : 'text-walnut-600'
                    }`}
                  >
                    {ach.earned ? 'Earned' : 'In Progress'}
                  </span>
                </div>
                <p className="text-xs text-walnut-600 mt-1.5 leading-relaxed">{ach.criteria}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono tabular-nums text-walnut-700">
                  <span>
                    {ach.progressCurrent} / {ach.progressTarget} {ach.unit}
                  </span>
                  <span>{pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-morning-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      ach.earned ? 'bg-emerald-700' : 'bg-amber-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
