// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — AppShell Layout
// Wraps all authenticated pages with Topbar + Sidebar + Content area
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Fixed Topbar */}
      <Topbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Content area: Sidebar + Main */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="p-3 sm:p-4 max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
