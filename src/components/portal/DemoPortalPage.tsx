import React, { useState } from 'react';
import { ArrowRight, BookOpen, GraduationCap, RotateCcw, ShieldCheck } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { DEMO_IDS } from '../../demo/seedData';
import { ProfileAvatar } from '../ui/CommonUI';

export function DemoPortalPage() {
  const {
    db,
    studentProfiles,
    facultyProfile,
    enterStudentDemo,
    enterFacultyDemo,
    resetAllDemoData,
  } = useDemo();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(DEMO_IDS.studentAarav);
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  const pendingReviewCount = db.activities.filter((a) => a.status === 'submitted').length;
  const approvedCount = db.activities.filter((a) => a.status === 'approved').length;
  const totalProjects = db.projects.length;
  const totalEvidence = db.activity_evidence.length;

  return (
    <div className="min-h-screen flex flex-col bg-morning-50 text-walnut-900">
      {/* Top Bar Contract: 3 clean zones */}
      <header className="bg-white border-b border-morning-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <span className="font-display text-xl font-bold tracking-tight text-walnut-900 whitespace-nowrap shrink-0">
            TRUEFOLIO
          </span>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-walnut-600">
            <a
              href="#role-entry"
              className="hover:text-walnut-900 transition-colors whitespace-nowrap shrink-0"
            >
              Demo Entry
            </a>
            <a
              href="#capabilities"
              className="hover:text-walnut-900 transition-colors whitespace-nowrap shrink-0"
            >
              Workflows
            </a>
            <a
              href="#schema-note"
              className="hover:text-walnut-900 transition-colors whitespace-nowrap shrink-0"
            >
              Architecture
            </a>
          </nav>

          <button
            type="button"
            onClick={() => enterStudentDemo(selectedStudentId, 'overview')}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Launch Student Demo
          </button>
        </div>
      </header>

      {/* Honest Prototype Mode Notice */}
      <div className="bg-morning-100 border-b border-morning-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-walnut-700">
          <div>
            <span className="font-semibold text-amber-800">Prototype Demo Mode</span>
            <span className="mx-2 text-walnut-500">·</span>
            <span>
              Runs offline with seeded academic data &amp; browser localStorage persistence. Not connected to the external Lovable Cloud database.
            </span>
          </div>
          <button
            type="button"
            onClick={resetAllDemoData}
            className="inline-flex items-center gap-1.5 font-medium text-walnut-800 hover:text-walnut-950 whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset Seed Data
          </button>
        </div>
      </div>

      <main className="flex-1">
        {/* Hero Split */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6 py-2">
              <div>
                <p className="text-xs font-medium text-amber-800 tracking-wide mb-3">
                  Verified Academic Portfolio · Student &amp; Faculty Prototype
                </p>
                <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-walnut-900 leading-[1.1] [text-wrap:balance]">
                  Every experiential credit, backed by evidence and faculty review.
                </h1>
                <p className="mt-4 text-base text-walnut-700 leading-relaxed max-w-xl">
                  TRUEFOLIO gives students a structured ledger to draft activities, attach supporting files, showcase shipped projects, and track earned milestones—while giving faculty mentors a unified review queue.
                </p>
              </div>

              {/* Dual Role Entry Points */}
              <div id="role-entry" className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Student Entry Card */}
                <div className="rounded-xl border border-morning-200 bg-white p-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs mb-2">
                      <GraduationCap className="h-4 w-4" aria-hidden="true" />
                      <span>Student Workspace</span>
                    </div>
                    <h2 className="font-display text-lg font-semibold text-walnut-900">
                      Enter Student Demo
                    </h2>
                    <p className="text-xs text-walnut-600 mt-1 leading-relaxed">
                      Edit profile, log &amp; submit activities, attach local evidence, manage projects, and view achievements.
                    </p>

                    <label className="block mt-3">
                      <span className="block text-[11px] font-medium text-walnut-700 mb-1">
                        Demo Student Account
                      </span>
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full rounded-lg border border-morning-300 bg-morning-50 px-2.5 py-1.5 text-xs font-medium text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                      >
                        {studentProfiles.map((stu) => (
                          <option key={stu.id} value={stu.id}>
                            {stu.full_name} · {stu.roll_number}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => enterStudentDemo(selectedStudentId, 'overview')}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                  >
                    <span>Open Student Portfolio</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                {/* Faculty Entry Card */}
                <div className="rounded-xl border border-morning-200 bg-white p-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-walnut-700 font-semibold text-xs mb-2">
                      <ShieldCheck className="h-4 w-4 text-amber-700" aria-hidden="true" />
                      <span>Faculty Workspace</span>
                    </div>
                    <h2 className="font-display text-lg font-semibold text-walnut-900">
                      Enter Faculty Demo
                    </h2>
                    <p className="text-xs text-walnut-600 mt-1 leading-relaxed">
                      Inspect assigned students, preview evidence files, and approve, request changes, or reject submissions.
                    </p>

                    <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-morning-200 bg-morning-50 px-2.5 py-2">
                      <ProfileAvatar
                        src={facultyProfile.avatar_url}
                        name={facultyProfile.full_name}
                        sizeClass="h-8 w-8 text-xs"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-walnut-900 truncate">
                          {facultyProfile.full_name}
                        </p>
                        <p className="text-[11px] text-walnut-600 truncate">
                          {facultyProfile.department}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => enterFacultyDemo('overview')}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-walnut-900 bg-morning-100 hover:bg-morning-200 border border-morning-300 rounded-lg transition-colors"
                  >
                    <span>Open Faculty Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Visual Column */}
            <div className="lg:col-span-6">
              <div className="h-full min-h-[300px] lg:min-h-[440px] rounded-2xl overflow-hidden border border-morning-200 bg-morning-100 relative">
                {!heroImageFailed ? (
                  <img
                    src="/src/assets/images/hero_amber_studio_1795526823574.jpg"
                    alt="Warm morning sunlight across a walnut academic studio desk with sketchbooks and portfolio binders"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImageFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-morning-100">
                    <BookOpen className="h-10 w-10 text-amber-700 mb-3" />
                    <p className="font-display text-xl text-walnut-900">TRUEFOLIO Academic Studio</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4-column KPI strip below hero split */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-morning-200 bg-white p-5">
              <p className="text-xs text-walnut-600">Seeded Demo Students</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-walnut-900 tabular-nums">
                {studentProfiles.length}
              </p>
            </div>
            <div className="rounded-xl border border-morning-200 bg-white p-5">
              <p className="text-xs text-walnut-600">Pending Faculty Reviews</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-amber-700 tabular-nums">
                {pendingReviewCount}
              </p>
            </div>
            <div className="rounded-xl border border-morning-200 bg-white p-5">
              <p className="text-xs text-walnut-600">Verified Activities</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-emerald-800 tabular-nums">
                {approvedCount}
              </p>
            </div>
            <div className="rounded-xl border border-morning-200 bg-white p-5">
              <p className="text-xs text-walnut-600">Projects &amp; Evidence Files</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-walnut-900 tabular-nums">
                {totalProjects} / {totalEvidence}
              </p>
            </div>
          </div>
        </section>

        {/* Workflows & Isolated Architecture Note */}
        <section
          id="capabilities"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-morning-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-morning-200 bg-white p-6">
              <p className="text-xs font-medium text-amber-800 mb-1.5">01. Student Ledger</p>
              <h3 className="font-display text-lg font-semibold text-walnut-900">
                Draft, Attach &amp; Submit
              </h3>
              <p className="mt-2 text-sm text-walnut-600 leading-relaxed">
                Students create experiential records, save drafts, upload validated local image/PDF/text evidence with live preview, and submit for verification.
              </p>
            </div>

            <div className="rounded-xl border border-morning-200 bg-white p-6">
              <p className="text-xs font-medium text-amber-800 mb-1.5">02. Faculty Verification</p>
              <h3 className="font-display text-lg font-semibold text-walnut-900">
                Review Queue &amp; Feedback
              </h3>
              <p className="mt-2 text-sm text-walnut-600 leading-relaxed">
                Faculty mentors inspect assigned student cohorts, preview evidence, and approve, request changes, or reject with persistent audit history.
              </p>
            </div>

            <div
              id="schema-note"
              className="rounded-xl border border-morning-200 bg-white p-6"
            >
              <p className="text-xs font-medium text-amber-800 mb-1.5">03. Shared Demo Sync</p>
              <h3 className="font-display text-lg font-semibold text-walnut-900">
                Browser Persistence
              </h3>
              <p className="mt-2 text-sm text-walnut-600 leading-relaxed">
                Changes made as a Student immediately appear in the Faculty queue—and vice versa—across refreshes, while keeping the Supabase service layer isolated.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
