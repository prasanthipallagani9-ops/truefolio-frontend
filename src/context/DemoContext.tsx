import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyDemoActivityReview,
  createEvidenceRecord,
  generateDemoId,
  getAssignedStudentsForFaculty,
  getDemoFacultyProfile,
  getDemoStudentProfiles,
  loadDemoSession,
  loadDemoState,
  resetDemoState,
  saveDemoSession,
  saveDemoState,
  updateProfileRecord,
  upsertProjectRecord,
} from '../demo/demoStore';
import { DEMO_IDS } from '../demo/seedData';
import type {
  Activity,
  ActivityEvidence,
  AppRoute,
  DemoDatabaseState,
  FacultyRoute,
  Profile,
  Project,
  ReviewDecision,
  StudentRoute,
  UserRole,
} from '../types/truefolio';

interface ToastMessage {
  id: string;
  tone: 'success' | 'error' | 'info';
  text: string;
}

interface DemoContextValue {
  db: DemoDatabaseState;
  isHydrating: boolean;
  isBusy: boolean;
  storageError: string | null;
  clearStorageError: () => void;
  activeRole: UserRole | null;
  activeUserId: string | null;
  activeProfile: Profile | null;
  route: AppRoute;
  roleMismatchTarget: UserRole | null;
  studentProfiles: Profile[];
  facultyProfile: Profile;
  assignedStudents: Profile[];
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  enterStudentDemo: (studentId?: string, page?: StudentRoute) => void;
  enterFacultyDemo: (page?: FacultyRoute, studentId?: string) => void;
  exitToPortal: () => void;
  navigate: (nextRoute: AppRoute) => void;
  resetAllDemoData: () => void;
  updateProfile: (userId: string, patch: Partial<Profile>) => Promise<boolean>;
  saveActivity: (
    activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'> & { id?: string },
    submitImmediately?: boolean
  ) => Promise<Activity | null>;
  submitActivityForReview: (activityId: string) => Promise<boolean>;
  withdrawActivityToDraft: (activityId: string) => Promise<boolean>;
  deleteActivity: (activityId: string) => Promise<boolean>;
  attachEvidence: (params: {
    activityId: string;
    studentId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    previewDataUrl: string;
  }) => Promise<ActivityEvidence | null>;
  removeEvidence: (evidenceId: string) => Promise<boolean>;
  saveProject: (
    project: Omit<Project, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
  reviewActivity: (params: {
    activityId: string;
    decision: ReviewDecision;
    feedback: string;
  }) => Promise<boolean>;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function parseHashRoute(): AppRoute {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (!hash || hash === 'portal') return { view: 'portal' };

  const parts = hash.split('/').filter(Boolean);
  if (parts[0] === 'student') {
    const validPages: StudentRoute[] = [
      'overview',
      'activities',
      'evidence',
      'projects',
      'profile',
    ];
    const page = validPages.includes(parts[1] as StudentRoute)
      ? (parts[1] as StudentRoute)
      : 'overview';
    return { view: 'student', page };
  }

  if (parts[0] === 'faculty') {
    const validPages: FacultyRoute[] = [
      'overview',
      'reviews',
      'students',
      'student-detail',
      'profile',
    ];
    const page = validPages.includes(parts[1] as FacultyRoute)
      ? (parts[1] as FacultyRoute)
      : 'overview';
    return {
      view: 'faculty',
      page,
      studentId: parts[2] ? decodeURIComponent(parts[2]) : undefined,
    };
  }

  return { view: 'portal' };
}

function serializeRouteHash(route: AppRoute): string {
  if (route.view === 'portal') return '#/portal';
  if (route.view === 'student') return `#/student/${route.page}`;
  if (route.page === 'student-detail' && route.studentId) {
    return `#/faculty/student-detail/${encodeURIComponent(route.studentId)}`;
  }
  return `#/faculty/${route.page}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DemoDatabaseState>(() => loadDemoState());
  const [isHydrating, setIsHydrating] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const initialSession = useMemo(() => loadDemoSession(), []);
  const [activeRole, setActiveRole] = useState<UserRole | null>(initialSession.activeRole);
  const [activeUserId, setActiveUserId] = useState<string | null>(initialSession.activeUserId);

  const [route, setRoute] = useState<AppRoute>(() => {
    const fromHash = parseHashRoute();
    if (fromHash.view !== 'portal') return fromHash;
    if (initialSession.activeRole && initialSession.lastRoute.view !== 'portal') {
      return initialSession.lastRoute;
    }
    return { view: 'portal' };
  });

  const pushToast = useCallback((tone: ToastMessage['tone'], text: string) => {
    const id = generateDemoId('toast');
    setToasts((prev) => [...prev, { id, tone, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Brief realistic initial hydration state
  useEffect(() => {
    const timer = window.setTimeout(() => setIsHydrating(false), 180);
    return () => window.clearTimeout(timer);
  }, []);

  // Keep hash and session synchronized
  useEffect(() => {
    const expectedHash = serializeRouteHash(route);
    if (window.location.hash !== expectedHash) {
      window.location.hash = expectedHash;
    }
    saveDemoSession({
      activeRole,
      activeUserId,
      lastRoute: route,
    });
  }, [route, activeRole, activeUserId]);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashRoute());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const commitDb = useCallback(
    (updater: (prev: DemoDatabaseState) => DemoDatabaseState): boolean => {
      let success = true;
      setDb((prev) => {
        const next = updater(prev);
        const result = saveDemoState(next);
        if (!result.ok) {
          success = false;
          setStorageError(result.error);
          pushToast('error', result.error);
          return prev;
        }
        setStorageError(null);
        return next;
      });
      return success;
    },
    [pushToast]
  );

  const enterStudentDemo = useCallback(
    (studentId: string = DEMO_IDS.studentAarav, page: StudentRoute = 'overview') => {
      setActiveRole('student');
      setActiveUserId(studentId);
      setRoute({ view: 'student', page });
      const student = db.profiles.find((p) => p.id === studentId);
      pushToast('info', `Entered Student Demo as ${student?.full_name ?? 'Student'}.`);
    },
    [db.profiles, pushToast]
  );

  const enterFacultyDemo = useCallback(
    (page: FacultyRoute = 'overview', studentId?: string) => {
      setActiveRole('faculty');
      setActiveUserId(DEMO_IDS.facultyKavita);
      setRoute({ view: 'faculty', page, studentId });
      pushToast('info', 'Entered Faculty Demo as Dr. Kavita Sharma.');
    },
    [pushToast]
  );

  const exitToPortal = useCallback(() => {
    setActiveRole(null);
    setActiveUserId(null);
    setRoute({ view: 'portal' });
  }, []);

  const navigate = useCallback((nextRoute: AppRoute) => {
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const resetAllDemoData = useCallback(() => {
    const fresh = resetDemoState();
    setDb(fresh);
    setStorageError(null);
    pushToast('success', 'Demo data restored to original seeded academic records.');
  }, [pushToast]);

  const updateProfile = useCallback(
    async (userId: string, patch: Partial<Profile>) => {
      setIsBusy(true);
      await delay(140);
      const ok = commitDb((prev) => updateProfileRecord(prev, userId, patch));
      setIsBusy(false);
      if (ok) pushToast('success', 'Profile saved to local demo storage.');
      return ok;
    },
    [commitDb, pushToast]
  );

  const saveActivity = useCallback(
    async (
      input: Omit<Activity, 'id' | 'created_at' | 'updated_at'> & { id?: string },
      submitImmediately = false
    ): Promise<Activity | null> => {
      setIsBusy(true);
      await delay(160);
      const now = new Date().toISOString();
      const existing = input.id ? db.activities.find((a) => a.id === input.id) : undefined;
      const nextStatus = submitImmediately ? 'submitted' : input.status;

      const record: Activity = {
        ...input,
        id: existing?.id ?? generateDemoId('act'),
        status: nextStatus,
        created_at: existing?.created_at ?? now,
        updated_at: now,
        submitted_at: submitImmediately
          ? now
          : existing?.submitted_at ?? (nextStatus === 'submitted' ? now : null),
        reviewed_at: submitImmediately ? null : existing?.reviewed_at ?? null,
      };

      const ok = commitDb((prev) => {
        const exists = prev.activities.some((a) => a.id === record.id);
        return {
          ...prev,
          activities: exists
            ? prev.activities.map((a) => (a.id === record.id ? record : a))
            : [record, ...prev.activities],
        };
      });

      setIsBusy(false);
      if (!ok) return null;
      pushToast(
        'success',
        submitImmediately
          ? 'Activity submitted for faculty review.'
          : existing
          ? 'Activity draft updated.'
          : 'Activity saved as draft.'
      );
      return record;
    },
    [commitDb, db.activities, pushToast]
  );

  const submitActivityForReview = useCallback(
    async (activityId: string) => {
      setIsBusy(true);
      await delay(140);
      const now = new Date().toISOString();
      const ok = commitDb((prev) => ({
        ...prev,
        activities: prev.activities.map((a) =>
          a.id === activityId
            ? {
                ...a,
                status: 'submitted',
                submitted_at: now,
                updated_at: now,
              }
            : a
        ),
      }));
      setIsBusy(false);
      if (ok) pushToast('success', 'Activity submitted to faculty review queue.');
      return ok;
    },
    [commitDb, pushToast]
  );

  const withdrawActivityToDraft = useCallback(
    async (activityId: string) => {
      setIsBusy(true);
      await delay(120);
      const now = new Date().toISOString();
      const ok = commitDb((prev) => ({
        ...prev,
        activities: prev.activities.map((a) =>
          a.id === activityId
            ? {
                ...a,
                status: 'draft',
                updated_at: now,
              }
            : a
        ),
      }));
      setIsBusy(false);
      if (ok) pushToast('info', 'Submission withdrawn back to Draft for editing.');
      return ok;
    },
    [commitDb, pushToast]
  );

  const deleteActivity = useCallback(
    async (activityId: string) => {
      setIsBusy(true);
      await delay(140);
      const ok = commitDb((prev) => ({
        ...prev,
        activities: prev.activities.filter((a) => a.id !== activityId),
        activity_evidence: prev.activity_evidence.filter((e) => e.activity_id !== activityId),
        activity_reviews: prev.activity_reviews.filter((r) => r.activity_id !== activityId),
        projects: prev.projects.map((p) =>
          p.linked_activity_id === activityId ? { ...p, linked_activity_id: null } : p
        ),
      }));
      setIsBusy(false);
      if (ok) pushToast('info', 'Activity and associated local records deleted.');
      return ok;
    },
    [commitDb, pushToast]
  );

  const attachEvidence = useCallback(
    async (params: {
      activityId: string;
      studentId: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      previewDataUrl: string;
    }): Promise<ActivityEvidence | null> => {
      setIsBusy(true);
      await delay(120);
      const item = createEvidenceRecord(params);
      const ok = commitDb((prev) => ({
        ...prev,
        activity_evidence: [item, ...prev.activity_evidence],
      }));
      setIsBusy(false);
      if (!ok) return null;
      pushToast('success', `Attached "${params.fileName}" locally.`);
      return item;
    },
    [commitDb, pushToast]
  );

  const removeEvidence = useCallback(
    async (evidenceId: string) => {
      setIsBusy(true);
      await delay(100);
      const ok = commitDb((prev) => ({
        ...prev,
        activity_evidence: prev.activity_evidence.filter((e) => e.id !== evidenceId),
      }));
      setIsBusy(false);
      if (ok) pushToast('info', 'Evidence attachment removed.');
      return ok;
    },
    [commitDb, pushToast]
  );

  const saveProject = useCallback(
    async (
      input: Omit<Project, 'id' | 'created_at' | 'updated_at'> & { id?: string }
    ): Promise<Project | null> => {
      setIsBusy(true);
      await delay(140);
      const now = new Date().toISOString();
      const existing = input.id ? db.projects.find((p) => p.id === input.id) : undefined;
      const record: Project = {
        ...input,
        id: existing?.id ?? generateDemoId('proj'),
        created_at: existing?.created_at ?? now,
        updated_at: now,
      };
      const ok = commitDb((prev) => upsertProjectRecord(prev, record));
      setIsBusy(false);
      if (!ok) return null;
      pushToast('success', existing ? 'Project updated.' : 'Project added to portfolio.');
      return record;
    },
    [commitDb, db.projects, pushToast]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      setIsBusy(true);
      await delay(120);
      const ok = commitDb((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== projectId),
      }));
      setIsBusy(false);
      if (ok) pushToast('info', 'Project removed from portfolio.');
      return ok;
    },
    [commitDb, pushToast]
  );

  const reviewActivity = useCallback(
    async (params: {
      activityId: string;
      decision: ReviewDecision;
      feedback: string;
    }) => {
      setIsBusy(true);
      await delay(180);
      const reviewerId = activeUserId ?? DEMO_IDS.facultyKavita;
      const ok = commitDb((prev) =>
        applyDemoActivityReview(prev, {
          activityId: params.activityId,
          reviewerId,
          decision: params.decision,
          feedback: params.feedback,
        })
      );
      setIsBusy(false);
      if (ok) {
        const label =
          params.decision === 'approved'
            ? 'approved'
            : params.decision === 'changes_requested'
            ? 'returned for changes'
            : 'rejected';
        pushToast('success', `Activity ${label} and review history updated.`);
      }
      return ok;
    },
    [activeUserId, commitDb, pushToast]
  );

  const studentProfiles = useMemo(() => getDemoStudentProfiles(db), [db]);
  const facultyProfile = useMemo(() => getDemoFacultyProfile(db), [db]);
  const assignedStudents = useMemo(
    () => getAssignedStudentsForFaculty(DEMO_IDS.facultyKavita, db),
    [db]
  );

  const activeProfile = useMemo(() => {
    if (!activeUserId) return null;
    return db.profiles.find((p) => p.id === activeUserId) ?? null;
  }, [activeUserId, db.profiles]);

  const roleMismatchTarget = useMemo<UserRole | null>(() => {
    if (route.view === 'portal') return null;
    if (route.view === 'student' && activeRole !== 'student') return 'student';
    if (route.view === 'faculty' && activeRole !== 'faculty') return 'faculty';
    return null;
  }, [route.view, activeRole]);

  const value: DemoContextValue = {
    db,
    isHydrating,
    isBusy,
    storageError,
    clearStorageError: () => setStorageError(null),
    activeRole,
    activeUserId,
    activeProfile,
    route,
    roleMismatchTarget,
    studentProfiles,
    facultyProfile,
    assignedStudents,
    toasts,
    dismissToast,
    enterStudentDemo,
    enterFacultyDemo,
    exitToPortal,
    navigate,
    resetAllDemoData,
    updateProfile,
    saveActivity,
    submitActivityForReview,
    withdrawActivityToDraft,
    deleteActivity,
    attachEvidence,
    removeEvidence,
    saveProject,
    deleteProject,
    reviewActivity,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside DemoProvider');
  return ctx;
}
