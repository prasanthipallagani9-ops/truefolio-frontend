/**
 * Isolated Supabase configuration placeholder.
 *
 * IMPORTANT: In Prototype Demo Mode, TRUEFOLIO does NOT connect to or mutate
 * the live Lovable Cloud / Supabase database. This module is kept strictly
 * isolated and uninvoked so future production integration can bind to
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY without refactoring the UI.
 */

export const SUPABASE_SCHEMA_CONTRACT = {
  tables: {
    profiles: 'profiles',
    userRoles: 'user_roles',
    facultyStudentAssignments: 'faculty_student_assignments',
    activities: 'activities',
    activityEvidence: 'activity_evidence',
    activityReviews: 'activity_reviews',
    projects: 'projects',
  },
  storageBuckets: {
    activityEvidence: 'activity-evidence',
  },
  triggers: {
    applyActivityReview: 'apply_activity_review',
  },
} as const;

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey);
}
