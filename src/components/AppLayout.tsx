import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Building2, Truck, Factory, LogOut } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { ObraSwitcher } from './ObraSwitcher';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pavimentos', label: 'Pavimentos', icon: Building2 },
  { to: '/caminhoes', label: 'Caminhões', icon: Truck },
  { to: '/fornecedores', label: 'Fornecedores', icon: Factory },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado');
  };
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-56 flex-col border-r bg-card shrink-0 sticky top-0 h-screen">
        <div className="flex items-center px-5 py-5 border-b">
          <img src="/logofinaldash.png" alt="MPaFlow" className="h-17 max-w-full w-auto object-contain" />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with notification bell */}
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="hidden items-center gap-2.5 sm:flex md:hidden">
              <img src="/logofinaldash.png" alt="MPaFlow" className="h-10 max-w-[160px] w-auto object-contain" />
            </div>
            <div className="hidden md:block" />
            <div className="flex items-center gap-2">
              <ObraSwitcher />
              {user && (
                <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[200px]">
                  {user.email}
                </span>
              )}
              <NotificationCenter />
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <nav className="flex gap-1 px-3 pb-2 overflow-x-auto md:hidden">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent'
                  )
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
