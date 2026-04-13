import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import QrScanner from '../components/QrScanner';
import { groupAPI, topicAPI, sessionAPI, studentAPI, Group, Topic, ClassSession, AttendanceStatus } from '../lib/supabaseApi';
import { supabase } from '../lib/supabaseClient';
import {
  ClipboardList, ChevronRight, CheckCircle2, XCircle, Clock,
  Users, Calendar, BookOpen, Play, RotateCcw, ChevronDown,
  History, ChevronUp, Filter, QrCode, Search,
} from 'lucide-react';

// ─── Tipos locales ────────────────────────────────────────────────
type Tab  = 'tomar' | 'historial';
type Step = 'setup' | 'taking';

interface SessionSetup {
  group_id: string;
  topic_id: string;
  session_date: string;
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; bg: string; activeBg: string; icon: typeof CheckCircle2; color: string }> = {
  presente: { label: 'Presente',  bg: 'bg-green-50  border-green-200',  activeBg: 'bg-green-500',  icon: CheckCircle2, color: 'text-green-600' },
  ausente:  { label: 'Ausente',   bg: 'bg-red-50    border-red-200',    activeBg: 'bg-red-500',    icon: XCircle,      color: 'text-red-600'   },
  excusado: { label: 'Excusado',  bg: 'bg-yellow-50 border-yellow-200', activeBg: 'bg-yellow-500', icon: Clock,        color: 'text-yellow-600' },
};

// ─── Componente Historial ─────────────────────────────────────────
function HistorialView({ groups }: { groups: Group[] }) {
  const [filterGroup, setFilterGroup] = useState('');
  const [expandedId, setExpandedId]   = useState<string | null>(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions-history', filterGroup],
    queryFn: async () => {
      const { data } = await sessionAPI.getAll(filterGroup ? { group_id: filterGroup } : undefined);
      return data as ClassSession[];
    },
  });

  const { data: detail = [] } = useQuery({
    queryKey: ['session-detail', expandedId],
    queryFn: async () => {
      if (!expandedId) return [];
      const { data } = await sessionAPI.getAttendance(expandedId);
      return data;
    },
    enabled: !!expandedId,
  });

  const toggleExpand = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id));

  const statsOf = (records: any[]) => ({
    total:    records.length,
    present:  records.filter(r => r.status === 'presente').length,
    absent:   records.filter(r => r.status === 'ausente').length,
    excused:  records.filter(r => r.status === 'excusado').length,
  });

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Filtro por grupo */}
      <div className="card p-4 flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <select
          value={filterGroup}
          onChange={e => setFilterGroup(e.target.value)}
          className="flex-1 text-sm border-0 outline-none bg-transparent text-gray-700"
        >
          <option value="">Todos los grupos</option>
          {groups.map((g: any) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay sesiones registradas</p>
        </div>
      ) : (
        <div className="space-y-2 pb-8">
          {sessions.map((s: any) => {
            const isOpen    = expandedId === s.id;
            const records   = isOpen ? detail : [];
            const stats     = statsOf(records);
            const pct       = stats.total ? Math.round((stats.present / stats.total) * 100) : null;
            const dateLabel = new Date(s.session_date + 'T00:00:00').toLocaleDateString('es-CO', {
              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
            });

            return (
              <div key={s.id} className="card overflow-hidden">
                {/* Fila resumen */}
                <button
                  onClick={() => toggleExpand(s.id)}
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm capitalize">{dateLabel}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {s.group?.name}
                      {s.topic?.title ? ` · ${s.topic.title}` : ''}
                    </p>
                  </div>
                  {isOpen && pct !== null && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      pct >= 80 ? 'bg-green-100 text-green-700' :
                      pct >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                    }`}>
                      {pct}%
                    </span>
                  )}
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                           : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>

                {/* Detalle expandido */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-green-50 rounded-lg py-2">
                        <p className="font-bold text-green-700">{stats.present}</p>
                        <p className="text-green-500">Presentes</p>
                      </div>
                      <div className="bg-red-50 rounded-lg py-2">
                        <p className="font-bold text-red-700">{stats.absent}</p>
                        <p className="text-red-500">Ausentes</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg py-2">
                        <p className="font-bold text-yellow-700">{stats.excused}</p>
                        <p className="text-yellow-500">Excusados</p>
                      </div>
                    </div>

                    {/* Lista estudiantes */}
                    {records.length === 0 ? (
                      <p className="text-xs text-center text-gray-400 py-2">Sin registros de asistencia</p>
                    ) : (
                      <div className="space-y-1">
                        {records.map((r: any) => {
                          const cfg = STATUS_CONFIG[r.status as AttendanceStatus];
                          const Icon = cfg?.icon ?? Clock;
                          return (
                            <div key={r.id} className="flex items-center gap-3 py-1.5">
                              <Icon className={`w-4 h-4 flex-shrink-0 ${cfg?.color ?? 'text-gray-400'}`} />
                              <span className="text-sm text-gray-800 flex-1">{r.student?.full_name}</span>
                              <span className={`text-xs font-medium ${cfg?.color ?? 'text-gray-400'}`}>{cfg?.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────
export default function Attendance() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const [tab, setTab]                 = useState<Tab>('tomar');
  const [step, setStep]               = useState<Step>('setup');
  const [setup, setSetup]             = useState<SessionSetup>({ group_id: '', topic_id: '', session_date: today });
  const [activeSession, setActiveSession] = useState<ClassSession | null>(null);
  const [attendance, setAttendance]   = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving]           = useState<string | null>(null);  // student_id que se está guardando
  const [qrOpen, setQrOpen]           = useState(false);
  const [qrResult, setQrResult]       = useState<{ name: string; status: 'success' | 'already' | 'not_found' } | null>(null);
  const [searchTerm, setSearchTerm]   = useState('');

  // ─── Queries ──────────────────────────────────────────────────
  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => { const { data } = await groupAPI.getAll(); return data as Group[]; },
  });

  const { data: topics = [] } = useQuery({
    queryKey: ['topics', setup.group_id],
    queryFn: async () => {
      const { data } = await topicAPI.getAll({ group_id: setup.group_id || undefined, is_done: false });
      return data as Topic[];
    },
    enabled: !!setup.group_id,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-group', setup.group_id],
    queryFn: async () => {
      const { data } = await studentAPI.getAll({ group_id: setup.group_id, is_active: true });
      return data;
    },
    enabled: !!setup.group_id,
  });

  // Buscar si ya existe sesión para este grupo+fecha
  const { data: existingSession } = useQuery({
    queryKey: ['session-exists', setup.group_id, setup.session_date],
    queryFn: async () => {
      const { data } = await supabase
        .from('class_sessions')
        .select('*, group:groups(id, name), topic:topics(id, title)')
        .eq('group_id', setup.group_id)
        .eq('session_date', setup.session_date)
        .maybeSingle();
      return data as ClassSession | null;
    },
    enabled: !!setup.group_id && !!setup.session_date,
  });

  // ─── Iniciar sesión ───────────────────────────────────────────
  const createSession = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await sessionAPI.create({
        group_id: setup.group_id,
        topic_id: setup.topic_id || undefined,
        teacher_id: user?.id,
        session_date: setup.session_date,
      });
      return data;
    },
    onSuccess: async (session) => {
      await loadSession(session);
    },
    onError: (e: any) => alert('Error al crear sesión: ' + e.message),
  });

  const loadSession = async (session: ClassSession) => {
    setActiveSession(session);
    // Cargar asistencia existente si hay
    const { data: records } = await sessionAPI.getAttendance(session.id);
    const map: Record<string, AttendanceStatus> = {};
    records.forEach((r: any) => { map[r.student_id] = r.status; });
    setAttendance(map);
    setStep('taking');
    // Marcar tema como realizado si tiene topic_id
    if (session.topic_id) {
      await topicAPI.update(session.topic_id, {
        is_done: true,
        actual_date: session.session_date,
      });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    }
  };

  const handleStart = async () => {
    if (!setup.group_id) return alert('Selecciona un grupo');
    if (existingSession) {
      await loadSession(existingSession);
    } else {
      createSession.mutate();
    }
  };

  // ─── Marcar asistencia ────────────────────────────────────────
  const markStudent = async (studentId: string, status: AttendanceStatus) => {
    if (!activeSession) return;
    // Si ya tiene ese estado, lo quita (toggle)
    const current = attendance[studentId];
    if (current === status) {
      setAttendance(a => { const n = { ...a }; delete n[studentId]; return n; });
      // Borrar registro
      await supabase
        .from('attendance_records')
        .delete()
        .eq('session_id', activeSession.id)
        .eq('student_id', studentId);
      return;
    }

    setSaving(studentId);
    setAttendance(a => ({ ...a, [studentId]: status }));
    try {
      await sessionAPI.markAttendance(activeSession.id, studentId, status);
    } catch (e: any) {
      // Revertir en caso de error
      setAttendance(a => { const n = { ...a }; delete n[studentId]; return n; });
      alert('Error al guardar: ' + e.message);
    } finally {
      setSaving(null);
    }
  };

  // ─── Escaneo QR ───────────────────────────────────────────────
  const handleQrScan = useCallback((studentCode: string) => {
    const student = students.find((s: any) => s.student_code === studentCode);
    if (!student) {
      setQrResult({ name: studentCode, status: 'not_found' });
      return;
    }
    if (attendance[student.id] === 'presente') {
      setQrResult({ name: student.full_name, status: 'already' });
      return;
    }
    setQrResult({ name: student.full_name, status: 'success' });
    markStudent(student.id, 'presente');
  }, [students, attendance, activeSession]);

  // ─── Estadísticas ─────────────────────────────────────────────
  const total     = students.length;
  const marked    = Object.keys(attendance).length;
  const presentes = Object.values(attendance).filter(s => s === 'presente').length;
  const ausentes  = Object.values(attendance).filter(s => s === 'ausente').length;
  const excusados = Object.values(attendance).filter(s => s === 'excusado').length;
  const pct       = total ? Math.round((presentes / total) * 100) : 0;

  const selectedGroup = groups.find((g: any) => g.id === setup.group_id);

  // ─── VISTA: HISTORIAL ─────────────────────────────────────────
  if (tab === 'historial') {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="page-header">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <ClipboardList className="w-7 h-7" /> Asistencia
            </h1>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            <button onClick={() => setTab('tomar')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 transition">
              Tomar asistencia
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-blue-600 shadow-sm flex items-center gap-1.5">
              <History className="w-4 h-4" /> Historial
            </button>
          </div>
          <HistorialView groups={groups} />
        </div>
      </Layout>
    );
  }

  // ─── VISTA: CONFIGURACIÓN ─────────────────────────────────────
  if (step === 'setup') {
    return (
      <Layout>
        <div className="space-y-5 max-w-lg mx-auto">
          <div className="page-header">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <ClipboardList className="w-7 h-7" /> Asistencia
            </h1>
            <p className="text-blue-100 text-sm mt-1">Configura la sesión antes de comenzar</p>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-blue-600 shadow-sm">
              Tomar asistencia
            </button>
            <button onClick={() => setTab('historial')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 transition flex items-center gap-1.5">
              <History className="w-4 h-4" /> Historial
            </button>
          </div>

          <div className="card p-5 space-y-5">
            {/* Fecha */}
            <div>
              <label className="label flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" /> Fecha de la sesión
              </label>
              <input
                type="date"
                value={setup.session_date}
                onChange={e => setSetup(s => ({ ...s, session_date: e.target.value }))}
                className="input-field text-base"
              />
            </div>

            {/* Grupo */}
            <div>
              <label className="label flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400" /> Grupo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {groups.map((g: any) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSetup(s => ({ ...s, group_id: g.id, topic_id: '' }))}
                    className={`py-3 px-2 rounded-xl border-2 text-sm font-semibold transition ${
                      setup.group_id === g.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tema (opcional) */}
            {setup.group_id && (
              <div>
                <label className="label flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-gray-400" /> Tema <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <select
                    value={setup.topic_id}
                    onChange={e => setSetup(s => ({ ...s, topic_id: e.target.value }))}
                    className="input-field pr-10 appearance-none text-base"
                  >
                    <option value="">Sin tema asignado</option>
                    {topics.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.title} — {new Date(t.planned_date + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Sesión existente */}
            {existingSession && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">Ya existe una sesión para este grupo y fecha</p>
                <p className="text-amber-600">Se continuará la sesión existente con la asistencia ya registrada.</p>
              </div>
            )}

            {/* Estudiantes del grupo */}
            {setup.group_id && (
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{students.length} estudiantes</p>
                  <p className="text-xs text-gray-500">en el grupo {selectedGroup?.name}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={!setup.group_id || createSession.isPending}
              className="btn-primary w-full py-4 text-base"
            >
              <Play className="w-5 h-5" />
              {createSession.isPending ? 'Creando sesión...' : existingSession ? 'Continuar sesión' : 'Iniciar asistencia'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── VISTA: TOMA DE ASISTENCIA ────────────────────────────────
  return (
    <Layout>
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Header sticky */}
        <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-gray-900">{selectedGroup?.name}</h2>
              <p className="text-xs text-gray-500">
                {new Date(setup.session_date + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setQrResult(null); setQrOpen(true); }}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-xl font-medium"
              >
                <QrCode className="w-4 h-4" /> QR
              </button>
              <button
                onClick={() => setStep('setup')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" /> Nueva
              </button>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
              style={{ width: `${total ? (marked / total) * 100 : 0}%` }}
            />
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-gray-50 rounded-lg py-1.5">
              <p className="font-bold text-gray-700">{marked}/{total}</p>
              <p className="text-gray-400">Marcados</p>
            </div>
            <div className="bg-green-50 rounded-lg py-1.5">
              <p className="font-bold text-green-700">{presentes}</p>
              <p className="text-green-500">Presentes</p>
            </div>
            <div className="bg-red-50 rounded-lg py-1.5">
              <p className="font-bold text-red-700">{ausentes}</p>
              <p className="text-red-500">Ausentes</p>
            </div>
            <div className="bg-yellow-50 rounded-lg py-1.5">
              <p className="font-bold text-yellow-700">{excusados}</p>
              <p className="text-yellow-500">Excusados</p>
            </div>
          </div>

          {/* Búsqueda */}
          {students.length > 0 && (
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-field pl-9 py-2 text-sm"
              />
            </div>
          )}
        </div>

        {/* Lista de estudiantes */}
        {students.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-14 h-14 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay estudiantes en este grupo</p>
          </div>
        ) : (
          <div className="space-y-2 pb-8">
            {students
            .filter((s: any) => !searchTerm || s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || s.student_code.includes(searchTerm))
            .map((student: any, idx: number) => {
              const status = attendance[student.id] as AttendanceStatus | undefined;
              const isSaving = saving === student.id;

              return (
                <div
                  key={student.id}
                  className={`card p-4 transition-all duration-200 ${
                    status === 'presente' ? 'border-green-300 bg-green-50/50' :
                    status === 'ausente'  ? 'border-red-300   bg-red-50/50'   :
                    status === 'excusado' ? 'border-yellow-300 bg-yellow-50/50' :
                    'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {/* Número + foto */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        {student.photo_url ? (
                          <img src={student.photo_url} alt={student.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {student.first_name?.[0]}{student.last_name?.[0]}
                          </span>
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border border-gray-200 text-xs flex items-center justify-center text-gray-500 font-medium shadow-sm">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Nombre */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 leading-tight">{student.full_name}</p>
                      <p className="text-xs text-gray-400">{student.student_code}</p>
                    </div>

                    {/* Indicador de guardado */}
                    {isSaving && (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  {/* Botones de estado — grandes para touch */}
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, typeof STATUS_CONFIG[AttendanceStatus]][]).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      const isActive = status === key;
                      return (
                        <button
                          key={key}
                          onClick={() => markStudent(student.id, key)}
                          disabled={isSaving}
                          className={`py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all duration-150 active:scale-95 ${
                            isActive
                              ? `${cfg.activeBg} border-transparent text-white shadow-md`
                              : `${cfg.bg} ${cfg.color} hover:opacity-80`
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-semibold">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Resumen final */}
            {marked === total && total > 0 && (
              <div className="card p-5 border-green-200 bg-green-50 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="font-bold text-green-800 text-lg">¡Lista completa!</p>
                <p className="text-sm text-green-600 mt-1">
                  {presentes} presentes · {pct}% de asistencia
                </p>
                <button
                  onClick={() => setStep('setup')}
                  className="btn-primary mt-4 bg-green-600 hover:bg-green-700"
                >
                  <ChevronRight className="w-5 h-5" /> Finalizar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {qrOpen && (
        <QrScanner
          onScan={handleQrScan}
          onClose={() => setQrOpen(false)}
          lastResult={qrResult}
        />
      )}
    </Layout>
  );
}
