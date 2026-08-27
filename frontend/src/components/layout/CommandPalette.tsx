import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const QUICK_ACTIONS = [
  { label: 'View Revenue at Risk', href: '/' },
  { label: 'Open Recovery Queue', href: '/recovery' },
  { label: 'Run Recovery Simulator', href: '/simulator' },
  { label: 'View Audit Log', href: '/audit' },
  { label: 'Human Review', href: '/review' },
  { label: 'Analytics & Evaluation', href: '/analytics' },
];

const RECENT = [
  { label: 'TXN-91823 — INR 4,999 — RECOVERED', href: '/payments/TXN-91823' },
  { label: 'TXN-82193 — INR 27,500 — ESCALATED', href: '/payments/TXN-82193' },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandPaletteOpen]);

  const go = (href: string) => {
    navigate(href);
    setCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-white rounded-xl shadow-[0_8px_32px_rgba(16,24,40,0.16)] border border-[#E4E7EC] overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-[#E4E7EC] gap-3">
              <Search size={16} className="text-[#98A2B3]" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search Zoqel..."
                className="flex-1 text-sm outline-none text-[#101828] placeholder-[#98A2B3]"
              />
              <button onClick={() => setCommandPaletteOpen(false)} className="text-[#98A2B3] hover:text-[#667085]">
                <X size={16} />
              </button>
            </div>
            <div className="py-2 max-h-80 overflow-y-auto">
              <div className="px-4 py-1 text-[11px] font-semibold text-[#98A2B3] uppercase tracking-wide">Recent</div>
              {RECENT.map(r => (
                <button key={r.href} onClick={() => go(r.href)}
                  className="w-full text-left px-4 py-2 text-sm text-[#101828] hover:bg-[#F9FAFB] transition-colors"
                >{r.label}</button>
              ))}
              <div className="px-4 py-1 mt-2 text-[11px] font-semibold text-[#98A2B3] uppercase tracking-wide">Quick Actions</div>
              {QUICK_ACTIONS.filter(a => !query || a.label.toLowerCase().includes(query.toLowerCase())).map(a => (
                <button key={a.href} onClick={() => go(a.href)}
                  className="w-full text-left px-4 py-2 text-sm text-[#101828] hover:bg-[#F9FAFB] transition-colors"
                >{a.label}</button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
