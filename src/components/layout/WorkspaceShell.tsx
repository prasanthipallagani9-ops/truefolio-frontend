import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  LogOut,
  Menu,
  RotateCcw,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import type { FacultyRoute, StudentRoute } from '../../types/truefolio';
import { ProfileAvatar } from '../ui/CommonUI';

const STUDENT_NAV: { page: StudentRoute; label: string }[] = [
  { page: 'overview', label: 'Overview' },
  { page: 'activities', label: 'Activities' },
  { page: 'evidence', label: 'Evidence' },
  { page: 'projects', label: 'Projects' },
  { page: 'profile', label: 'Profile' },
];

const FACULTY_NAV: { page: FacultyRoute; label: string }[] = [
  { page: 'overview', label: 'Dashboard' },
  { page: 'reviews', label: 'Review Queue' },
  { page: 'students', label: 'Students' },
  { page: 'profile', label: 'Profile' },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const {
    activeRole,
    activeProfile,
    route,
    roleMismatchTarget,
    studentProfiles,
    navigate,
    enterStudentDemo,
    enterFacultyDemo,
    exitToPortal,
    resetAllDemoData,
    storageError,
    clearStorageError,
    toasts,
    dismissToast,
    isBusy,
  } = useDemo();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStudent = activeRole === 'student';

  return (
    <div className="min-h-screen flex flex-col bg-morning-50 text-walnut-900">
      {/* Top Bar: strict 3-zone contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-morning-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line brand wordmark */}
          <button
            type="button"
            onClick={() =>
              isStudent
                ? navigate({ view: 'student', page: 'overview' })
                : navigate({ view: 'faculty', page: 'overview' })
            }
            className="font-display text-xl font-bold tracking-tight text-walnut-900 whitespace-nowrap shrink-0 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-amber-600 rounded"
          >
            TRUEFOLIO
          </button>

          {/* Zone 2: 4-5 concise single-line text nav links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium"
            aria-label="Primary workspace navigation"
          >
            {isStudent
              ? STUDENT_NAV.map((item) => {
                  const active = route.view === 'student' && route.page === item.page;
                  return (
                    <button
                      key={item.page}
                      type="button"
                      onClick={() => navigate({ view: 'student', page: item.page })}
                      className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-amber-600 ${
                        active
                          ? 'border-amber-600 text-walnut-900 font-semibold'
                          : 'border-transparent text-walnut-600 hover:text-walnut-900 hover:border-morning-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })
              : FACULTY_NAV.map((item) => {
                  const active =
                    route.view === 'faculty' &&
                    (route.page === item.page ||
                      (item.page === 'students' && route.page === 'student-detail'));
                  return (
                    <button
                      key={item.page}
                      type="button"
                      onClick={() => navigate({ view: 'faculty', page: item.page })}
                      className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-amber-600 ${
                        active
                          ? 'border-amber-600 text-walnut-900 font-semibold'
                          : 'border-transparent text-walnut-600 hover:text-walnut-900 hover:border-morning-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
          </nav>

          {/* Zone 3: 1 primary action + mobile drawer trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                isStudent ? enterFacultyDemo('overview') : enterStudentDemo(undefined, 'overview')
              }
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isStudent ? 'Switch to Faculty' : 'Switch to Student'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg border border-morning-200 text-walnut-800 hover:bg-morning-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-morning-200 bg-white px-4 py-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              {isStudent
                ? STUDENT_NAV.map((item) => {
                    const active = route.view === 'student' && route.page === item.page;
                    return (
                      <button
                        key={item.page}
                        type="button"
                        onClick={() => {
                          navigate({ view: 'student', page: item.page });
                          setMobileMenuOpen(false);
                        }}
                        className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap ${
                          active
                            ? 'bg-walnut-900 text-white'
                            : 'bg-morning-100 text-walnut-800 hover:bg-morning-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })
                : FACULTY_NAV.map((item) => {
                    const active = route.view === 'faculty' && route.page === item.page;
                    return (
                      <button
                        key={item.page}
                        type="button"
                        onClick={() => {
                          navigate({ view: 'faculty', page: item.page });
                          setMobileMenuOpen(false);
                        }}
                        className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap ${
                          active
                            ? 'bg-walnut-900 text-white'
                            : 'bg-morning-100 text-walnut-800 hover:bg-morning-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
            </div>
            <div className="pt-2 border-t border-morning-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isStudent) enterFacultyDemo('overview');
                  else enterStudentDemo(undefined, 'overview');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                {isStudent ? 'Switch to Faculty' : 'Switch to Student'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  exitToPortal();
                }}
                className="text-xs font-medium text-walnut-700 hover:text-walnut-900 px-2 py-2"
              >
                Role Portal
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Workspace Demo-Mode Indicator & Persona Toolbar */}
      <div className="bg-morning-100 border-b border-morning-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-walnut-700">
            <span className="font-semibold text-amber-800">
              Prototype Demo Mode
            </span>
            <span aria-hidden="true" className="text-walnut-500">·</span>
            <span>Local browser storage only (external database disconnected)</span>
            {isBusy && (
              <>
                <span aria-hidden="true" className="text-walnut-500">·</span>
                <span className="font-mono text-amber-700">Saving changes...</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeProfile && (
              <div className="flex items-center gap-2 pr-2 border-r border-morning-300">
                <ProfileAvatar
                  src={activeProfile.avatar_url}
                  name={activeProfile.full_name}
                  sizeClass="h-6 w-6 text-[10px]"
                />
                {isStudent ? (
                  <label className="flex items-center gap-1.5">
                    <span className="sr-only">Active Demo Student</span>
                    <select
                      aria-label="Switch demo student account"
                      value={activeProfile.id}
                      onChange={(e) =>
                        enterStudentDemo(
                          e.target.value,
                          route.view === 'student' ? route.page : 'overview'
                        )
                      }
                      className="bg-white border border-morning-300 rounded px-2 py-1 text-xs font-medium text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                    >
                      {studentProfiles.map((stu) => (
                        <option key={stu.id} value={stu.id}>
                          {stu.full_name} ({stu.roll_number})
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <span className="font-medium text-walnut-900 whitespace-nowrap">
                    {activeProfile.full_name} · Faculty
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={resetAllDemoData}
              className="inline-flex items-center gap-1.5 text-walnut-700 hover:text-walnut-900 font-medium whitespace-nowrap transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset Demo Data
            </button>

            <button
              type="button"
              onClick={exitToPortal}
              className="inline-flex items-center gap-1.5 text-walnut-700 hover:text-walnut-900 font-medium whitespace-nowrap transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Role Portal
            </button>
          </div>
        </div>
      </div>

      {/* Storage / Persistence Error Banner */}
      {storageError && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            role="alert"
            className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 flex items-center justify-between gap-4 text-sm text-red-900"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-700" />
              <span>{storageError}</span>
            </div>
            <button
              type="button"
              onClick={clearStorageError}
              className="text-xs font-semibold underline hover:no-underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {roleMismatchTarget ? (
          <div className="max-w-xl mx-auto my-12 rounded-xl border border-morning-200 bg-white p-8 text-center">
            <ShieldAlert className="h-10 w-10 text-amber-700 mx-auto mb-3" />
            <h1 className="font-display text-2xl font-semibold text-walnut-900">
              Role-Based Access Notice
            </h1>
            <p className="text-sm text-walnut-600 mt-2 leading-relaxed">
              This page belongs to the{' '}
              <span className="font-semibold text-walnut-900 capitalize">
                {roleMismatchTarget}
              </span>{' '}
              workspace. You are currently signed into{' '}
              <span className="font-semibold text-walnut-900 capitalize">
                {activeRole ?? 'no active'}
              </span>{' '}
              demo mode.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  roleMismatchTarget === 'faculty'
                    ? enterFacultyDemo('overview')
                    : enterStudentDemo(undefined, 'overview')
                }
                className="px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                Switch to {roleMismatchTarget === 'faculty' ? 'Faculty' : 'Student'} Demo
              </button>
              <button
                type="button"
                onClick={exitToPortal}
                className="px-4 py-2.5 text-sm font-medium text-walnut-800 bg-morning-100 hover:bg-morning-200 rounded-lg transition-colors"
              >
                Return to Role Portal
              </button>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-morning-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-walnut-600">
          <span>
            TRUEFOLIO Prototype · Amber Walnut Morning Edition · Data persists in local browser storage
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={exitToPortal}
              className="hover:text-walnut-900 underline-offset-4 hover:underline"
            >
              Demo Entry Portal
            </button>
            <button
              type="button"
              onClick={resetAllDemoData}
              className="hover:text-walnut-900 underline-offset-4 hover:underline"
            >
              Restore Seed Data
            </button>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-md flex items-center justify-between gap-3 text-xs font-medium ${
                toast.tone === 'error'
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : toast.tone === 'success'
                  ? 'bg-white border-emerald-300 text-walnut-900'
                  : 'bg-white border-morning-300 text-walnut-900'
              }`}
            >
              <span>{toast.text}</span>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss message"
                className="text-walnut-500 hover:text-walnut-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
