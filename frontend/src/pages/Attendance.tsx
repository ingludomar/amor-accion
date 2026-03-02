import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { attendanceAPI, campusAPI, ClassSession } from '../lib/supabaseApi';
import { Calendar, Users, Plus, CheckCircle } from 'lucide-react';

export default function Attendance() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCampus, setSelectedCampus] = useState<string>('');

  // Fetch campuses
  const { data: campuses } = useQuery({
    queryKey: ['campuses'],
    queryFn: async () => {
      const { data } = await campusAPI.getAll();
      return data;
    },
  });

  // Fetch sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions', selectedDate, selectedCampus],
    queryFn: async () => {
      const { data } = await attendanceAPI.getClassSessions({ 
        date: selectedDate, 
        campus_id: selectedCampus 
      });
      return data;
    },
    enabled: !!selectedCampus,
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asistencia</h1>
          <p className="text-gray-600 mt-1">Gestión de asistencia de estudiantes</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sede
              </label>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Selecciona una sede</option>
                {campuses?.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Sesiones de Clase</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Cargando...</div>
          ) : sessions?.length === 0 ? (
            <div className="p-6 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No hay sesiones para esta fecha</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions?.map((session: ClassSession) => (
                <div key={session.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.start_time} - {session.end_time}
                    </p>
                    <p className="text-sm text-gray-500">
                      Sesión #{session.id.slice(0, 8)}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <CheckCircle size={18} />
                    Tomar Asistencia
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4">Acciones Rápidas</h3>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Plus size={18} />
              Nueva Sesión
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
              <Users size={18} />
              Ver Reportes
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
