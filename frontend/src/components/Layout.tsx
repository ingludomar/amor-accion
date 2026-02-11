/**
 * Main layout component with navigation
 */
import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, School, Building2, Users, ClipboardList, BarChart3, Calendar } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation: { name: string; href: string; icon: any; disabled?: boolean }[] = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Sedes', href: '/campuses', icon: Building2 },
    { name: 'Usuarios', href: '/users', icon: Users },
    { name: 'Estudiantes', href: '/students', icon: School },
    { name: 'Años Escolares', href: '/school-years', icon: Calendar },
    { name: 'Asistencia', href: '/attendance', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Sistema de Asistencia
                </h1>
                <p className="text-xs text-gray-500">
                  Gestión Escolar
                </p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Usuario'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              const isDisabled = item.disabled;

              return (
                <button
                  key={item.name}
                  onClick={() => !isDisabled && navigate(item.href)}
                  disabled={isDisabled}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                  {isDisabled && (
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                      Próximamente
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
