import type {
  Activity,
  ActivityCategory,
  ActivityEvidence,
  ActivityReview,
  AppRoute,
  DemoDatabaseState,
  Profile,
  Project,
  ReviewDecision,
  StudentProgressSummary,
  UserRole,
} from '../types/truefolio';
import { DEMO_IDS, INITIAL_DEMO_STATE } from './seedData';

const STORAGE_KEY = 'truefolio_demo_db_v1';
const SESSION_KEY = 'truefolio_demo_session_v1';

export const MAX_EVIDENCE_FILE_BYTES = 2 * 1024 * 1024; // 2 MB browser storage safeguard
export const ALLOWED_EVIDENCE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
] as const;

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'Research',
  'Internship',
  'Competition',
  'Community',
  'Workshop',
  'Leadership',
];

export const TARGET_PORTFOLIO_CREDITS = 8.0;

export interface DemoSession {
  activeRole: UserRole | null;
  activeUserId: string | null;
  lastRoute: AppRoute;
}

function cloneSeedState(): DemoDatabaseState {
  return JSON.parse(JSON.stringify(INITIAL_DEMO_STATE)) as DemoDatabaseState;
}

export function loadDemoState(): DemoDatabaseState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = cloneSeedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as DemoDatabaseState;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.profiles)) {
      const seeded = cloneSeedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed;
  } catch {
    return cloneSeedState();
  }
}

export function saveDemoState(state: DemoDatabaseState): { ok: true } | { ok: false; error: string } {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (err) {
    const isQuota =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return {
      ok: false,
      error: isQuota
        ? 'Browser storage quota exceeded. Remove large attachments or reset demo data to continue.'
        : 'Unable to persist demo changes to browser storage.',
    };
  }
}

export function resetDemoState(): DemoDatabaseState {
  const seeded = cloneSeedState();
  saveDemoState(seeded);
  return seeded;
}

export function loadDemoSession(): DemoSession {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return {
        activeRole: null,
        activeUserId: null,
        lastRoute: { view: 'portal' },
      };
    }
    const parsed = JSON.parse(raw) as DemoSession;
    return {
      activeRole: parsed.activeRole ?? null,
      activeUserId: parsed.activeUserId ?? null,
      lastRoute: parsed.lastRoute ?? { view: 'portal' },
    };
  } catch {
    return {
      activeRole: null,
      activeUserId: null,
      lastRoute: { view: 'portal' },
    };
  }
}

export function saveDemoSession(session: DemoSession): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage write errors for session pointer
  }
}

export function generateDemoId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function computeStudentProgress(
  studentId: string,
  state: DemoDatabaseState
): StudentProgressSummary {
  const studentActivities = state.activities.filter((a) => a.student_id === studentId);
  const studentProjects = state.projects.filter((p) => p.student_id === studentId);
  const studentEvidence = state.activity_evidence.filter((e) => e.student_id === studentId);

  const draftCount = studentActivities.filter((a) => a.status === 'draft').length;
  const submittedCount = studentActivities.filter((a) => a.status === 'submitted').length;
  const changesRequestedCount = studentActivities.filter(
    (a) => a.status === 'changes_requested'
  ).length;
  const approvedActivities = studentActivities.filter((a) => a.status === 'approved');
  const approvedCount = approvedActivities.length;
  const rejectedCount = studentActivities.filter((a) => a.status === 'rejected').length;

  const verifiedHours = approvedActivities.reduce((sum, a) => sum + Number(a.hours || 0), 0);
  const totalLoggedHours = studentActivities.reduce((sum, a) => sum + Number(a.hours || 0), 0);
  const verifiedCredits = Number(
    approvedActivities.reduce((sum, a) => sum + Number(a.credits || 0), 0).toFixed(1)
  );
  const creditCompletionPct = Math.min(
    100,
    Math.round((verifiedCredits / TARGET_PORTFOLIO_CREDITS) * 100)
  );

  const categoryBreakdown = ACTIVITY_CATEGORIES.map((category) => {
    const inCat = studentActivities.filter((a) => a.category === category);
    const verified = inCat.filter((a) => a.status === 'approved');
    const pending = inCat.filter(
      (a) => a.status === 'submitted' || a.status === 'changes_requested'
    );
    return {
      category,
      verifiedHours: verified.reduce((sum, a) => sum + Number(a.hours || 0), 0),
      verifiedCount: verified.length,
      pendingCount: pending.length,
    };
  });

  const verifiedResearchCount = approvedActivities.filter(
    (a) => a.category === 'Research'
  ).length;
  const distinctVerifiedCategories = new Set(approvedActivities.map((a) => a.category)).size;

  const achievements = [
    {
      id: 'ach-first-verified',
      title: 'First Verified Record',
      criteria: 'Complete faculty approval on at least 1 activity',
      earned: approvedCount >= 1,
      progressCurrent: Math.min(approvedCount, 1),
      progressTarget: 1,
      unit: 'activity',
    },
    {
      id: 'ach-hours-100',
      title: 'Century of Practice',
      criteria: 'Accumulate 100+ verified experiential hours',
      earned: verifiedHours >= 100,
      progressCurrent: Math.min(verifiedHours, 100),
      progressTarget: 100,
      unit: 'hrs',
    },
    {
      id: 'ach-scholar-track',
      title: 'Applied Inquiry Fellow',
      criteria: 'Earn approval on a formal Research activity',
      earned: verifiedResearchCount >= 1,
      progressCurrent: Math.min(verifiedResearchCount, 1),
      progressTarget: 1,
      unit: 'research',
    },
    {
      id: 'ach-portfolio-builder',
      title: 'Shipped Portfolio',
      criteria: 'Publish 2+ documented projects with live demo URLs',
      earned: studentProjects.filter((p) => Boolean(p.demo_url.trim())).length >= 2,
      progressCurrent: Math.min(
        studentProjects.filter((p) => Boolean(p.demo_url.trim())).length,
        2
      ),
      progressTarget: 2,
      unit: 'projects',
    },
    {
      id: 'ach-interdisciplinary',
      title: 'Cross-Disciplinary Breadth',
      criteria: 'Hold approved records across 3+ activity categories',
      earned: distinctVerifiedCategories >= 3,
      progressCurrent: Math.min(distinctVerifiedCategories, 3),
      progressTarget: 3,
      unit: 'categories',
    },
    {
      id: 'ach-honours-credits',
      title: 'Honours Track Threshold',
      criteria: `Reach ${TARGET_PORTFOLIO_CREDITS.toFixed(1)} verified portfolio credits`,
      earned: verifiedCredits >= TARGET_PORTFOLIO_CREDITS,
      progressCurrent: Math.min(verifiedCredits, TARGET_PORTFOLIO_CREDITS),
      progressTarget: TARGET_PORTFOLIO_CREDITS,
      unit: 'credits',
    },
  ];

  return {
    totalActivities: studentActivities.length,
    draftCount,
    submittedCount,
    changesRequestedCount,
    approvedCount,
    rejectedCount,
    verifiedHours,
    totalLoggedHours,
    verifiedCredits,
    targetCredits: TARGET_PORTFOLIO_CREDITS,
    creditCompletionPct,
    projectCount: studentProjects.length,
    evidenceCount: studentEvidence.length,
    categoryBreakdown,
    achievements,
  };
}

export function validateEvidenceFile(file: File): string | null {
  const mime = file.type || inferMimeFromName(file.name);
  if (!ALLOWED_EVIDENCE_MIME_TYPES.includes(mime as (typeof ALLOWED_EVIDENCE_MIME_TYPES)[number])) {
    return `Unsupported file type (${file.name}). Upload PNG, JPG, WebP, SVG, PDF, or TXT files.`;
  }
  if (file.size > MAX_EVIDENCE_FILE_BYTES) {
    return `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(2)} MB. Demo mode limits files to 2.00 MB.`;
  }
  if (file.size === 0) {
    return `"${file.name}" appears to be empty.`;
  }
  return null;
}

export function inferMimeFromName(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.txt')) return 'text/plain';
  return 'application/octet-stream';
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file contents.'));
      }
    };
    reader.onerror = () => reject(new Error(`Unable to read "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

export function getAssignedStudentsForFaculty(
  facultyId: string,
  state: DemoDatabaseState
): Profile[] {
  const assignedIds = new Set(
    state.faculty_student_assignments
      .filter((a) => a.faculty_id === facultyId)
      .map((a) => a.student_id)
  );
  return state.profiles.filter((p) => assignedIds.has(p.id));
}

export function getDemoStudentProfiles(state: DemoDatabaseState): Profile[] {
  const studentRoleIds = new Set(
    state.user_roles.filter((r) => r.role === 'student').map((r) => r.user_id)
  );
  return state.profiles.filter((p) => studentRoleIds.has(p.id));
}

export function getDemoFacultyProfile(state: DemoDatabaseState): Profile {
  return (
    state.profiles.find((p) => p.id === DEMO_IDS.facultyKavita) ?? state.profiles[0]
  );
}

/**
 * Mirrors the real PostgreSQL `apply_activity_review` trigger atomically in demo mode:
 * - Inserts a row into `activity_reviews` with `feedback`
 * - Updates `activities.status` and `activities.reviewed_at`
 */
export function applyDemoActivityReview(
  state: DemoDatabaseState,
  params: {
    activityId: string;
    reviewerId: string;
    decision: ReviewDecision;
    feedback: string;
  }
): DemoDatabaseState {
  const now = new Date().toISOString();
  const review: ActivityReview = {
    id: generateDemoId('rev'),
    activity_id: params.activityId,
    reviewer_id: params.reviewerId,
    decision: params.decision,
    feedback: params.feedback.trim(),
    created_at: now,
  };

  const nextActivities: Activity[] = state.activities.map((act) =>
    act.id === params.activityId
      ? {
          ...act,
          status: params.decision,
          reviewed_at: now,
          updated_at: now,
        }
      : act
  );

  return {
    ...state,
    activities: nextActivities,
    activity_reviews: [review, ...state.activity_reviews],
  };
}

export function createEvidenceRecord(params: {
  activityId: string;
  studentId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  previewDataUrl: string;
}): ActivityEvidence {
  const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return {
    id: generateDemoId('ev'),
    activity_id: params.activityId,
    student_id: params.studentId,
    file_name: params.fileName,
    file_path: `activity-evidence/${params.studentId}/${params.activityId}/${safeName}`,
    mime_type: params.mimeType,
    file_size: params.fileSize,
    uploaded_at: new Date().toISOString(),
    preview_data_url: params.previewDataUrl,
  };
}

export function updateProfileRecord(
  state: DemoDatabaseState,
  userId: string,
  patch: Partial<Profile>
): DemoDatabaseState {
  const now = new Date().toISOString();
  return {
    ...state,
    profiles: state.profiles.map((p) =>
      p.id === userId ? { ...p, ...patch, updated_at: now } : p
    ),
  };
}

export function upsertProjectRecord(
  state: DemoDatabaseState,
  project: Project
): DemoDatabaseState {
  const exists = state.projects.some((p) => p.id === project.id);
  const nextProjects = exists
    ? state.projects.map((p) => (p.id === project.id ? project : p))
    : [project, ...state.projects];
  return {
    ...state,
    projects: nextProjects,
  };
}
