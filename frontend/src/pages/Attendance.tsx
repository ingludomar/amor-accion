import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import {
  attendanceAPI,
  campusAPI,
  ClassSession,
  SessionStatus,
  AttendanceStatus,
  CreateSessionRequest,
  CreateAttendanceRequest,
} from '../lib/api';
import {
  Calendar,
  Users,
  Plus,
  X,
  Square,
  Trash2,
  BarChart3,
  Home,
  ChevronRight,
} from 'lucide-react';

export default function Attendance() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // Fetch campuses for filter
  const { data: campusesResponse } = useQuery({
    queryKey: ['campuses'],
    queryFn: async () => {
      const response = await campusAPI.getAll({ skip: 0, limit: 100 });
      return response.data;
    },
  });

  // Fetch sessions
  const { data: sessionsResponse, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['sessions', selectedDate, selectedCampus],
    queryFn: async () => {
      const response = await attendanceAPI.getSessions({
        date: selectedDate,
        campus_id: selectedCampus || undefined,
        skip: 0,
        limit: 100,
      });
      return response.data;
    },
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (data: CreateSessionRequest) => attendanceAPI.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setShowCreateModal(false);
    },
  });

  // Close session mutation
  const closeSessionMutation = useMutation({
    mutationFn: (id: string) => attendanceAPI.closeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  // Cancel session mutation
  const cancelSessionMutation = useMutation({
    mutationFn: (id: string) => attendanceAPI.cancelSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const sessions = sessionsResponse?.data?.items || [];

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case SessionStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case SessionStatus.CLOSED:
        return 'bg-green-100 text-green-800';
      case SessionStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.SCHEDULED:
        return 'Programada';
      case SessionStatus.IN_PROGRESS:
        return 'En Progreso';
      case SessionStatus.CLOSED:
        return 'Cerrada';
      case SessionStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <Layout>
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 hover:text-blue-600 transition"
        >
          <Home size={16} />
          Dashboard
        </button>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-900 font-medium">Asistencia</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Asistencia</h1>
          <p className="text-sm text-gray-600 mt-1">Administra las sesiones de clase y registra asistencia</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Sesión
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sede
            </label>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las sedes</option>
              {campusesResponse?.data?.items.map((campus: any) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoadingSessions ? (
          <div className="p-8 text-center text-gray-500">Cargando sesiones...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No hay sesiones programadas para esta fecha</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asistencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session: ClassSession) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.start_time} - {session.end_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.course_group_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {session.topic || 'Sin tema'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {session.teacher_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session.status)}`}>
                      {getStatusLabel(session.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {session.status === SessionStatus.CLOSED ? (
                      <span className="text-green-600">Completada</span>
                    ) : session.status === SessionStatus.CANCELLED ? (
                      <span className="text-red-600">Cancelada</span>
                    ) : (
                      <span className="text-gray-400">Pendiente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      {(session.status === SessionStatus.SCHEDULED || 
                        session.status === SessionStatus.IN_PROGRESS) && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowAttendanceModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Tomar asistencia"
                          >
                            <Users size={18} />
                          </button>
                          {session.status === SessionStatus.IN_PROGRESS && (
                            <button
                              onClick={() => closeSessionMutation.mutate(session.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Cerrar sesión"
                            >
                              <Square size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => cancelSessionMutation.mutate(session.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Cancelar sesión"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateSessionModal
          campuses={campusesResponse?.data?.items || []}
          selectedDate={selectedDate}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createSessionMutation.mutate(data)}
        />
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && selectedSession && (
        <AttendanceModal
          session={selectedSession}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedSession(null);
          }}
        />
      )}
    </div>
    </Layout>
  );
}

// Create Session Modal Component
function CreateSessionModal({
  campuses,
  selectedDate,
  onClose,
  onSubmit,
}: {
  campuses: any[];
  selectedDate: string;
  onClose: () => void;
  onSubmit: (data: CreateSessionRequest) => void;
}) {
  const [formData, setFormData] = useState<CreateSessionRequest>({
    course_group_id: '',
    subject_id: '',
    teacher_id: '',
    session_date: selectedDate,
    start_time: '08:00',
    end_time: '09:00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg m-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Crear Sesión de Clase</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID del Curso *
              </label>
              <input
                type="text"
                value={formData.course_group_id}
                onChange={(e) => setFormData({ ...formData, course_group_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID de la Materia *
              </label>
              <input
                type="text"
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID del Profesor *
            </label>
            <input
              type="text"
              value={formData.teacher_id}
              onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={formData.session_date}
              onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Inicio *
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Fin *
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tema
            </label>
            <input
              type="text"
              value={formData.topic || ''}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Tema de la clase"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Crear Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Attendance Modal Component
function AttendanceModal({
  session,
  onClose,
}: {
  session: ClassSession;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [attendanceData, setAttendanceData] = useState<Map<string, AttendanceStatus>>(new Map());
  const [notes, setNotes] = useState<Map<string, string>>(new Map());
  const [showStats, setShowStats] = useState(false);

  // Fetch session attendance
  const { data: attendanceResponse, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance', session.id],
    queryFn: async () => {
      const response = await attendanceAPI.getSessionAttendance(session.id);
      return response.data;
    },
  });

  // Fetch stats
  const { data: statsResponse } = useQuery({
    queryKey: ['attendance-stats', session.id],
    queryFn: async () => {
      const response = await attendanceAPI.getSessionStats(session.id);
      return response.data;
    },
    enabled: showStats,
  });

  // Take attendance mutation
  const takeAttendanceMutation = useMutation({
    mutationFn: (data: CreateAttendanceRequest) => attendanceAPI.takeAttendance(session.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', session.id] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats', session.id] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  // Mock student data - in production this would come from the course enrollment
  const mockStudents = [
    { id: '1', name: 'Estudiante 1', code: 'STU001' },
    { id: '2', name: 'Estudiante 2', code: 'STU002' },
    { id: '3', name: 'Estudiante 3', code: 'STU003' },
    { id: '4', name: 'Estudiante 4', code: 'STU004' },
    { id: '5', name: 'Estudiante 5', code: 'STU005' },
  ];

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData(new Map(attendanceData.set(studentId, status)));
  };

  const handleSave = () => {
    const records = Array.from(attendanceData.entries()).map(([studentId, status]) => ({
      student_id: studentId,
      status,
      notes: notes.get(studentId),
    }));

    takeAttendanceMutation.mutate({ records });
  };

  const getStatusButtonClass = (studentId: string, status: AttendanceStatus) => {
    const currentStatus = attendanceData.get(studentId);
    const isSelected = currentStatus === status;
    
    const baseClasses = 'px-3 py-1 rounded text-sm font-medium transition';
    
    if (isSelected) {
      switch (status) {
        case AttendanceStatus.PRESENT:
          return `${baseClasses} bg-green-500 text-white`;
        case AttendanceStatus.ABSENT:
          return `${baseClasses} bg-red-500 text-white`;
        case AttendanceStatus.LATE:
          return `${baseClasses} bg-yellow-500 text-white`;
        case AttendanceStatus.EXCUSED:
          return `${baseClasses} bg-blue-500 text-white`;
        default:
          return `${baseClasses} bg-gray-200 text-gray-700`;
      }
    }
    
    return `${baseClasses} bg-gray-100 text-gray-600 hover:bg-gray-200`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl m-4 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tomar Asistencia</h2>
              <p className="text-sm text-gray-600">
                {session.session_date} | {session.start_time} - {session.end_time}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <BarChart3 size={18} />
                {showStats ? 'Ocultar Stats' : 'Ver Stats'}
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {showStats && statsResponse?.data && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Estadísticas de Asistencia</h3>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{statsResponse.data.total_students}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statsResponse.data.present}</div>
                  <div className="text-xs text-gray-600">Presentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{statsResponse.data.absent}</div>
                  <div className="text-xs text-gray-600">Ausentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{statsResponse.data.late}</div>
                  <div className="text-xs text-gray-600">Tarde</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{statsResponse.data.attendance_rate}%</div>
                  <div className="text-xs text-gray-600">Tasa</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {mockStudents.map((student) => (
              <div key={student.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(student.id, AttendanceStatus.PRESENT)}
                      className={getStatusButtonClass(student.id, AttendanceStatus.PRESENT)}
                    >
                      Presente
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, AttendanceStatus.ABSENT)}
                      className={getStatusButtonClass(student.id, AttendanceStatus.ABSENT)}
                    >
                      Ausente
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, AttendanceStatus.LATE)}
                      className={getStatusButtonClass(student.id, AttendanceStatus.LATE)}
                    >
                      Tarde
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, AttendanceStatus.EXCUSED)}
                      className={getStatusButtonClass(student.id, AttendanceStatus.EXCUSED)}
                    >
                      Justificado
                    </button>
                  </div>
                </div>
                {attendanceData.get(student.id) && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Notas (opcional)"
                      value={notes.get(student.id) || ''}
                      onChange={(e) => setNotes(new Map(notes.set(student.id, e.target.value)))}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={attendanceData.size === 0 || takeAttendanceMutation.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {takeAttendanceMutation.isPending ? 'Guardando...' : 'Guardar Asistencia'}
          </button>
        </div>
      </div>
    </div>
  );
}
