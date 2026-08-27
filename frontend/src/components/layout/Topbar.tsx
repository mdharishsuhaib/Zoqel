import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Activity, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useQuery } from '@tanstack/react-query';
import { getRecentAuditEvents } from '../../services/recoveryService';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function Topbar() {
  const navigate = useNavigate();
  const { setCommandPaletteOpen } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  const { data: events } = useQuery({
    queryKey: ['recentAuditEvents'],
    queryFn: getRecentAuditEvents,
    refetchInterval: 5000
  });

  const visibleEvents = events ? events.filter((e: any) => !dismissedIds.has(e.id)) : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      {/* LIVE indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ECFDF3] border border-[#ABEFC6]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <span className="text-[#067647] text-xs font-semibold">LIVE</span>
        <span className="text-[#4CA976] text-xs hidden sm:inline">Monitoring 10,000 transactions</span>
      </div>

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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-[#E4E7EC] shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-[#E4E7EC] bg-[#F9FAFB] flex justify-between items-center">
                <h3 className="font-semibold text-[#101828]">Activity Feed</h3>
                <span className="text-xs text-[#667085] bg-white px-2 py-0.5 rounded border border-[#E4E7EC]">Live</span>
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {!events ? (
                  <div className="p-4 text-center text-sm text-[#667085]">Loading activities...</div>
                ) : visibleEvents.length === 0 ? (
                  <div className="p-4 text-center text-sm text-[#667085]">No recent activities found.</div>
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
                          className="absolute top-2 right-2 p-1 text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#F2F4F7] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Dismiss"
                        >
                          <X size={14} />
                        </button>
                        <div className="flex items-center justify-between mb-1 pr-6">
                          <span className="text-xs font-mono font-semibold text-[#2B84EA]">{event.eventType}</span>
                          <span className="text-[10px] text-[#9CA3AF]">{new Date(event.occurredAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-sm text-[#344054] leading-tight pr-2">{event.eventDetail}</div>
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
      <div className="relative border-l border-[#E4E7EC] pl-4 ml-1">
        <button 
          onClick={() => navigate('/')} 
          className="w-9 h-9 rounded-full bg-[#111827] flex items-center justify-center text-white text-sm font-bold shadow-sm hover:ring-2 hover:ring-[#2B84EA] hover:ring-offset-2 transition-all"
          title="Sign out"
        >
          DE
        </button>
      </div>

    </header>
  );
}
