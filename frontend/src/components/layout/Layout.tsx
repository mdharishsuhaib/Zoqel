import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { useAuth } from '../../features/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Layout() {
  const { mode, logout } = useAuth();
  const navigate = useNavigate();
  const isDemo = mode === 'DEMO';

  return (
    <div className="flex h-screen bg-[#F7F8FA] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        {isDemo && (
          <div className="flex-shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-400 text-amber-900">
                DEMO MODE
              </span>
              <span className="text-sm text-amber-800">
                You are viewing <strong>synthetic demo data</strong>. Policy changes, transactions, and recovery actions are simulated — no real payments are processed.
              </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => { navigate('/signup'); logout(); }}
                className="text-xs font-semibold text-amber-900 underline hover:text-amber-700"
              >
                Create a real account →
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="text-xs text-amber-700 hover:text-amber-900"
              >
                Exit demo
              </button>
            </div>
          </div>
        )}
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}

