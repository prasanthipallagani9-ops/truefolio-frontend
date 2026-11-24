import type {
  Activity,
  ActivityEvidence,
  ActivityReview,
  Profile,
  Project,
  ReviewDecision,
} from '../../types/truefolio';
import { SUPABASE_SCHEMA_CONTRACT } from './client';

/**
 * Isolated Supabase Service Architecture (Inactive in Prototype Demo Mode)
 *
 * Documents the exact production contract against the real Lovable Cloud database:
 * - `profiles.id = auth.uid()` in RLS policies
 * - `activities.student_id = auth.uid()` in student RLS policies
 * - `activity_reviews` writes `feedback` and relies on the `apply_activity_review` trigger
 *   to synchronize `activities.status`
 * - `activity_evidence` stores `file_path` and `uploaded_at` referencing the private
 *   `activity-evidence` storage bucket
 * - `projects` stores `demo_url`
 */
export interface TruefolioDataService {
  readonly mode: 'demo' | 'supabase';
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, patch: Partial<Profile>): Promise<Profile>;
  listStudentActivities(studentId: string): Promise<Activity[]>;
  saveActivity(activity: Activity): Promise<Activity>;
  deleteActivity(activityId: string): Promise<void>;
  listActivityEvidence(activityId: string): Promise<ActivityEvidence[]>;
  listActivityReviews(activityId: string): Promise<ActivityReview[]>;
  submitFacultyReview(params: {
    activityId: string;
    reviewerId: string;
    decision: ReviewDecision;
    feedback: string;
  }): Promise<ActivityReview>;
  listStudentProjects(studentId: string): Promise<Project[]>;
  saveProject(project: Project): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;
}

export class SupabaseNotConnectedError extends Error {
  constructor(operation: string) {
    super(
      `Supabase integration (${SUPABASE_SCHEMA_CONTRACT.tables.activities}) is isolated in prototype mode. Operation "${operation}" runs against the local demo store instead.`
    );
    this.name = 'SupabaseNotConnectedError';
  }
}

export const truefolioSupabaseService: TruefolioDataService = {
  mode: 'supabase',
  async getProfile() {
    throw new SupabaseNotConnectedError('getProfile');
  },
  async updateProfile() {
    throw new SupabaseNotConnectedError('updateProfile');
  },
  async listStudentActivities() {
    throw new SupabaseNotConnectedError('listStudentActivities');
  },
  async saveActivity() {
    throw new SupabaseNotConnectedError('saveActivity');
  },
  async deleteActivity() {
    throw new SupabaseNotConnectedError('deleteActivity');
  },
  async listActivityEvidence() {
    throw new SupabaseNotConnectedError('listActivityEvidence');
  },
  async listActivityReviews() {
    throw new SupabaseNotConnectedError('listActivityReviews');
  },
  async submitFacultyReview() {
    throw new SupabaseNotConnectedError('submitFacultyReview');
  },
  async listStudentProjects() {
    throw new SupabaseNotConnectedError('listStudentProjects');
  },
  async saveProject() {
    throw new SupabaseNotConnectedError('saveProject');
  },
  async deleteProject() {
    throw new SupabaseNotConnectedError('deleteProject');
  },
};
