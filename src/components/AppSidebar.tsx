import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Image, Download, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/kontakte', label: 'Kontakte', icon: Users },
  { to: '/bilder', label: 'Bildverwaltung', icon: Image },
  { to: '/export', label: 'Datenexport', icon: Download },
];

const AppSidebar = () => {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-lg font-bold tracking-tight text-sidebar-accent-foreground">
          Verbands<span className="text-accent">portal</span>
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Datenmanagement</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="px-3">
          <p className="text-xs text-sidebar-foreground/80 truncate">{user?.email}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] font-medium rounded">
                <Shield className="h-2.5 w-2.5" /> Admin
              </span>
            )}
            {!isAdmin && (
              <span className="text-[10px] text-sidebar-foreground/50">Benutzer</span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={signOut}
        >
          <LogOut className="h-3.5 w-3.5 mr-2" /> Abmelden
        </Button>
        <div className="flex items-center gap-3 px-3 py-1 text-sidebar-foreground/50 text-xs">
          <Settings className="h-3.5 w-3.5" />
          <span>v1.0 — Berufsverband</span>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
