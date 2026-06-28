// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Main App (User Panel Extraction)
// ═══════════════════════════════════════════════════════════

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { BranchProvider } from './contexts/BranchContext';
import { ToastProvider } from './components/ui/Toast';

import NotFoundPage from './pages/NotFoundPage';

// ── Public User Pages ──
import LandingGatewayPage from './pages/public/LandingGatewayPage';
import UserFlowSelectionPage from './pages/public/UserFlowSelectionPage';
import MemberLoginPage from './pages/public/MemberLoginPage';
import LimitedUserPage from './pages/public/LimitedUserPage';
import MemberPortalPage from './pages/public/MemberPortalPage';
import UserOverlayApp from './pages/overlay/UserOverlayApp';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <BranchProvider>
            <ToastProvider>
              <Routes>
                {/* ══════════ Public Routes ══════════ */}
                <Route path="/user/select" element={<UserFlowSelectionPage />} />
                <Route path="/user/member-login" element={<MemberLoginPage />} />
                <Route path="/user/limited" element={<LimitedUserPage />} />
                <Route path="/user/member-portal" element={<MemberPortalPage />} />
                <Route path="/pc-overlay/:pcId/*" element={<UserOverlayApp />} />

                {/* ══════════ Root Redirects ══════════ */}
                <Route path="/" element={<LandingGatewayPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ToastProvider>
          </BranchProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
