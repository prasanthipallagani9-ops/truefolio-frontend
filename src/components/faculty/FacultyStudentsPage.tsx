import React, { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { computeStudentProgress } from '../../demo/demoStore';
import { LoadingRows, ProfileAvatar } from '../ui/CommonUI';

export function FacultyStudentsPage() {
  const { db, assignedStudents, isHydrating, navigate } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return assignedStudents;
    return assignedStudents.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        (s.roll_number?.toLowerCase().includes(q) ?? false) ||
        s.department.toLowerCase().includes(q)
    );
  }, [assignedStudents, searchQuery]);

  if (isHydrating) {
    return <LoadingRows count={3} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-walnut-900">
            Assigned Students
          </h1>
          <p className="text-sm text-walnut-600 mt-1">
            Inspect portfolio progress, verified hours, and project deliverables for your cohort.
          </p>
        </div>

        <label className="relative w-full sm:w-72">
          <Search
            className="h-4 w-4 text-walnut-500 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, roll number, dept..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-morning-300 bg-white text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
          />
        </label>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-morning-300 bg-white p-12 text-center">
          <p className="font-display text-lg font-semibold text-walnut-900">
            No assigned students match "{searchQuery}"
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-4 px-4 py-2 text-xs font-medium text-walnut-800 bg-morning-100 rounded-lg"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((stu) => {
            const prog = computeStudentProgress(stu.id, db);
            return (
              <article
                key={stu.id}
                className="rounded-xl border border-morning-200 bg-white p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <ProfileAvatar
                      src={stu.avatar_url}
                      name={stu.full_name}
                      sizeClass="h-16 w-16 text-lg"
                    />
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-semibold text-walnut-900 truncate">
                        {stu.full_name}
                      </h2>
                      <p className="text-xs font-mono text-walnut-600 mt-0.5">
                        {stu.roll_number}
                      </p>
                      <p className="text-xs text-walnut-600 mt-0.5 truncate">
                        {stu.department}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-walnut-700 leading-relaxed line-clamp-2">
                    {stu.portfolio_headline}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-morning-100 text-xs">
                    <div>
                      <p className="text-walnut-500">Credits</p>
                      <p className="font-mono font-semibold text-walnut-900 tabular-nums mt-0.5">
                        {prog.verifiedCredits.toFixed(1)}/{prog.targetCredits.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-walnut-500">Verified</p>
                      <p className="font-mono font-semibold text-emerald-800 tabular-nums mt-0.5">
                        {prog.verifiedHours} hrs
                      </p>
                    </div>
                    <div>
                      <p className="text-walnut-500">Pending</p>
                      <p className="font-mono font-semibold text-amber-700 tabular-nums mt-0.5">
                        {prog.submittedCount}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      view: 'faculty',
                      page: 'student-detail',
                      studentId: stu.id,
                    })
                  }
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-walnut-900 bg-morning-100 hover:bg-morning-200 border border-morning-300 rounded-lg transition-colors"
                >
                  <span>Inspect Student Dossier</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
