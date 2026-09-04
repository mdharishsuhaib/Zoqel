import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, RefreshCw, CreditCard, Users, Bot, Play,
  BarChart3, FileText, Settings, ChevronLeft, ChevronRight,
  Zap, ShieldCheck, UserCheck, Lock
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';
import { useAuth } from '../../features/auth/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  isLocked?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Overview', href: '/app', icon: LayoutDashboard, exact: true },
    ]
  },
  {
    label: 'AI',
    items: [
      { label: 'Agent', href: '/app/agent', icon: Bot },
      { label: 'Simulator', href: '/app/simulator', icon: Play },
    ]
  },
  {
    label: 'Recovery',
    items: [
      { label: 'Recovery Queue', href: '/app/recovery', icon: RefreshCw },
      { label: 'Payments', href: '/app/payments', icon: CreditCard, isLocked: true },
      { label: 'Customers', href: '/app/customers', icon: Users, isLocked: true },
    ]
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', href: '/app/analytics', icon: BarChart3 },
      { label: 'Audit Log', href: '/app/audit', icon: FileText, isLocked: true },
      { label: 'Human Review', href: '/app/review', icon: UserCheck, isLocked: true },
    ]
  },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();
  const { mode } = useAuth();
  const isDemo = mode === 'DEMO';

  return (
    <aside
      className={cn(
        'bg-[#111827] text-[#D1D5DB] flex flex-col shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] h-full relative z-40',
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 shrink-0 border-b border-[#1D2939] overflow-hidden">
        <div className={cn("flex items-center gap-3 w-[200px] transition-all duration-300", sidebarCollapsed && "translate-x-1.5")}>
          <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center">
            <img src="/logo.png" alt="Zoqel Logo" className="w-7 h-7 object-contain" />
          </div>
          <motion.div 
            initial={false}
            animate={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
            className="flex flex-col overflow-hidden whitespace-nowrap"
          >
            <span className="font-bold text-white text-sm tracking-widest uppercase">Zoqel</span>
            <span className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wide">AI Revenue Recovery</span>
          </motion.div>
        </div>
      </div>

      <nav className="overflow-y-auto overflow-x-hidden p-2 space-y-4 pt-4 hide-scrollbar">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 mb-2"
                >
                  <h3 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{group.label}</h3>
                </motion.div>
              )}
            </AnimatePresence>
            {group.items.map((item) => {
              const isItemLocked = isDemo && item.isLocked;

              if (isItemLocked) {
                return (
                  <div
                    key={item.href}
                    title="Not available in demo mode"
                    className={cn(
                      'flex items-center rounded-lg mb-1 transition-all duration-150 group relative cursor-not-allowed text-[#4B5563] opacity-60',
                      sidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2'
                    )}
                  >
                    <item.icon size={18} className="shrink-0" />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                          className="text-sm font-medium truncate flex-1 flex items-center justify-between"
                        >
                          {item.label}
                          <Lock size={14} className="text-[#4B5563]" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  end={'exact' in item && item.exact}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg mb-1 transition-all duration-150 group relative',
                      sidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2',
                      isActive ? 'bg-[#2B84EA]/10 text-white shadow-sm' : 'text-[#9CA3AF] hover:bg-[#1D2939] hover:text-white'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeNavTab"
                          className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#2B84EA] rounded-r-md"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <item.icon 
                        size={18} 
                        className={cn("shrink-0 transition-colors", isActive ? "text-[#2B84EA]" : "text-[#9CA3AF] group-hover:text-white")} 
                      />

                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: -10 }}
                            className="text-sm font-medium truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Settings + collapse */}
      <div className="shrink-0 border-t border-[#1D2939] p-2 overflow-x-hidden">
        {isDemo ? (
          <div
            title="Not available in demo mode"
            className={cn(
              'flex items-center rounded-lg mb-2 transition-all duration-150 group relative cursor-not-allowed text-[#4B5563] opacity-60',
              sidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2'
            )}
          >
            <Settings size={18} className="shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium flex-1 flex items-center justify-between">
                  Settings
                  <Lock size={14} className="text-[#4B5563]" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <NavLink
            to="/app/settings"
            title={sidebarCollapsed ? "Settings" : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg mb-2 transition-all duration-150 group relative',
                sidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2',
                isActive ? 'bg-[#2B84EA]/10 text-white' : 'text-[#9CA3AF] hover:bg-[#1D2939] hover:text-white'
              )
            }
          >
            <Settings size={18} className="shrink-0" />

            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        )}

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 rounded-lg text-[#6B7280] hover:bg-[#1D2939] hover:text-white transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}

