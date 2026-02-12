import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';
import { Building2, Users, ClipboardCheck } from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const stats = [
    {
      name: 'Sedes',
      value: '1',
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      name: 'Estudiantes',
      value: '0',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Asistencia Hoy',
      value: '0%',
      icon: ClipboardCheck,
      color: 'bg-purple-500',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Bienvenido, {user?.full_name || user?.email}
          </h1>
          <p className="text-indigo-100">
            Sistema de gestión de asistencia - AmorAccion
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/students')}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
            >
              <Users className="w-6 h-6 text-indigo-600 mb-2" />
              <p className="font-medium text-gray-900">Ver Estudiantes</p>
              <p className="text-sm text-gray-500">Gestionar estudiantes</p>
            </button>
            
            <button
              onClick={() => navigate('/attendance')}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
            >
              <ClipboardCheck className="w-6 h-6 text-indigo-600 mb-2" />
              <p className="font-medium text-gray-900">Tomar Asistencia</p>
              <p className="text-sm text-gray-500">Registrar asistencia</p>
            </button>

            <button
              onClick={() => navigate('/campuses')}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
            >
              <Building2 className="w-6 h-6 text-indigo-600 mb-2" />
              <p className="font-medium text-gray-900">Ver Sedes</p>
              <p className="text-sm text-gray-500">Gestionar sedes</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}