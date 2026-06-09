// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Main App with Complete Routing
// SOP §5: Role hierarchy → route protection
// SOP §19.2: Dashboard-level permission control
// ═══════════════════════════════════════════════════════════

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { BranchProvider } from './contexts/BranchContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import { ROLES, DASHBOARDS } from './config/constants';

// ── Auth Pages ──
import LoginPage from './pages/auth/LoginPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// ── Operations ──
import BillingCounterPage from './pages/billing/BillingCounterPage';
import SessionsPage from './pages/sessions/SessionsPage';
import ReservationsPage from './pages/reservations/ReservationsPage';
import FoodOrdersPage from './pages/food/FoodOrdersPage';

// ── Finance ──
import CashRegisterPage from './pages/cash/CashRegisterPage';
import CashDeskPage from './pages/cash/CashDeskPage';
import EodDashboardPage from './pages/eod/EodDashboardPage';

// ── Management ──
import MembersPage from './pages/members/MembersPage';
import MenuEditorPage from './pages/menu/MenuEditorPage';

// ── Admin ──
import MainDashboardPage from './pages/dashboard/MainDashboardPage';
import PcStatusPage from './pages/admin/PcStatusPage';
import SettingsPage from './pages/admin/SettingsPage';

// ── End of imports ──
function HomeRedirect() {
  const { isSuperAdmin, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return isSuperAdmin ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/app/billing" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <BranchProvider>
            <ToastProvider>
              <Routes>
                {/* ══════════ Public Routes ══════════ */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* ══════════ Protected App Shell ══════════ */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OPERATOR]}>
                      <AppShell />
                    </ProtectedRoute>
                  }
                >
                  {/* Default redirect based on role */}
                  <Route index element={<HomeRedirect />} />

                  {/* ── Operations Dashboards ── */}
                  <Route
                    path="billing"
                    element={
                      <ProtectedRoute dashboardKey={DASHBOARDS.BILLING_COUNTER}>
                        <BillingCounterPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="sessions"
                    element={
                      <ProtectedRoute dashboardKey={DASHBOARDS.SESSIONS}>
                        <SessionsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="reservations"
                    element={
                      <ProtectedRoute dashboardKey={DASHBOARDS.RESERVATIONS}>
                        <ReservationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="food-orders"
                    element={
                      <ProtectedRoute dashboardKey={DASHBOARDS.FOOD_ORDERS}>
                        <FoodOrdersPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Finance Dashboards ── */}
                  <Route
                    path="cash-register"
                    element={
                      <ProtectedRoute dashboardKey={DASHBOARDS.CASH_REGISTER}>
                        <CashRegisterPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="cash-desk"
                    element={
                      <ProtectedRoute dashboardKey={DASHBOARDS.CASH_DESK}>
                        <CashDeskPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="eod"
                    element={
                      <ProtectedRoute dashboardKey={DASHBOARDS.EOD}>
                        <EodDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Management Dashboards ── */}
                  <Route
                    path="members"
                    element={
                      <ProtectedRoute dashboardKey={DASHBOARDS.MEMBERS}>
                        <MembersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="menu-editor"
                    element={
                      <ProtectedRoute dashboardKey={DASHBOARDS.MENU_EDITOR}>
                        <MenuEditorPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Admin Only Dashboards ── */}
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OPERATOR]}>
                        <MainDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="pc-status"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                        <PcStatusPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all inside /app */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* ══════════ Root Redirects ══════════ */}
                <Route path="/" element={<HomeRedirect />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ToastProvider>
          </BranchProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
