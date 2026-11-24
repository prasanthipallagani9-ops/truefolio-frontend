export type UserRole = 'student' | 'faculty';

export type ActivityStatus =
  | 'draft'
  | 'submitted'
  | 'changes_requested'
  | 'approved'
  | 'rejected';

export type ReviewDecision = 'approved' | 'changes_requested' | 'rejected';

export type ActivityCategory =
  | 'Research'
  | 'Internship'
  | 'Competition'
  | 'Community'
  | 'Workshop'
  | 'Leadership';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  department: string;
  academic_year?: string;
  roll_number?: string;
  designation?: string;
  office_hours?: string;
  portfolio_headline: string;
  bio: string;
  skills: string[];
  github_url: string;
  linkedin_url: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
}

export interface FacultyStudentAssignment {
  id: string;
  faculty_id: string;
  student_id: string;
  cohort_term: string;
  assigned_at: string;
}

export interface Activity {
  id: string;
  student_id: string;
  title: string;
  category: ActivityCategory;
  organization: string;
  activity_date: string;
  hours: number;
  credits: number;
  description: string;
  outcomes: string;
  status: ActivityStatus;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export interface ActivityEvidence {
  id: string;
  activity_id: string;
  student_id: string;
  file_name: string;
  /** Matches confirmed real schema column `file_path` in private bucket `activity-evidence` */
  file_path: string;
  mime_type: string;
  file_size: number;
  /** Matches confirmed real schema column `uploaded_at` */
  uploaded_at: string;
  /** Local browser preview data URL used strictly in Demo Mode */
  preview_data_url?: string;
}

export interface ActivityReview {
  id: string;
  activity_id: string;
  reviewer_id: string;
  decision: ReviewDecision;
  /** Matches confirmed real schema column `feedback` */
  feedback: string;
  created_at: string;
}

export interface Project {
  id: string;
  student_id: string;
  title: string;
  tagline: string;
  description: string;
  tech_stack: string[];
  role_label: string;
  /** Matches confirmed real schema column `demo_url` */
  demo_url: string;
  repo_url: string;
  semester: string;
  featured: boolean;
  linked_activity_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AchievementMilestone {
  id: string;
  title: string;
  criteria: string;
  earned: boolean;
  progressCurrent: number;
  progressTarget: number;
  unit: string;
}

export interface CategoryProgress {
  category: ActivityCategory;
  verifiedHours: number;
  verifiedCount: number;
  pendingCount: number;
}

export interface StudentProgressSummary {
  totalActivities: number;
  draftCount: number;
  submittedCount: number;
  changesRequestedCount: number;
  approvedCount: number;
  rejectedCount: number;
  verifiedHours: number;
  totalLoggedHours: number;
  verifiedCredits: number;
  targetCredits: number;
  creditCompletionPct: number;
  projectCount: number;
  evidenceCount: number;
  categoryBreakdown: CategoryProgress[];
  achievements: AchievementMilestone[];
}

export interface DemoDatabaseState {
  version: number;
  profiles: Profile[];
  user_roles: UserRoleRecord[];
  faculty_student_assignments: FacultyStudentAssignment[];
  activities: Activity[];
  activity_evidence: ActivityEvidence[];
  activity_reviews: ActivityReview[];
  projects: Project[];
}

export type StudentRoute =
  | 'overview'
  | 'activities'
  | 'evidence'
  | 'projects'
  | 'profile';

export type FacultyRoute =
  | 'overview'
  | 'reviews'
  | 'students'
  | 'student-detail'
  | 'profile';

export type AppRoute =
  | { view: 'portal' }
  | { view: 'student'; page: StudentRoute }
  | { view: 'faculty'; page: FacultyRoute; studentId?: string };
