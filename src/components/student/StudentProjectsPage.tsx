import React, { useMemo, useState } from 'react';
import { ExternalLink, GitBranch, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import type { Project } from '../../types/truefolio';
import { formatShortDate, LoadingRows, StatusText } from '../ui/CommonUI';

interface ProjectFormState {
  id?: string;
  title: string;
  tagline: string;
  description: string;
  techStackText: string;
  role_label: string;
  demo_url: string;
  repo_url: string;
  semester: string;
  featured: boolean;
  linked_activity_id: string;
}

const EMPTY_PROJECT: ProjectFormState = {
  title: '',
  tagline: '',
  description: '',
  techStackText: '',
  role_label: '',
  demo_url: '',
  repo_url: '',
  semester: 'Autumn 2026',
  featured: false,
  linked_activity_id: '',
};

export function StudentProjectsPage() {
  const { db, activeProfile, isHydrating, isBusy, saveProject, deleteProject } = useDemo();
  const studentId = activeProfile?.id ?? '';

  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<ProjectFormState>(EMPTY_PROJECT);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormState, string>>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'featured'>('all');

  const studentProjects = useMemo(
    () =>
      db.projects
        .filter((p) => p.student_id === studentId)
        .filter((p) => (filterMode === 'featured' ? p.featured : true))
        .sort((a, b) => Number(b.featured) - Number(a.featured) || b.updated_at.localeCompare(a.updated_at)),
    [db.projects, studentId, filterMode]
  );

  const studentActivities = useMemo(
    () => db.activities.filter((a) => a.student_id === studentId),
    [db.activities, studentId]
  );

  if (isHydrating || !activeProfile) {
    return <LoadingRows count={3} />;
  }

  const openCreate = () => {
    setForm(EMPTY_PROJECT);
    setErrors({});
    setEditorOpen(true);
  };

  const openEdit = (proj: Project) => {
    setForm({
      id: proj.id,
      title: proj.title,
      tagline: proj.tagline,
      description: proj.description,
      techStackText: proj.tech_stack.join(', '),
      role_label: proj.role_label,
      demo_url: proj.demo_url,
      repo_url: proj.repo_url,
      semester: proj.semester,
      featured: proj.featured,
      linked_activity_id: proj.linked_activity_id ?? '',
    });
    setErrors({});
    setEditorOpen(true);
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof ProjectFormState, string>> = {};
    if (!form.title.trim()) next.title = 'Project title is required.';
    if (!form.tagline.trim()) next.tagline = 'Short tagline is required.';
    if (!form.description.trim() || form.description.trim().length < 15) {
      next.description = 'Provide a clear project summary (15+ characters).';
    }
    if (!form.role_label.trim()) next.role_label = 'Your role on the project is required.';
    if (form.demo_url.trim() && !/^https?:\/\//i.test(form.demo_url.trim())) {
      next.demo_url = 'Demo URL must start with http:// or https://';
    }
    if (form.repo_url.trim() && !/^https?:\/\//i.test(form.repo_url.trim())) {
      next.repo_url = 'Repository URL must start with http:// or https://';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const techStack = form.techStackText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const saved = await saveProject({
      id: form.id,
      student_id: studentId,
      title: form.title.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      tech_stack: techStack,
      role_label: form.role_label.trim(),
      demo_url: form.demo_url.trim(),
      repo_url: form.repo_url.trim(),
      semester: form.semester.trim() || 'Autumn 2026',
      featured: form.featured,
      linked_activity_id: form.linked_activity_id || null,
    });

    if (saved) {
      setEditorOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-walnut-900">
            Portfolio Projects
          </h1>
          <p className="text-sm text-walnut-600 mt-1">
            Document technical builds, live demo URLs, and link them to verified experiential activities.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Project
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterMode === 'all'
              ? 'bg-walnut-900 text-white'
              : 'bg-white border border-morning-200 text-walnut-700 hover:bg-morning-100'
          }`}
        >
          All Projects ({db.projects.filter((p) => p.student_id === studentId).length})
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('featured')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterMode === 'featured'
              ? 'bg-walnut-900 text-white'
              : 'bg-white border border-morning-200 text-walnut-700 hover:bg-morning-100'
          }`}
        >
          Featured Only
        </button>
      </div>

      {studentProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-morning-300 bg-white p-12 text-center">
          <p className="font-display text-lg font-semibold text-walnut-900">
            No projects in this view
          </p>
          <p className="text-xs text-walnut-600 mt-1 max-w-md mx-auto">
            {filterMode === 'featured'
              ? 'No projects are marked as featured yet. Switch to All Projects or edit a project to feature it.'
              : 'Showcase capstone builds, research tools, or open-source work with live demo links.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {filterMode === 'featured' && (
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className="px-4 py-2 text-xs font-medium text-walnut-800 bg-morning-100 rounded-lg"
              >
                Show All Projects
              </button>
            )}
            <button
              type="button"
              onClick={openCreate}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
            >
              Add First Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studentProjects.map((proj) => {
            const linkedAct = proj.linked_activity_id
              ? studentActivities.find((a) => a.id === proj.linked_activity_id)
              : undefined;

            return (
              <article
                key={proj.id}
                className="rounded-xl border border-morning-200 bg-white p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-mono text-walnut-600">
                        {proj.semester} · {proj.role_label}
                        {proj.featured ? ' · Featured' : ''}
                      </p>
                      <h2 className="font-display text-xl font-semibold text-walnut-900 mt-1">
                        {proj.title}
                      </h2>
                    </div>
                    {proj.featured && (
                      <Star
                        className="h-4 w-4 text-amber-600 fill-amber-500 shrink-0 mt-1"
                        aria-label="Featured project"
                      />
                    )}
                  </div>

                  <p className="text-sm font-medium text-walnut-800">{proj.tagline}</p>
                  <p className="text-xs text-walnut-600 leading-relaxed">{proj.description}</p>

                  {proj.tech_stack.length > 0 && (
                    <p className="text-xs font-mono text-walnut-700 pt-1">
                      Stack: {proj.tech_stack.join(' · ')}
                    </p>
                  )}

                  {linkedAct && (
                    <div className="pt-2 border-t border-morning-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-walnut-600 truncate">
                        Linked record: <strong className="text-walnut-900">{linkedAct.title}</strong>
                      </span>
                      <StatusText status={linkedAct.status} />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-morning-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {proj.demo_url ? (
                      <a
                        href={proj.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:underline"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-walnut-500">No demo URL</span>
                    )}

                    {proj.repo_url && (
                      <a
                        href={proj.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-walnut-700 hover:text-walnut-900 hover:underline"
                      >
                        <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Repository</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(proj)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-walnut-800 bg-morning-100 hover:bg-morning-200 rounded-lg"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </button>

                    {confirmDeleteId === proj.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={async () => {
                            await deleteProject(proj.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1.5 text-xs text-walnut-700 bg-morning-100 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(proj.id)}
                        aria-label={`Delete ${proj.title}`}
                        className="p-1.5 text-walnut-500 hover:text-red-700 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] font-mono text-walnut-500 -mt-2">
                  Updated {formatShortDate(proj.updated_at)}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {editorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-walnut-950/60 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-editor-title"
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-xl bg-white border border-morning-200 shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-morning-200 bg-morning-50">
              <h2
                id="project-editor-title"
                className="font-display text-xl font-semibold text-walnut-900"
              >
                {form.id ? 'Edit Portfolio Project' : 'Add Portfolio Project'}
              </h2>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                aria-label="Close project editor"
                className="p-1.5 rounded-lg text-walnut-700 hover:bg-morning-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <label className="block">
                <span className="block text-xs font-semibold text-walnut-800 mb-1">
                  Project Title *
                </span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., AirSense Campus Mesh"
                  className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                />
                {errors.title && (
                  <span className="mt-1 block text-xs text-red-700">{errors.title}</span>
                )}
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-walnut-800 mb-1">
                  One-Line Tagline *
                </span>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  placeholder="Concise summary of what the project accomplishes"
                  className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                />
                {errors.tagline && (
                  <span className="mt-1 block text-xs text-red-700">{errors.tagline}</span>
                )}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-walnut-800 mb-1">
                    Your Role *
                  </span>
                  <input
                    type="text"
                    value={form.role_label}
                    onChange={(e) => setForm((f) => ({ ...f, role_label: e.target.value }))}
                    placeholder="e.g., Full-Stack Lead"
                    className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                  />
                  {errors.role_label && (
                    <span className="mt-1 block text-xs text-red-700">{errors.role_label}</span>
                  )}
                </label>

                <label className="block">
                  <span className="block text-xs font-semibold text-walnut-800 mb-1">
                    Term / Semester
                  </span>
                  <input
                    type="text"
                    value={form.semester}
                    onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                    placeholder="Autumn 2026"
                    className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-xs font-semibold text-walnut-800 mb-1">
                  Description *
                </span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Architecture, problem solved, and measurable impact..."
                  className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                />
                {errors.description && (
                  <span className="mt-1 block text-xs text-red-700">{errors.description}</span>
                )}
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-walnut-800 mb-1">
                  Tech Stack / Methods (comma-separated)
                </span>
                <input
                  type="text"
                  value={form.techStackText}
                  onChange={(e) => setForm((f) => ({ ...f, techStackText: e.target.value }))}
                  placeholder="TypeScript, React, Python, PostgreSQL"
                  className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-walnut-800 mb-1">
                    Live Demo URL (demo_url)
                  </span>
                  <input
                    type="url"
                    value={form.demo_url}
                    onChange={(e) => setForm((f) => ({ ...f, demo_url: e.target.value }))}
                    placeholder="https://project-demo.example.edu"
                    className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                  />
                  {errors.demo_url && (
                    <span className="mt-1 block text-xs text-red-700">{errors.demo_url}</span>
                  )}
                </label>

                <label className="block">
                  <span className="block text-xs font-semibold text-walnut-800 mb-1">
                    Repository URL
                  </span>
                  <input
                    type="url"
                    value={form.repo_url}
                    onChange={(e) => setForm((f) => ({ ...f, repo_url: e.target.value }))}
                    placeholder="https://github.com/username/project"
                    className="w-full rounded-lg border border-morning-300 px-3 py-2 text-sm text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                  />
                  {errors.repo_url && (
                    <span className="mt-1 block text-xs text-red-700">{errors.repo_url}</span>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <label className="block">
                  <span className="block text-xs font-semibold text-walnut-800 mb-1">
                    Link to Activity Record (Optional)
                  </span>
                  <select
                    value={form.linked_activity_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, linked_activity_id: e.target.value }))
                    }
                    className="w-full rounded-lg border border-morning-300 bg-white px-3 py-2 text-xs text-walnut-900 focus-visible:outline-2 focus-visible:outline-amber-600"
                  >
                    <option value="">None</option>
                    {studentActivities.map((act) => (
                      <option key={act.id} value={act.id}>
                        {act.title} ({act.status})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2.5 pt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="h-4 w-4 accent-amber-600 rounded"
                  />
                  <span className="text-xs font-medium text-walnut-800">
                    Feature this project at top of portfolio
                  </span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-morning-200 bg-morning-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                disabled={isBusy}
                className="px-4 py-2 text-xs font-medium text-walnut-800 bg-white border border-morning-300 hover:bg-morning-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-60 rounded-lg"
              >
                {isBusy ? 'Saving...' : form.id ? 'Update Project' : 'Save Project'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
