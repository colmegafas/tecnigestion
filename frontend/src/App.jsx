import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import ClienteDetailPage from './pages/ClienteDetailPage';
import ClienteFormPage from './pages/ClienteFormPage';
import VisitasPage from './pages/VisitasPage';
import VisitaFormPage from './pages/VisitaFormPage';
import PresupuestosPage from './pages/PresupuestosPage';
import PresupuestoFormPage from './pages/PresupuestoFormPage';
import ConfiguracionPage from './pages/ConfiguracionPage';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center text-3xl animate-pulse">
            🔧
          </div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/registro"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Clientes */}
      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <ClientesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes/nuevo"
        element={
          <ProtectedRoute>
            <ClienteFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes/:id"
        element={
          <ProtectedRoute>
            <ClienteDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes/:id/editar"
        element={
          <ProtectedRoute>
            <ClienteFormPage />
          </ProtectedRoute>
        }
      />

      {/* Visitas */}
      <Route
        path="/visitas"
        element={
          <ProtectedRoute>
            <VisitasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitas/nueva"
        element={
          <ProtectedRoute>
            <VisitaFormPage />
          </ProtectedRoute>
        }
      />

      {/* Presupuestos */}
      <Route
        path="/presupuestos"
        element={
          <ProtectedRoute>
            <PresupuestosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/presupuestos/nuevo"
        element={
          <ProtectedRoute>
            <PresupuestoFormPage />
          </ProtectedRoute>
        }
      />

      {/* Configuración */}
      <Route
        path="/configuracion"
        element={
          <ProtectedRoute>
            <ConfiguracionPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="h-screen w-screen overflow-hidden bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
