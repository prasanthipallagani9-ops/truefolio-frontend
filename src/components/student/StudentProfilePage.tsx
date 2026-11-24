import React, { useEffect, useState } from 'react';
import { Check, ExternalLink, Pencil, Save, X } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { formatShortDate, LoadingRows, ProfileAvatar } from '../ui/CommonUI';

interface ProfileFormState {
  full_name: string;
  department: string;
  academic_year: string;
  roll_number: string;
  portfolio_headline: string;
  bio: string;
  skillsText: string;
  github_url: string;
  linkedin_url: string;
}

export function StudentProfilePage() {
  const { activeProfile, isHydrating, isBusy, updateProfile } = useDemo();
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormState, string>>>({});
  const [savedBanner, setSavedBanner] = useState(false);

  const [form, setForm] = useState<ProfileFormState>({
    full_name: '',
    department: '',
    academic_year: '',
    roll_number: '',
    portfolio_headline: '',
    bio: '',
    skillsText: '',
    github_url: '',
    linkedin_url: '',
  });

  useEffect(() => {
    if (!activeProfile) return;
    setForm({
      full_name: activeProfile.full_name,
      department: activeProfile.department,
      academic_year: activeProfile.academic_year ?? '',
      roll_number: activeProfile.roll_number ?? '',
      portfolio_headline: activeProfile.portfolio_headline,
      bio: activeProfile.bio,
      skillsText: activeProfile.skills.join(', '),
      github_url: activeProfile.github_url,
      linkedin_url: activeProfile.linkedin_url,
    });
  }, [activeProfile]);

  if (isHydrating || !activeProfile) {
    return <LoadingRows count={3} />;
  }

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof ProfileFormState, string>> = {};
    if (!form.full_name.trim()) nextErrors.full_name = 'Full name is required.';
    if (!form.department.trim()) nextErrors.department = 'Department is required.';
    if (!form.roll_number.trim()) nextErrors.roll_number = 'Roll number is required.';
    if (!form.portfolio_headline.trim()) {
      nextErrors.portfolio_headline = 'Portfolio headline is required.';
    }
    if (form.github_url.trim() && !/^https?:\/\//i.test(form.github_url.trim())) {
      nextErrors.github_url = 'Enter a valid URL starting with http:// or https://';
    }
    if (form.linkedin_url.trim() && !/^https?:\/\//i.test(form.linkedin_url.trim())) {
      nextErrors.linkedin_url = 'Enter a valid URL starting with http:// or https://';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const skills = form.skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const ok = await updateProfile(activeProfile.id, {
      full_name: form.full_name.trim(),
      department: form.department.trim(),
      academic_year: form.academic_year.trim(),
      roll_number: form.roll_number.trim(),
      portfolio_headline: form.portfolio_headline.trim(),
      bio: form.bio.trim(),
      skills,
      github_url: form.github_url.trim(),
      linkedin_url: form.linkedin_url.trim(),
    });

    if (ok) {
      setIsEditing(false);
      setSavedBanner(true);
      window.setTimeout(() => setSavedBanner(false), 3000);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setForm({
      full_name: activeProfile.full_name,
      department: activeProfile.department,
      academic_year: activeProfile.academic_year ?? '',
      roll_number: activeProfile.roll_number ?? '',
      portfolio_headline: activeProfile.portfolio_headline,
      bio: activeProfile.bio,
      skillsText: activeProfile.skills.join(', '),
      github_url: activeProfile.github_url,
      linkedin_url: activeProfile.linkedin_url,
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-walnut-900">
            Student Profile
          </h1>
          <p className="text-sm text-walnut-600 mt-1">
            Academic identity, portfolio summary, and skills stored locally for this demo session.
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
          Profile changes saved and synchronized across Student and Faculty views.
        </div>
      )}

      {!isEditing ? (
        <div className="rounded-xl border border-morning-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-morning-200">
            <ProfileAvatar
              src={activeProfile.avatar_url}
              name={activeProfile.full_name}
              sizeClass="h-20 w-20 text-xl"
            />
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-semibold text-walnut-900">
                {activeProfile.full_name}
              </h2>
              <p className="text-xs font-mono tabular-nums text-walnut-600">
                {activeProfile.roll_number} · {activeProfile.department} ·{' '}
                {activeProfile.academic_year}
              </p>
              <p className="text-xs text-walnut-600">{activeProfile.email}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-walnut-600 uppercase tracking-wider">
              Portfolio Headline
            </h3>
            <p className="mt-1.5 text-base font-medium text-walnut-900">
              {activeProfile.portfolio_headline}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-walnut-600 uppercase tracking-wider">
              Academic Bio
            </h3>
            <p className="mt-1.5 text-sm text-walnut-700 leading-relaxed whitespace-pre-line">
              {activeProfile.bio || 'No bio added yet.'}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-walnut-600 uppercase tracking-wider">
              Core Skills &amp; Focus Areas
            </h3>
            <p className="mt-1.5 text-sm text-walnut-800">
              {activeProfile.skills.length > 0
                ? activeProfile.skills.join(' · ')
                : 'No skills listed yet.'}
            </p>
          </div>

          <div className="pt-4 border-t border-morning-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-5">
              {activeProfile.github_url && (
                <a
                  href={activeProfile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-amber-800 hover:underline"
                >
                  <span>GitHub</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
              {activeProfile.linkedin_url && (
                <a
                  href={activeProfile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-amber-800 hover:underline"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
            <span className="text-walnut-500 font-mono tabular-nums">
              Last updated {formatShortDate(activeProfile.updated_at)}
            </span>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-morning-200 bg-white p-6 sm:p-8 space-y-5"
          noValidate
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
                className="w-full rounded-lg border border-morning-300 bg-white px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
              {errors.full_name && (
                <span className="mt-1 block text-xs text-red-700">{errors.full_name}</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-walnut-800 mb-1">
                Roll / Registration Number *
              </span>
              <input
                type="text"
                value={form.roll_number}
                onChange={(e) => setForm((f) => ({ ...f, roll_number: e.target.value }))}
                className="w-full rounded-lg border border-morning-300 bg-white px-3 py-2 text-sm font-mono text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
              {errors.roll_number && (
                <span className="mt-1 block text-xs text-red-700">{errors.roll_number}</span>
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
                className="w-full rounded-lg border border-morning-300 bg-white px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
              {errors.department && (
                <span className="mt-1 block text-xs text-red-700">{errors.department}</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-walnut-800 mb-1">
                Academic Year / Term
              </span>
              <input
                type="text"
                value={form.academic_year}
                onChange={(e) => setForm((f) => ({ ...f, academic_year: e.target.value }))}
                className="w-full rounded-lg border border-morning-300 bg-white px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-xs font-semibold text-walnut-800 mb-1">
              Portfolio Headline *
            </span>
            <input
              type="text"
              value={form.portfolio_headline}
              onChange={(e) => setForm((f) => ({ ...f, portfolio_headline: e.target.value }))}
              className="w-full rounded-lg border border-morning-300 bg-white px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
            />
            {errors.portfolio_headline && (
              <span className="mt-1 block text-xs text-red-700">{errors.portfolio_headline}</span>
            )}
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-walnut-800 mb-1">Academic Bio</span>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="w-full rounded-lg border border-morning-300 bg-white px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-walnut-800 mb-1">
              Skills (comma-separated)
            </span>
            <input
              type="text"
              value={form.skillsText}
              onChange={(e) => setForm((f) => ({ ...f, skillsText: e.target.value }))}
              placeholder="TypeScript, React, Embedded C, Research Methods"
              className="w-full rounded-lg border border-morning-300 bg-white px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs font-semibold text-walnut-800 mb-1">GitHub URL</span>
              <input
                type="url"
                value={form.github_url}
                onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
                placeholder="https://github.com/username"
                className="w-full rounded-lg border border-morning-300 bg-white px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
              {errors.github_url && (
                <span className="mt-1 block text-xs text-red-700">{errors.github_url}</span>
              )}
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-walnut-800 mb-1">LinkedIn URL</span>
              <input
                type="url"
                value={form.linkedin_url}
                onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-morning-300 bg-white px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
              {errors.linkedin_url && (
                <span className="mt-1 block text-xs text-red-700">{errors.linkedin_url}</span>
              )}
            </label>
          </div>

          <div className="pt-4 border-t border-morning-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-walnut-800 bg-morning-100 hover:bg-morning-200 rounded-lg transition-colors"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-60 rounded-lg transition-colors"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              {isBusy ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
