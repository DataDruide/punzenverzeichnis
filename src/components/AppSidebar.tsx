import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, Stamp, Search, Image, Download, Shield, Users, Settings, LogOut, HelpCircle, ScrollText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profil', label: 'Mein Profil', icon: User },
  { to: '/punzen', label: 'Meine Punzen', icon: Stamp },
  { to: '/recherche', label: 'Recherche', icon: Search },
  { to: '/hilfe', label: 'Hilfe', icon: HelpCircle },
];

const adminItems = [
  { to: '/admin/punzen', label: 'Punzenverwaltung', icon: Stamp },
  { to: '/admin/users', label: 'Benutzerverwaltung', icon: Users },
  { to: '/admin/einstellungen', label: 'Einstellungen', icon: Settings },
  { to: '/admin/audit', label: 'Audit-Log', icon: ScrollText },
  { to: '/kontakte', label: 'Kontakte', icon: Users },
  { to: '/bilder', label: 'Bildverwaltung', icon: Image },
  { to: '/export', label: 'Datenexport', icon: Download },
];

const AppSidebar = () => {
  const location = useLocation();
  const { user, isAdminOrAbove, isSuperAdmin, signOut } = useAuth();

  const linkClass = (to: string) => {
    const isActive = location.pathname === to;
    return `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
    }`;
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-lg font-bold tracking-tight text-sidebar-accent-foreground">
          Zentrales <span className="text-accent">Punzenverzeichnis</span>
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">ZVP — Goldschmiede & Silberschmiede</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass(to)}>
            <Icon className="h-4 w-4" />{label}
          </NavLink>
        ))}
        {isAdminOrAbove && (
          <>
            <div className="my-2 border-t border-sidebar-border" />
            <p className="px-3 text-[10px] uppercase tracking-wider text-sidebar-foreground/40 mb-1">Administration</p>
            {adminItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass(to)}>
                <Icon className="h-4 w-4" />{label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="px-3">
          <p className="text-xs text-sidebar-foreground/80 truncate">{user?.email}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {isSuperAdmin && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] font-medium rounded">
                <Shield className="h-2.5 w-2.5" /> SuperAdmin
              </span>
            )}
            {!isSuperAdmin && isAdminOrAbove && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] font-medium rounded">
                <Shield className="h-2.5 w-2.5" /> Admin
              </span>
            )}
            {!isAdminOrAbove && (
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
          <span>v2.0 — ZVP</span>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
