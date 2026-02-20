import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './guards';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AlertsPage } from '@/pages/alerts/AlertsPage';
import { WorkersListPage } from '@/pages/workers/WorkersListPage';
import { WorkerDetailPage } from '@/pages/workers/WorkerDetailPage';
import { ProjectsListPage } from '@/pages/projects/ProjectsListPage';
import { ProjectCreatePage } from '@/pages/projects/ProjectCreatePage';
import { ProjectEditPage } from '@/pages/projects/ProjectEditPage';
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage';
import { ExpensesListPage } from '@/pages/expenses/ExpensesListPage';
import { ExpenseCreatePage } from '@/pages/expenses/ExpenseCreatePage';
import { ExpenseDetailPage } from '@/pages/expenses/ExpenseDetailPage';
import { PipelinePage } from '@/pages/pipeline/PipelinePage';
import { PipelineCandidateDetailPage } from '@/pages/pipeline/PipelineCandidateDetailPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <PublicOnlyRoute><AuthLayout /></PublicOnlyRoute>,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    path: '/verify',
    element: <VerifyEmailPage />,
  },
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/alerts', element: <AlertsPage /> },
      { path: '/workers', element: <WorkersListPage /> },
      { path: '/workers/:id', element: <WorkerDetailPage /> },
      { path: '/projects', element: <ProjectsListPage /> },
      { path: '/projects/new', element: <ProjectCreatePage /> },
      { path: '/projects/:id', element: <ProjectDetailPage /> },
      { path: '/projects/:id/edit', element: <ProjectEditPage /> },
      { path: '/expenses', element: <ExpensesListPage /> },
      { path: '/expenses/new', element: <ExpenseCreatePage /> },
      { path: '/expenses/:id', element: <ExpenseDetailPage /> },
      { path: '/pipeline', element: <PipelinePage /> },
      { path: '/pipeline/:id', element: <PipelineCandidateDetailPage /> },
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
