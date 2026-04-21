import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { appSettingsAPI, absenceAPI, whatsappLogAPI, calendarAPI, topicAPI } from '../lib/supabaseApi';
// whatsappLogAPI used in handleAvisar inside JSX
import {
  Building2, Users, ClipboardCheck, TrendingUp,
  Calendar, AlertTriangle, ChevronRight, CheckCircle2,
  XCircle, Clock, Bell, MessageCircle, Check, BookOpen, PartyPopper,
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────
const today     = new Date().toISOString().split('T')[0];
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().split('T')[0];

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate  = useNavigate();
  const queryClient = useQueryClient();

  // Total estudiantes activos
  const { data: totalStudents = 0 } = useQuery({
    queryKey: ['dash-students'],
    queryFn: async () => {
      const { count } = await supabase
        .from('students').select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      return count ?? 0;
    },
  });

  // Total sedes activas
  const { data: totalCampuses = 0 } = useQuery({
    queryKey: ['dash-campuses'],
    queryFn: async () => {
      const { count } = await supabase
        .from('campuses').select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      return count ?? 0;
    },
  });

  // Sesiones este mes
  const { data: totalSessions = 0 } = useQuery({
    queryKey: ['dash-sessions'],
    queryFn: async () => {
      const { count } = await supabase
        .from('class_sessions').select('*', { count: 'exact', head: true })
        .gte('session_date', monthStart);
      return count ?? 0;
    },
  });

  // Asistencia hoy: % presentes sobre registros de hoy
  const { data: todayPct = null } = useQuery({
    queryKey: ['dash-today'],
    queryFn: async () => {
      const { data: sessions } = await supabase
        .from('class_sessions').select('id').eq('session_date', today);
      if (!sessions?.length) return null;
      const ids = sessions.map(s => s.id);
      const { data: records } = await supabase
        .from('attendance_records').select('status').in('session_id', ids);
      if (!records?.length) return null;
      const present = records.filter(r => r.status === 'presente').length;
      return Math.round((present / records.length) * 100);
    },
  });

  // Últimas 5 sesiones
  const { data: recentSessions = [] } = useQuery({
    queryKey: ['dash-recent-sessions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('class_sessions')
        .select('id, session_date, group:groups(name), topic:topics(title)')
        .order('session_date', { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  // Umbral de inasistencia
  const { data: threshold = 3 } = useQuery({
    queryKey: ['app-settings', 'absence_threshold'],
    queryFn: async () => {
      const val = await appSettingsAPI.get('absence_threshold');
      return val ? parseInt(val) : 3;
    },
  });

  // Estudiantes en riesgo (ausencias consecutivas >= umbral)
  const { data: atRiskStudents = [] } = useQuery({
    queryKey: ['dash-at-risk', threshold],
    queryFn: () => absenceAPI.getAtRisk(threshold),
    enabled: threshold > 0,
  });

  // Notificaciones WhatsApp recientes (para mostrar indicador)
  const { data: recentNotifications = [] } = useQuery({
    queryKey: ['wa-notifications-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_notifications')
        .select('student_id, sent_by_name, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Eventos y temas de hoy
  const { data: todayEvents = [] } = useQuery({
    queryKey: ['calendar-today', today],
    queryFn: () => calendarAPI.getByDate(today),
  });

  const { data: todayTopicsResp } = useQuery({
    queryKey: ['topics-today', today],
    queryFn: () => topicAPI.getAll(),
  });
  const todayTopics = (todayTopicsResp?.data ?? []).filter((t: any) => t.planned_date === today);

  // Mapa: student_id → última notificación
  const notifMap: Record<string, { sentBy: string; date: string }> = {};
  recentNotifications.forEach((n: any) => {
    if (!notifMap[n.student_id]) {
      notifMap[n.student_id] = {
        sentBy: n.sent_by_name,
        date: new Date(n.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
    }
  });

  const stats = [
    { label: 'Estudiantes activos', value: totalStudents, icon: Users,         color: 'bg-blue-500',   href: '/students' },
    { label: 'Sedes activas',       value: totalCampuses, icon: Building2,     color: 'bg-indigo-500', href: '/campuses' },
    { label: 'Sesiones este mes',   value: totalSessions, icon: Calendar,      color: 'bg-purple-500', href: '/attendance' },
    {
      label: 'Asistencia hoy',
      value: todayPct !== null ? `${todayPct}%` : '—',
      icon: TrendingUp,
      color: todayPct === null ? 'bg-gray-400' : todayPct >= 80 ? 'bg-green-500' : todayPct >= 50 ? 'bg-yellow-500' : 'bg-red-500',
      href: '/attendance',
    },
  ];

  const statusIcon = (s: string) =>
    s === 'presente' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> :
    s === 'ausente'  ? <XCircle      className="w-3.5 h-3.5 text-red-500"   /> :
                       <Clock        className="w-3.5 h-3.5 text-yellow-500" />;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">
            Bienvenido, {user?.full_name?.split(' ')[0] || user?.email}
          </h1>
          <p className="text-blue-100 text-sm">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.label} onClick={() => navigate(s.href)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition text-left">
                <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </button>
            );
          })}
        </div>

        {/* Widget: Hoy */}
        {(todayTopics.length > 0 || todayEvents.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Hoy
              </h2>
              <button onClick={() => navigate('/calendar')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Ver calendario <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {todayTopics.map((t: any) => (
                <div key={'t-' + t.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    <p className="text-xs text-gray-500">Clase · {t.group?.name}</p>
                  </div>
                  {t.is_done && <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Realizado</span>}
                </div>
              ))}
              {todayEvents.map(e => (
                <div key={'e-' + e.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <PartyPopper className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{e.title}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {e.event_type}
                      {e.event_time && ` · ${e.event_time.slice(0, 5)}`}
                      {e.campus && ` · ${e.campus.name}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Sesiones recientes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Sesiones recientes</h2>
              <button onClick={() => navigate('/attendance')}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Ver historial <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Sin sesiones registradas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSessions.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.group?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{s.topic?.title || 'Sin tema'}</p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(s.session_date + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estudiantes en riesgo */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900">Estudiantes en riesgo</h2>
                {atRiskStudents.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                    <Bell className="w-3 h-3" /> {atRiskStudents.length}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">Umbral: {threshold} consecutivas</span>
            </div>
            {atRiskStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Ningún estudiante en riesgo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {atRiskStudents.map((s) => {
                  const notif = notifMap[s.student_id];
                  const msg = s.whatsapp && s.guardianName
                    ? `Hola ${s.guardianName}, le informamos desde Amor Acción que ${s.name} lleva ${s.consecutive} ausencias consecutivas. ` +
                      `Recuerde que al acumular 4 ausencias seguidas el estudiante pierde su cupo. ` +
                      `Le agradecemos comunicarse con nosotros para conocer la situación. Gracias.`
                    : null;

                  const handleAvisar = async () => {
                    if (!s.whatsapp || !s.guardianName || !msg) return;
                    try {
                      await whatsappLogAPI.log({
                        student_id: s.student_id,
                        guardian_name: s.guardianName,
                        phone: s.whatsapp,
                        message: msg,
                        consecutive: s.consecutive,
                      });
                      queryClient.invalidateQueries({ queryKey: ['wa-notifications-all'] });
                    } catch (e) { /* no bloquear */ }
                    window.open(`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
                  };

                  return (
                    <div key={s.code} className="flex items-center gap-3 py-2 bg-red-50/50 -mx-2 px-2 rounded-lg border-b border-gray-50 last:border-0">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center bg-red-100 text-red-600 flex-shrink-0">
                        <Bell className="w-3 h-3" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.group} · {s.code}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {msg && (
                          notif ? (
                            <span
                              title={`${notif.sentBy} avisó el ${notif.date}`}
                              className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg cursor-default"
                            >
                              <Check className="w-3 h-3" /> Notificado
                            </span>
                          ) : (
                            <button onClick={handleAvisar}
                              className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 px-2 py-1 rounded-lg transition">
                              <MessageCircle className="w-3 h-3" /> Avisar
                            </button>
                          )
                        )}
                        <div className="text-right">
                          <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full block">
                            {s.consecutive} seguidas
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5 block">
                            {s.yearTotal} en el año
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Tomar asistencia', desc: 'Iniciar sesión',       icon: ClipboardCheck, href: '/attendance', color: 'text-blue-600 bg-blue-50' },
              { label: 'Ver estudiantes',  desc: 'Gestionar lista',      icon: Users,          href: '/students',  color: 'text-green-600 bg-green-50' },
              { label: 'Ver sedes',        desc: 'Administrar sedes',    icon: Building2,      href: '/campuses',  color: 'text-indigo-600 bg-indigo-50' },
            ].map(a => {
              const Icon = a.icon;
              return (
                <button key={a.href} onClick={() => navigate(a.href)}
                  className="p-4 rounded-xl border border-gray-100 hover:shadow-sm transition text-left">
                  <div className={`w-9 h-9 rounded-lg ${a.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{a.label}</p>
                  <p className="text-xs text-gray-400">{a.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
