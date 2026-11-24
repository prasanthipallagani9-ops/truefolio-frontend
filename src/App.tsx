import React from 'react';
import { DemoProvider, useDemo } from './context/DemoContext';
import { FacultyOverviewPage } from './components/faculty/FacultyOverviewPage';
import { FacultyProfilePage } from './components/faculty/FacultyProfilePage';
import { FacultyReviewQueuePage } from './components/faculty/FacultyReviewQueuePage';
import { FacultyStudentDetailPage } from './components/faculty/FacultyStudentDetailPage';
import { FacultyStudentsPage } from './components/faculty/FacultyStudentsPage';
import { WorkspaceShell } from './components/layout/WorkspaceShell';
import { DemoPortalPage } from './components/portal/DemoPortalPage';
import { StudentActivitiesPage } from './components/student/StudentActivitiesPage';
import { StudentEvidencePage } from './components/student/StudentEvidencePage';
import { StudentOverviewPage } from './components/student/StudentOverviewPage';
import { StudentProfilePage } from './components/student/StudentProfilePage';
import { StudentProjectsPage } from './components/student/StudentProjectsPage';

function TruefolioRouter() {
  const { route } = useDemo();

  if (route.view === 'portal') {
    return <DemoPortalPage />;
  }

  return (
    <WorkspaceShell>
      {route.view === 'student' && (
        <>
          {route.page === 'overview' && <StudentOverviewPage />}
          {route.page === 'activities' && <StudentActivitiesPage />}
          {route.page === 'evidence' && <StudentEvidencePage />}
          {route.page === 'projects' && <StudentProjectsPage />}
          {route.page === 'profile' && <StudentProfilePage />}
        </>
      )}
      {route.view === 'faculty' && (
        <>
          {route.page === 'overview' && <FacultyOverviewPage />}
          {route.page === 'reviews' && <FacultyReviewQueuePage />}
          {route.page === 'students' && <FacultyStudentsPage />}
          {route.page === 'student-detail' && (
            <FacultyStudentDetailPage studentId={route.studentId} />
          )}
          {route.page === 'profile' && <FacultyProfilePage />}
        </>
      )}
    </WorkspaceShell>
  );
}

export default function App() {
  return (
    <DemoProvider>
      <TruefolioRouter />
    </DemoProvider>
  );
}
