import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, RefreshCw, CreditCard, Users, Bot, Play,
  BarChart3, FileText, Settings, ChevronLeft, ChevronRight,
  Zap, ShieldCheck, UserCheck, Lock
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

// LIVE DEMO FLAG - Set to true to lock down non-demo paths
const IS_LIVE_DEMO = true;

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  isLocked?: boolean;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
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

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="flex flex-col bg-[#111827] border-r border-[#1D2939] overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-[#1D2939] shrink-0">
        <div className="flex items-center gap-3 min-w-0 w-full">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <img src="/logo.png" alt="Zoqel Logo" className="h-full w-full object-contain" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col min-w-0 whitespace-nowrap overflow-hidden"
              >
                <div className="text-white font-bold text-sm tracking-wide">ZOQEL</div>
                <div className="text-[#667085] text-[10px] truncate">AI Revenue Recovery</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={sidebarCollapsed ? "mb-2" : "mb-4"}>
            <AnimatePresence>
              {!sidebarCollapsed && group.label && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#4B5563] mb-1"
                >
                  {group.label}
                </motion.div>
              )}
            </AnimatePresence>
            {group.items.map((item) => {
              const isItemLocked = IS_LIVE_DEMO && item.isLocked;

              if (isItemLocked) {
                return (
                  <div
                    key={item.href}
                    title="Not available in demo mode"
                    className={cn(
                      'flex items-center rounded-lg mb-1 transition-all duration-150 group relative cursor-not-allowed',
                      sidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2',
                      'text-[#4B5563] opacity-60'
                    )}
                  >
                    <item.icon size={18} className="shrink-0" />
                    
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
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
                      isActive
                        ? 'bg-[#2B84EA]/10 text-white'
                        : 'text-[#9CA3AF] hover:bg-[#1D2939] hover:text-white'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={18}
                        className={cn('shrink-0 transition-colors', isActive ? 'text-[#2B84EA]' : '')}
                      />

                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
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

      {/* Settings + collapse */}
      <div className="shrink-0 border-t border-[#1D2939] p-2 overflow-x-hidden">
        {IS_LIVE_DEMO ? (
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
    </motion.aside>
  );
}
