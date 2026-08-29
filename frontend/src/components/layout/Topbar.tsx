import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Activity, X, LogOut, ShieldAlert } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useQuery } from '@tanstack/react-query';
import { getRecentAuditEvents } from '../../services/recoveryService';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export function Topbar() {
  const navigate = useNavigate();
  const { setCommandPaletteOpen } = useUIStore();
  const { mode, user, logout } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  const { data: events } = useQuery({
    queryKey: ['recentAuditEvents'],
    queryFn: getRecentAuditEvents,
    refetchInterval: 15000
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibleEvents = (events || []).filter((e: any) => !dismissedIds.has(e.id)).slice(0, 5);
  
  // Profile Dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleProfileClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleProfileClickOutside);
    return () => document.removeEventListener("mousedown", handleProfileClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name?: string) => {
    if (mode === 'DEMO') return 'DM';
    if (!name) return 'DE';
    const words = name.trim().split(/\s+/);
    return words.map(w => w[0].toUpperCase()).join('').substring(0, 3);
  };

  const initials = getInitials(user?.fullName);
  const displayName = mode === 'DEMO' ? 'Demo Merchant' : user?.fullName || 'Zoqel User';
  const displayEmail = mode === 'DEMO' ? 'demo@zoqel.ai' : user?.email || '';

  return (
    <header className="h-16 bg-white border-b border-[#E4E7EC] flex items-center px-6 gap-4 shrink-0 relative z-50">
      {/* Search */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-[#98A2B3] text-sm hover:border-[#D0D5DD] hover:bg-[#F9FAFB] transition-all w-64"
      >
        <Search size={14} />
        <span>Search... </span>
        <span className="ml-auto text-[11px] font-mono bg-[#F2F4F7] px-1.5 py-0.5 rounded text-[#667085]">Ctrl+K</span>
      </button>

      <div className="flex-1" />

      {/* Demo Mode Indicator */}
      {mode === 'DEMO' && (
        <div className="hidden md:flex items-center gap-2 bg-[#FFFAEB] border border-[#FEDF89] px-3 py-1.5 rounded-full mr-2">
          <ShieldAlert size={14} className="text-[#B54708]" />
          <span className="text-xs font-bold text-[#B54708] tracking-wide uppercase">Demo Mode &middot; Synthetic Data</span>
        </div>
      )}

      {/* Alerts / Activity Feed */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${isOpen ? 'bg-[#F2F4F7]' : 'hover:bg-[#F2F4F7]'}`}
        >
          <Bell size={18} className="text-[#667085]" />
          {visibleEvents.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-[380px] bg-white rounded-xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.2)] border border-[#E4E7EC] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[#E4E7EC] bg-[#F9FAFB] flex items-center justify-between">
                <h3 className="font-semibold text-[#101828] text-sm flex items-center gap-2">
                  <Activity size={14} className="text-[#2B84EA]" />
                  Live Activity Feed
                </h3>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {visibleEvents.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#667085]">
                    No new activity.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {visibleEvents.map((event: any) => (
                      <div key={event.id} className="p-3 hover:bg-[#F9FAFB] rounded-lg transition-colors group relative">
                        <button
                          onClick={() => {
                            setDismissedIds(prev => {
                              const next = new Set(prev);
                              next.add(event.id);
                              return next;
                            });
                          }}
                          className="absolute right-2 top-2 p-1 rounded-md text-[#9CA3AF] hover:text-[#475467] hover:bg-[#F2F4F7] opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Dismiss"
                        >
                          <X size={14} />
                        </button>
                        <div className="flex items-center justify-between mb-1 pr-6">
                          <span className="text-xs font-mono font-semibold text-[#2B84EA]">{event.eventType}</span>
                          <span className="text-[10px] text-[#9CA3AF]">{new Date(event.occurredAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-[#475467] leading-snug">{event.eventDetail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Profile / Logout */}
      <div className="relative border-l border-[#E4E7EC] pl-4 ml-1" ref={profileRef}>
        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)} 
          className="w-9 h-9 rounded-full bg-[#111827] flex items-center justify-center text-white text-sm font-bold shadow-sm hover:ring-2 hover:ring-[#2B84EA] hover:ring-offset-2 transition-all"
        >
          {initials}
        </button>
        
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_12px_32px_-12px_rgba(0,0,0,0.2)] border border-[#E4E7EC] overflow-hidden"
            >
              <div className="px-4 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB]">
                <div className="font-semibold text-[#101828] truncate">{displayName}</div>
                {displayEmail && <div className="text-xs text-[#667085] truncate mt-0.5">{displayEmail}</div>}
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#B42318] hover:bg-[#FEF3F2] rounded-lg transition-colors font-medium"
                >
                  <LogOut size={16} />
                  {mode === 'DEMO' ? 'Exit Demo' : 'Sign out'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
