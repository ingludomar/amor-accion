/**
 * Dashboard page - main overview
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { studentAPI, campusAPI } from '../lib/api';
import Layout from '../components/Layout';
import { Building2, Users, ClipboardCheck, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [campusCount, setCampusCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, campusesRes] = await Promise.all([
          studentAPI.getAll({ skip: 0, limit: 1 }),
          campusAPI.getAll({ skip: 0, limit: 1 })
        ]);

        setStudentCount(studentsRes.data.data.total || 0);
        setCampusCount(campusesRes.data.data.total || 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      name: 'Sedes Activas',
      value: isLoading ? '...' : (campusCount || 0),
      icon: Building2,
      color: 'bg-blue-500',
      change: `Sistema de asistencia`,
    },
    {
      name: 'Estudiantes',
      value: isLoading ? '...' : (studentCount || 0),
      icon: Users,
      color: 'bg-green-500',
      change: 'Gestión activa',
      disabled: false,
    },
    {
      name: 'Asistencia Hoy',
      value: '0%',
      icon: ClipboardCheck,
      color: 'bg-purple-500',
      change: 'Próximamente',
      disabled: true,
    },
    {
      name: 'Reportes',
      value: '0',
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: 'Próximamente',
      disabled: true,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenido, {user?.full_name}
          </h2>
          <p className="text-gray-600">
            Resumen de tu sistema de gestión de asistencia
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
              <Building2 className="w-4 h-4" />
              Sede Principal
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className={`bg-white rounded-lg shadow-sm p-6 ${
                  stat.disabled ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.disabled && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Próximamente
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/campuses')}
              className="flex items-center gap-3 p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition text-left"
            >
              <Building2 className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="font-medium text-gray-900">Gestionar Sedes</p>
                <p className="text-sm text-gray-600">Ver y administrar campus</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/students')}
              className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition text-left"
            >
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Gestionar Estudiantes</p>
                <p className="text-sm text-gray-600">Ver y registrar estudiantes</p>
              </div>
            </button>

            <button
              disabled
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg text-left opacity-50 cursor-not-allowed"
            >
              <ClipboardCheck className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Tomar Asistencia</p>
                <p className="text-sm text-gray-600">Próximamente</p>
              </div>
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">
            Estado del Sistema
          </h3>
          <p className="text-indigo-100 mb-4">
            Sistema funcionando correctamente. Versión 1.0.0 MVP
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-indigo-100">Implementado</p>
              <p className="text-2xl font-bold">70%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-indigo-100">Rol</p>
              <p className="text-2xl font-bold">{user?.role || 'Usuario'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-indigo-100">Estado</p>
              <p className="text-2xl font-bold">{user?.is_active ? 'Activo' : 'Inactivo'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
