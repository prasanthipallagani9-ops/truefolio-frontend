import React, { useEffect, useState } from 'react';
import { Check, Pencil, Save, X } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { formatShortDate, LoadingRows, ProfileAvatar } from '../ui/CommonUI';

interface FacultyFormState {
  full_name: string;
  department: string;
  designation: string;
  office_hours: string;
  portfolio_headline: string;
  bio: string;
}

export function FacultyProfilePage() {
  const { facultyProfile, isHydrating, isBusy, updateProfile } = useDemo();
  const [isEditing, setIsEditing] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FacultyFormState, string>>>({});

  const [form, setForm] = useState<FacultyFormState>({
    full_name: '',
    department: '',
    designation: '',
    office_hours: '',
    portfolio_headline: '',
    bio: '',
  });

  useEffect(() => {
    setForm({
      full_name: facultyProfile.full_name,
      department: facultyProfile.department,
      designation: facultyProfile.designation ?? '',
      office_hours: facultyProfile.office_hours ?? '',
      portfolio_headline: facultyProfile.portfolio_headline,
      bio: facultyProfile.bio,
    });
  }, [facultyProfile]);

  if (isHydrating) {
    return <LoadingRows count={3} />;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrs: Partial<Record<keyof FacultyFormState, string>> = {};
    if (!form.full_name.trim()) nextErrs.full_name = 'Name is required.';
    if (!form.department.trim()) nextErrs.department = 'Department is required.';
    if (!form.designation.trim()) nextErrs.designation = 'Designation is required.';
    setErrors(nextErrs);
    if (Object.keys(nextErrs).length > 0) return;

    const ok = await updateProfile(facultyProfile.id, {
      full_name: form.full_name.trim(),
      department: form.department.trim(),
      designation: form.designation.trim(),
      office_hours: form.office_hours.trim(),
      portfolio_headline: form.portfolio_headline.trim(),
      bio: form.bio.trim(),
    });
    if (ok) {
      setIsEditing(false);
      setSavedBanner(true);
      window.setTimeout(() => setSavedBanner(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-walnut-900">
            Faculty Reviewer Profile
          </h1>
          <p className="text-sm text-walnut-600 mt-1">
            Mentorship credentials and office hours displayed to assigned cohort students.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit Profile
          </button>
        )}
      </div>

      {savedBanner && (
        <div
          role="status"
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900 flex items-center gap-2"
        >
          <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          Faculty profile updated in local demo storage.
        </div>
      )}

      {!isEditing ? (
        <div className="rounded-xl border border-morning-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-morning-200">
            <ProfileAvatar
              src={facultyProfile.avatar_url}
              name={facultyProfile.full_name}
              sizeClass="h-20 w-20 text-xl"
            />
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-semibold text-walnut-900">
                {facultyProfile.full_name}
              </h2>
              <p className="text-xs font-mono text-walnut-600">
                {facultyProfile.designation} · {facultyProfile.department}
              </p>
              <p className="text-xs text-walnut-600">{facultyProfile.email}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-walnut-600 uppercase tracking-wider">
              Advising Office Hours
            </h3>
            <p className="mt-1.5 text-sm font-medium text-walnut-900">
              {facultyProfile.office_hours || 'By appointment'}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-walnut-600 uppercase tracking-wider">
              Review Focus
            </h3>
            <p className="mt-1.5 text-sm text-walnut-800">{facultyProfile.portfolio_headline}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-walnut-600 uppercase tracking-wider">
              Mentorship Bio
            </h3>
            <p className="mt-1.5 text-sm text-walnut-700 leading-relaxed">{facultyProfile.bio}</p>
          </div>

          <p className="pt-4 border-t border-morning-200 text-xs font-mono text-walnut-500">
            Last updated {formatShortDate(facultyProfile.updated_at)}
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          noValidate
          className="rounded-xl border border-morning-200 bg-white p-6 sm:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs font-semibold text-walnut-800 mb-1">
                Full Name *
              </span>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
              {errors.full_name && (
                <span className="mt-1 block text-xs text-red-700">{errors.full_name}</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-walnut-800 mb-1">
                Designation *
              </span>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
              {errors.designation && (
                <span className="mt-1 block text-xs text-red-700">{errors.designation}</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-walnut-800 mb-1">
                Department *
              </span>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
              {errors.department && (
                <span className="mt-1 block text-xs text-red-700">{errors.department}</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-walnut-800 mb-1">
                Office Hours
              </span>
              <input
                type="text"
                value={form.office_hours}
                onChange={(e) => setForm((f) => ({ ...f, office_hours: e.target.value }))}
                className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-xs font-semibold text-walnut-800 mb-1">
              Review Focus Headline
            </span>
            <input
              type="text"
              value={form.portfolio_headline}
              onChange={(e) => setForm((f) => ({ ...f, portfolio_headline: e.target.value }))}
              className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-walnut-800 mb-1">Bio</span>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
            />
          </label>

          <div className="pt-4 border-t border-morning-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-walnut-800 bg-morning-100 rounded-lg"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
            >
              <Save className="h-3.5 w-3.5" />
              {isBusy ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
