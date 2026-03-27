import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import {
  Building2, Users, ClipboardCheck, TrendingUp,
  Calendar, AlertTriangle, ChevronRight, CheckCircle2,
  XCircle, Clock,
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────
const today     = new Date().toISOString().split('T')[0];
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().split('T')[0];

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate  = useNavigate();

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

  // Top 5 estudiantes con más ausencias este mes
  const { data: topAbsent = [] } = useQuery({
    queryKey: ['dash-absent'],
    queryFn: async () => {
      const { data: sessions } = await supabase
        .from('class_sessions').select('id').gte('session_date', monthStart);
      if (!sessions?.length) return [];
      const ids = sessions.map(s => s.id);
      const { data: records } = await supabase
        .from('attendance_records')
        .select('student_id, student:students(full_name, student_code)')
        .in('session_id', ids)
        .eq('status', 'ausente');
      if (!records?.length) return [];
      // agrupar por estudiante
      const map: Record<string, { name: string; code: string; count: number }> = {};
      records.forEach((r: any) => {
        if (!map[r.student_id]) map[r.student_id] = { name: r.student?.full_name, code: r.student?.student_code, count: 0 };
        map[r.student_id].count++;
      });
      return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
    },
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

          {/* Top ausentes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Más ausencias este mes</h2>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            {topAbsent.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Sin ausencias registradas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topAbsent.map((s, i) => (
                  <div key={s.code} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.code}</p>
                    </div>
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      {s.count} ausencias
                    </span>
                  </div>
                ))}
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
