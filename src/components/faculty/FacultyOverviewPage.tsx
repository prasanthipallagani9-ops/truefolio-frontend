import React, { useMemo } from 'react';
import { ArrowRight, ClipboardCheck, Users } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { computeStudentProgress } from '../../demo/demoStore';
import { formatShortDate, LoadingRows, ProfileAvatar, StatusText } from '../ui/CommonUI';

export function FacultyOverviewPage() {
  const { db, facultyProfile, assignedStudents, isHydrating, navigate } = useDemo();

  const assignedIds = useMemo(
    () => new Set(assignedStudents.map((s) => s.id)),
    [assignedStudents]
  );

  const cohortActivities = useMemo(
    () => db.activities.filter((a) => assignedIds.has(a.student_id)),
    [db.activities, assignedIds]
  );

  const pendingQueue = useMemo(
    () =>
      cohortActivities
        .filter((a) => a.status === 'submitted')
        .sort((a, b) => (b.submitted_at ?? b.updated_at).localeCompare(a.submitted_at ?? a.updated_at)),
    [cohortActivities]
  );

  const approvedCount = cohortActivities.filter((a) => a.status === 'approved').length;
  const changesCount = cohortActivities.filter((a) => a.status === 'changes_requested').length;

  if (isHydrating) {
    return <LoadingRows count={4} />;
  }

  return (
    <div className="space-y-8">
      {/* Faculty Hero Banner */}
      <section className="rounded-xl border border-morning-200 bg-white p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <ProfileAvatar
            src={facultyProfile.avatar_url}
            name={facultyProfile.full_name}
            sizeClass="h-16 w-16 text-lg"
          />
          <div>
            <p className="text-xs font-mono text-walnut-600">
              {facultyProfile.designation} · {facultyProfile.department}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-walnut-900 mt-0.5">
              {facultyProfile.full_name}
            </h1>
            <p className="text-xs text-walnut-600 mt-1">{facultyProfile.office_hours}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate({ view: 'faculty', page: 'reviews' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            Open Review Queue ({pendingQueue.length})
          </button>
          <button
            type="button"
            onClick={() => navigate({ view: 'faculty', page: 'students' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-walnut-800 bg-morning-100 hover:bg-morning-200 border border-morning-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            View Assigned Students
          </button>
        </div>
      </section>

      {/* 4-column Cohort KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-morning-200 bg-white p-5">
          <p className="text-xs text-walnut-600">Assigned Students</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-walnut-900 tabular-nums">
            {assignedStudents.length}
          </p>
          <p className="mt-1 text-xs text-walnut-500">Autumn 2026 Cohort</p>
        </div>

        <div className="rounded-xl border border-morning-200 bg-white p-5">
          <p className="text-xs text-walnut-600">Awaiting Faculty Review</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-amber-700 tabular-nums">
            {pendingQueue.length}
          </p>
          <p className="mt-1 text-xs text-walnut-500">Submitted records</p>
        </div>

        <div className="rounded-xl border border-morning-200 bg-white p-5">
          <p className="text-xs text-walnut-600">Approved by You</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-emerald-800 tabular-nums">
            {approvedCount}
          </p>
          <p className="mt-1 text-xs text-walnut-500">Verified portfolio items</p>
        </div>

        <div className="rounded-xl border border-morning-200 bg-white p-5">
          <p className="text-xs text-walnut-600">Changes Requested</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-orange-700 tabular-nums">
            {changesCount}
          </p>
          <p className="mt-1 text-xs text-walnut-500">With student for revision</p>
        </div>
      </section>

      {/* Two-Column Split: Pending Queue Preview + Assigned Students Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-6 rounded-xl border border-morning-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-walnut-900">
                Pending Submissions
              </h2>
              <p className="text-xs text-walnut-600 mt-0.5">
                Activities waiting for approval, revision request, or rejection.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate({ view: 'faculty', page: 'reviews' })}
              className="text-xs font-semibold text-amber-800 hover:underline whitespace-nowrap"
            >
              Review All
            </button>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="rounded-lg border border-dashed border-morning-300 bg-morning-50 p-8 text-center">
              <p className="text-sm font-medium text-walnut-900">Queue is clear</p>
              <p className="text-xs text-walnut-600 mt-1">
                All submitted student activities have been reviewed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-morning-200">
              {pendingQueue.map((act) => {
                const student = assignedStudents.find((s) => s.id === act.student_id);
                return (
                  <div
                    key={act.id}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-walnut-900 truncate">
                        {act.title}
                      </p>
                      <p className="text-xs text-walnut-600 font-mono tabular-nums mt-0.5">
                        {student?.full_name} · {act.category} · {act.hours} hrs · Submitted{' '}
                        {formatShortDate(act.submitted_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate({ view: 'faculty', page: 'reviews' })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg shrink-0"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="lg:col-span-6 rounded-xl border border-morning-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-walnut-900">
                Assigned Student Roster
              </h2>
              <p className="text-xs text-walnut-600 mt-0.5">
                Progress calculated directly from shared demo storage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate({ view: 'faculty', page: 'students' })}
              className="text-xs font-semibold text-amber-800 hover:underline whitespace-nowrap"
            >
              Directory
            </button>
          </div>

          <div className="divide-y divide-morning-200">
            {assignedStudents.map((stu) => {
              const prog = computeStudentProgress(stu.id, db);
              return (
                <div
                  key={stu.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ProfileAvatar
                      src={stu.avatar_url}
                      name={stu.full_name}
                      sizeClass="h-10 w-10 text-xs"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-walnut-900 truncate">
                        {stu.full_name}
                      </p>
                      <p className="text-xs font-mono tabular-nums text-walnut-600 truncate">
                        {stu.roll_number} · {prog.verifiedCredits.toFixed(1)}/{prog.targetCredits.toFixed(1)} cr · {prog.verifiedHours} hrs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {prog.submittedCount > 0 ? (
                      <StatusText status="submitted" />
                    ) : (
                      <span className="text-xs text-walnut-500">Up to date</span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          view: 'faculty',
                          page: 'student-detail',
                          studentId: stu.id,
                        })
                      }
                      className="px-3 py-1.5 text-xs font-medium text-walnut-900 bg-morning-100 hover:bg-morning-200 rounded-lg"
                    >
                      Dossier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
