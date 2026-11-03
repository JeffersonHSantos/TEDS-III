import { NavLink, useNavigate } from 'react-router-dom';
import {
  Clock,
  FileSpreadsheet,
  Home,
  LogOut,
  Settings,
  UserPlus,
  Users,
  BarChart3,
  Award,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/format';

const LINKS = [
  { to: '/', label: 'Início', icon: Home, adminOnly: false },
  { to: '/cadastro', label: 'Cadastro', icon: UserPlus, adminOnly: true },
  { to: '/usuarios', label: 'Usuários', icon: Users, adminOnly: true },
  { to: '/folha', label: 'Folha', icon: FileSpreadsheet, adminOnly: false },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3, adminOnly: false },
  { to: '/funcionario', label: 'Destaque', icon: Award, adminOnly: false },
  { to: '/configs', label: 'Configurações', icon: Settings, adminOnly: false },
];

export default function AppShell({ children }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const visibleLinks = LINKS.filter((link) => !link.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Clock />
            </div>
            <div className="leading-tight">
              <p className="font-semibold tracking-tight">MegaPonto</p>
              <p className="text-xs text-muted-foreground">RH e folha de pagamento</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <link.icon className="size-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {getInitials(user?.nome)}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium">{user?.nome}</p>
                <p className="text-[11px] text-muted-foreground">
                  {isAdmin ? 'Administrador' : 'Colaborador'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut data-icon="inline-start" />
              Sair
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 lg:hidden">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                    isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground',
                  )
                }
              >
                <link.icon className="size-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
      <Toaster position="top-right" theme="dark" richColors />
    </div>
  );
}
