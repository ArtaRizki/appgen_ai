import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Search,
  Sparkles,
  ShoppingCart,
  LogOut,
  Wrench,
  ChevronRight,
  Globe,
  MessageSquare,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/tools/data-scraper', label: 'Data Scraper', icon: Search },
  { to: '/tools/vending-finder', label: 'Vending Finder', icon: ShoppingCart },
  { to: '/tools/ai-content', label: 'AI Content', icon: Sparkles },
  { to: '/tools/site-auditor', label: 'Site Auditor', icon: Globe },
  { to: '/tools/lead-messenger', label: 'Lead Messenger', icon: MessageSquare },
  { to: '/sites', label: 'Site Manager', icon: Globe },
];

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch {}
    logout();
    navigate('/login', { replace: true });
    toast.success('Logged out');
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-bg-secondary border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-brand-blue" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">Tools Portal</p>
              <p className="text-xs text-gray-500 mt-0.5">adigicube.com</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors group',
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-bg-tertiary'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-xs font-bold text-brand-blue">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            id="sidebar-logout"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
