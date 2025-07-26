import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CifraClubLayout } from '../components/layout/CifraClubLayout';
import { CircularProgress, Box } from '@mui/material';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Páginas públicas
const CifraClubHomePage = lazy(() => import('./../pages/CifraClubHomePage'));
const LoginPage = lazy(() => import('./../pages/LoginPage'));
const SongRequestPage = lazy(() => import('./../pages/SongRequestPage'));

// Páginas de usuario autenticado
const MyCollaborationsPage = lazy(() => import('../pages/MyCollaborationsPage'));
const MyRequestsPage = lazy(() => import('../pages/MyRequestsPage'));
const MessagesPage = lazy(() => import('../pages/MessagesPage'));

// Páginas de administración
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminSongsPage = lazy(() => import('../pages/admin/AdminSongsPage'));
const AdminRequestsPage = lazy(() => import('../pages/admin/AdminRequestsPage'));
const AdminAuthorsPage = lazy(() => import('../pages/admin/AdminAuthorsPage'));
const AdminGenresPage = lazy(() => import('../pages/admin/AdminGenresPage'));

// Páginas de canciones
const SongUploadPage = lazy(() => import('../pages/SongUploadPage'));
const SongDetailPage = lazy(() => import('../pages/SongDetailPage'));
const SongEditPage = lazy(() => import('../pages/SongEditPage'));
const SongHistoryPage = lazy(() => import('../pages/SongHistoryPage'));
const CifraClubSongListPage = lazy(() => import('../pages/CifraClubSongListPage'));

// Páginas de perfil
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

// Páginas de autenticación OAuth
const OAuthCallbackPage = lazy(() => import('../pages/auth/OAuthCallbackPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmailPage'));

// Páginas de demostración
const SongEditorDemoPage = lazy(() => import('../pages/SongEditorDemoPage'));

export const AppRoutes = () => {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <Routes>
        {/* Rutas de autenticación sin layout */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="auth/callback" element={<OAuthCallbackPage />} />

        {/* Rutas con layout principal */}
        <Route path="/" element={<CifraClubLayout />}>
          {/* Rutas públicas */}
          <Route index element={<CifraClubHomePage />} />
          <Route path="songs" element={<CifraClubSongListPage />} />
          <Route path="songs/:songId" element={<SongDetailPage />} />
          <Route path="songs/:songId/edit" element={<SongEditPage />} />
          <Route path="songs/:songId/history" element={<SongHistoryPage />} />
          <Route path="request" element={<SongRequestPage />} />
          <Route path="editor-demo" element={<SongEditorDemoPage />} />

          {/* Rutas protegidas - Usuario autenticado */}
          <Route path="my-collaborations" element={
            <ProtectedRoute>
              <MyCollaborationsPage />
            </ProtectedRoute>
          } />
          <Route path="my-requests" element={
            <ProtectedRoute>
              <MyRequestsPage />
            </ProtectedRoute>
          } />
          <Route path="messages" element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />
          <Route path="upload" element={
            <ProtectedRoute>
              <SongUploadPage />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />

          {/* Rutas de administración */}
          <Route path="admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsersPage />
            </ProtectedRoute>
          } />
          <Route path="admin/songs" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSongsPage />
            </ProtectedRoute>
          } />
          <Route path="admin/requests" element={
            <ProtectedRoute requiredRole="admin">
              <AdminRequestsPage />
            </ProtectedRoute>
          } />
          <Route path="admin/authors" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAuthorsPage />
            </ProtectedRoute>
          } />
          <Route path="admin/genres" element={
            <ProtectedRoute requiredRole="admin">
              <AdminGenresPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Suspense>
  );
};