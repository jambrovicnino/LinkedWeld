import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './guards';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsListPage } from '@/pages/projects/ProjectsListPage';
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage';
import { ProjectCreatePage } from '@/pages/projects/ProjectCreatePage';
import { ProjectEditPage } from '@/pages/projects/ProjectEditPage';
import { WorkersListPage } from '@/pages/workers/WorkersListPage';
import { WorkerDetailPage } from '@/pages/workers/WorkerDetailPage';
import { WorkerProfilePage } from '@/pages/workers/WorkerProfilePage';
import { AttendancePage } from '@/pages/workers/AttendancePage';
import { SubcontractorDirectoryPage } from '@/pages/subcontractors/SubcontractorDirectoryPage';
import { SubcontractorDetailPage } from '@/pages/subcontractors/SubcontractorDetailPage';
import { ClientPostingsPage } from '@/pages/clients/ClientPostingsPage';
import { ClientMatchingPage } from '@/pages/clients/ClientMatchingPage';
import { ClientTeamPage } from '@/pages/clients/ClientTeamPage';
import { ExpensesListPage } from '@/pages/expenses/ExpensesListPage';
import { ExpenseCreatePage } from '@/pages/expenses/ExpenseCreatePage';
import { ExpenseDetailPage } from '@/pages/expenses/ExpenseDetailPage';
import { DocumentsListPage } from '@/pages/documents/DocumentsListPage';
import { DocumentUploadPage } from '@/pages/documents/DocumentUploadPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { ReportDetailPage } from '@/pages/reports/ReportDetailPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { PricingPage } from '@/pages/subscription/PricingPage';
import { BillingPage } from '@/pages/subscription/BillingPage';
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
      { path: '/projects', element: <ProjectsListPage /> },
      { path: '/projects/new', element: <ProjectCreatePage /> },
      { path: '/projects/:id', element: <ProjectDetailPage /> },
      { path: '/projects/:id/edit', element: <ProjectEditPage /> },
      { path: '/workers', element: <WorkersListPage /> },
      { path: '/workers/profile', element: <WorkerProfilePage /> },
      { path: '/workers/attendance', element: <AttendancePage /> },
      { path: '/workers/:id', element: <WorkerDetailPage /> },
      { path: '/subcontractors', element: <SubcontractorDirectoryPage /> },
      { path: '/subcontractors/:id', element: <SubcontractorDetailPage /> },
      { path: '/clients/postings', element: <ClientPostingsPage /> },
      { path: '/clients/matching', element: <ClientMatchingPage /> },
      { path: '/clients/team', element: <ClientTeamPage /> },
      { path: '/expenses', element: <ExpensesListPage /> },
      { path: '/expenses/new', element: <ExpenseCreatePage /> },
      { path: '/expenses/:id', element: <ExpenseDetailPage /> },
      { path: '/documents', element: <DocumentsListPage /> },
      { path: '/documents/upload', element: <DocumentUploadPage /> },
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/reports', element: <ReportsPage /> },
      { path: '/reports/:type', element: <ReportDetailPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/admin', element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute> },
      { path: '/admin/users', element: <ProtectedRoute allowedRoles={['admin']}><UserManagementPage /></ProtectedRoute> },
      { path: '/pricing', element: <PricingPage /> },
      { path: '/billing', element: <BillingPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
