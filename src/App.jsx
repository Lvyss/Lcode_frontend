// src/App.jsx - UPDATE INI
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";

// ✅ IMPORT SEMUA USER PAGES
import Dashboard from "./pages/user/Dashboard";
import LanguagePage from "./pages/user/LanguagePage"; // ✅ TAMBAH INI
import PartLearningPage from "./pages/user/PartLearningPage"; // ✅ TAMBAH INI
import BadgeCollection from "./pages/user/BadgeCollection"; // ✅ NEW
import ProfilePage from "./pages/user/ProfilePage"; // ✅ IMPORT BARU
// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLanguages from "./pages/admin/AdminLanguages";
import AdminSections from "./pages/admin/AdminSections";
import AdminParts from "./pages/admin/AdminParts";
import AdminExercises from "./pages/admin/AdminExercises";
import AdminBadges from "./pages/admin/AdminBadges";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* ✅ AUTH CALLBACK ROUTE */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* ✅ PROTECTED USER ROUTES */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* ✅ TAMBAH USER LEARNING ROUTES */}
            <Route
              path="/language/:id"
              element={
                <ProtectedRoute>
                  <LanguagePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/part/:id"
              element={
                <ProtectedRoute>
                  <PartLearningPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/badges"
              element={
                <ProtectedRoute>
                  <BadgeCollection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            {/* ✅ ADMIN ROUTES */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/languages"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLanguages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sections"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminSections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/parts"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminParts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exercises"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminExercises />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/badges"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminBadges />
                </ProtectedRoute>
              }
            />

            {/* Auto redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
