import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePermission } from '../hooks/usePermission';
import { getLogoUrl } from '../lib/storageApi';
import SuggestionModal from './SuggestionModal';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import {
  LogOut, School, Building2, Users, ClipboardList, BarChart3,
  BookOpen, Menu, X, UserCircle, Settings, UserCheck, ShieldCheck, MessageSquare,
  Download,
} from 'lucide-react';

interface LayoutProps { children: ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [logoUrl, setLogoUrl]                 = useState<string | null>(null);
  const [logoError, setLogoError]             = useState(false);
  const [suggestionOpen, setSuggestionOpen]   = useState(false);
  const { canInstall, install: handleInstall } = useInstallPrompt();

  const dashboard  = usePermission('dashboard');
  const campuses   = usePermission('campuses');
  const students   = usePermission('students');
  const groups     = usePermission('groups');
  const topics     = usePermission('topics');
  const attendance = usePermission('attendance');
  const reports    = usePermission('reports');
  const users      = usePermission('users');
  const settings   = usePermission('settings');
  const roles       = usePermission('roles');
  const suggestions = usePermission('suggestions');

  useEffect(() => { setLogoUrl(getLogoUrl()); }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const allNavItems = [
    { name: 'Dashboard',     href: '/dashboard',  icon: BarChart3,    show: dashboard.canView },
    { name: 'Estudiantes',   href: '/students',   icon: School,       show: students.canView },
    { name: 'Grupos',        href: '/groups',     icon: Users,        show: groups.canView },
    { name: 'Temas',         href: '/topics',     icon: BookOpen,     show: topics.canView },
    { name: 'Asistencia',    href: '/attendance', icon: ClipboardList,show: attendance.canView },
    { name: 'Reportes',      href: '/reports',    icon: BarChart3,    show: reports.canView },
    { name: 'Sedes',         href: '/campuses',   icon: Building2,    show: campuses.canView },
    { name: 'Usuarios',      href: '/users',      icon: UserCheck,    show: users.canView },
    { name: 'Roles',         href: '/roles',      icon: ShieldCheck,  show: roles.canView },
    { name: 'Configuración', href: '/settings',     icon: Settings,      show: settings.canView },
    { name: 'Sugerencias',   href: '/suggestions',  icon: MessageSquare, show: suggestions.canView },
  ];

  const navigation = allNavItems.filter(i => i.show);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link to="/dashboard" onClick={() => setSidebarOpen(false)}
        className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-40" />
          <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
            {logoUrl && !logoError
              ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" onError={() => setLogoError(true)} />
              : <School className="w-5 h-5 text-white" />}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">Amor Acción</p>
          <p className="text-xs text-gray-400">Asistencia</p>
        </div>
      </Link>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navigation.map(item => {
          const Icon     = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <button key={item.name}
              onClick={() => { navigate(item.href); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.name}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-100 p-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">{user?.full_name || user?.email}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role || '—'}</p>
          </div>
        </div>
        {canInstall && (
          <button onClick={() => { handleInstall(); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-600 hover:bg-green-50 transition">
            <Download className="w-4 h-4" />
            Instalar app
          </button>
        )}
        <button onClick={() => { setSuggestionOpen(true); setSidebarOpen(false); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-50 transition">
          <MessageSquare className="w-4 h-4" />
          Enviar sugerencia
        </button>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-white border-r border-gray-100 shadow-sm">
        <SidebarContent />
      </aside>

      {/* ── Sidebar mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white shadow-xl flex flex-col">
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar mobile */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition">
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-sm font-bold text-gray-900">Amor Acción</p>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-white" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>

      {suggestionOpen && <SuggestionModal onClose={() => setSuggestionOpen(false)} />}
    </div>
  );
}
