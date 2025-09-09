import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Public Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import OAuthCallbackPage from '../pages/auth/OAuthCallbackPage';

// Song Pages
import SongListPage from '../pages/SongListPage';
import SongDetailPage from '../pages/SongDetailPage';
import SongUploadPage from '../pages/SongUploadPage';
import SongEditPage from '../pages/SongEditPage';
import SongRequestPage from '../pages/SongRequestPage';
import SongHistoryPage from '../pages/SongHistoryPage';
import SongEditorDemoPage from '../pages/SongEditorDemoPage';
import ArtistPage from '../pages/ArtistPage';

// User Pages
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import MessagesPage from '../pages/MessagesPage';
import MyRequestsPage from '../pages/MyRequestsPage';
import MyCollaborationsPage from '../pages/MyCollaborationsPage';
import NotificationSettingsPage from '../pages/NotificationSettingsPage';

// CifraClub Pages
import CifraClubHomePage from '../pages/CifraClubHomePage';
import CifraClubSongListPage from '../pages/CifraClubSongListPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminSongsPage from '../pages/admin/AdminSongsPage';
import AdminArtistsPage from '../pages/admin/AdminArtistsPage';
import AdminAlbumsPage from '../pages/admin/AdminAlbumsPage';
import AdminGenresPage from '../pages/admin/AdminGenresPage';
import AdminAuthorsPage from '../pages/admin/AdminAuthorsPage';
import AdminCountriesPage from '../pages/admin/AdminCountriesPage';
import AdminRolesPage from '../pages/admin/AdminRolesPage';
import AdminRequestsPage from '../pages/admin/AdminRequestsPage';
import AdminAuthProvidersPage from '../pages/admin/AdminAuthProvidersPage';

// Components
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();

  return (
    <Routes>
      {/* 🌟 PUBLIC ROUTES */}
      <Route path="/" element={<HomePage />} />
      <Route path="/songs" element={<SongListPage />} />
      <Route path="/songs/:id" element={<SongDetailPage />} />
      <Route path="/artist/:artistName" element={<ArtistPage />} />
      <Route path="/cifraclub" element={<CifraClubHomePage />} />
      <Route path="/cifraclub/songs" element={<CifraClubSongListPage />} />

      {/* 🔐 AUTH ROUTES */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      {/* 🎵 SONG ROUTES (Protected) */}
      <Route path="/upload" element={
        <ProtectedRoute>
          <SongUploadPage />
        </ProtectedRoute>
      } />
      <Route path="/request" element={
        <ProtectedRoute>
          <SongRequestPage />
        </ProtectedRoute>
      } />
      <Route path="/songs/:id/edit" element={
        <ProtectedRoute>
          <SongEditPage />
        </ProtectedRoute>
      } />
      <Route path="/songs/:id/history" element={
        <ProtectedRoute>
          <SongHistoryPage />
        </ProtectedRoute>
      } />
      <Route path="/song-editor-demo" element={<SongEditorDemoPage />} />

      {/* 👤 USER ROUTES (Protected) */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <MessagesPage />
        </ProtectedRoute>
      } />
      <Route path="/my-requests" element={
        <ProtectedRoute>
          <MyRequestsPage />
        </ProtectedRoute>
      } />
      <Route path="/my-collaborations" element={
        <ProtectedRoute>
          <MyCollaborationsPage />
        </ProtectedRoute>
      } />
      <Route path="/notification-settings" element={
        <ProtectedRoute>
          <NotificationSettingsPage />
        </ProtectedRoute>
      } />

      {/* 🔧 ADMIN ROUTES (Admin Only) */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute requiredRole="admin">
          <AdminUsersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/songs" element={
        <ProtectedRoute requiredRole="admin">
          <AdminSongsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/artists" element={
        <ProtectedRoute requiredRole="admin">
          <AdminArtistsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/albums" element={
        <ProtectedRoute requiredRole="admin">
          <AdminAlbumsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/genres" element={
        <ProtectedRoute requiredRole="admin">
          <AdminGenresPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/authors" element={
        <ProtectedRoute requiredRole="admin">
          <AdminAuthorsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/countries" element={
        <ProtectedRoute requiredRole="admin">
          <AdminCountriesPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/roles" element={
        <ProtectedRoute requiredRole="admin">
          <AdminRolesPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/requests" element={
        <ProtectedRoute requiredRole="admin">
          <AdminRequestsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/auth-providers" element={
        <ProtectedRoute requiredRole="admin">
          <AdminAuthProvidersPage />
        </ProtectedRoute>
      } />

      {/* 🚫 FALLBACK ROUTE */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;