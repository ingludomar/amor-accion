import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { doctrineCourseAPI, doctrineEnrollmentAPI, userAPI, DAY_NAMES } from '../lib/supabaseApi';
import { usePermission } from '../hooks/usePermission';
import { Users, UserPlus, X, ChevronDown } from 'lucide-react';

export default function DoctrineEnrollments() {
  const perm = usePermission('doctrine_enrollments');
  const queryClient = useQueryClient();
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState('');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['doctrine-courses-active'],
    queryFn: () => doctrineCourseAPI.getAll({ is_active: true }),
  });

  const { data: allTeachers = [] } = useQuery({
    queryKey: ['users-all-teachers'],
    queryFn: async () => {
      const { data } = await userAPI.getAll();
      return (data.data || []).filter((u: any) => u.role === 'profesor' || u.role === 'admin' || u.role === 'coordinador');
    },
  });

  // Inscripciones de cada curso
  const { data: enrollmentsByCourse = {} } = useQuery({
    queryKey: ['doctrine-enrollments-all', courses.map(c => c.id).join(',')],
    queryFn: async () => {
      const result: Record<string, any[]> = {};
      for (const c of courses) {
        result[c.id] = await doctrineEnrollmentAPI.getByCourse(c.id);
      }
      return result;
    },
    enabled: courses.length > 0,
  });

  const enrollMutation = useMutation({
    mutationFn: ({ courseId, profileId }: { courseId: string; profileId: string }) =>
      doctrineEnrollmentAPI.enroll(courseId, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctrine-enrollments-all'] });
      setAddingTo(null);
      setSelectedProfile('');
    },
    onError: (e: any) => alert('Error: ' + e.message),
  });

  const unenrollMutation = useMutation({
    mutationFn: (id: string) => doctrineEnrollmentAPI.unenroll(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctrine-enrollments-all'] }),
  });

  return (
    <Layout>
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="page-header">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users size={22} />
            Inscripciones
          </h1>
          <p className="text-blue-100 text-sm mt-0.5">Inscribe profesores a los cursos de doctrina</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No hay cursos activos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map(c => {
              const enrolls = enrollmentsByCourse[c.id] || [];
              const enrolledIds = new Set(enrolls.map((e: any) => e.profile_id));
              const available = allTeachers.filter((t: any) => !enrolledIds.has(t.id));
              const isAdding = addingTo === c.id;

              return (
                <div key={c.id} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{c.name}</h3>
                      <p className="text-xs text-gray-500">{DAY_NAMES[c.day_of_week]} · {c.start_time.slice(0, 5)} - {c.end_time.slice(0, 5)}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {enrolls.length} inscritos
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3">
                    {enrolls.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">Sin inscritos</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {enrolls.map((e: any) => (
                          <span key={e.id}
                            className={`inline-flex items-center gap-1.5 bg-white border rounded-full px-3 py-1 text-sm font-medium shadow-sm ${
                              e.status === 'completed' ? 'text-green-700 border-green-200' :
                              e.status === 'dropped'   ? 'text-gray-500 border-gray-200 line-through' :
                              'text-gray-700 border-gray-200'
                            }`}
                          >
                            {e.profile?.full_name || e.profile?.email}
                            {e.status === 'completed' && <span className="text-xs">✓</span>}
                            {perm.canDelete && (
                              <button onClick={() => { if (confirm(`¿Quitar inscripción?`)) unenrollMutation.mutate(e.id); }}
                                className="text-gray-400 hover:text-red-500 transition">
                                <X size={14} />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {perm.canCreate && isAdding ? (
                      <div className="flex gap-2 mt-2">
                        <div className="relative flex-1">
                          <select value={selectedProfile}
                            onChange={e => setSelectedProfile(e.target.value)}
                            className="input-field pr-8 appearance-none text-sm">
                            <option value="">Seleccionar profesor...</option>
                            {available.map((t: any) => (
                              <option key={t.id} value={t.id}>{t.full_name || t.email}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                        </div>
                        <button onClick={() => { if (selectedProfile) enrollMutation.mutate({ courseId: c.id, profileId: selectedProfile }); }}
                          disabled={!selectedProfile}
                          className="btn-primary text-sm px-3">
                          Inscribir
                        </button>
                        <button onClick={() => { setAddingTo(null); setSelectedProfile(''); }}
                          className="btn-secondary text-sm px-3">
                          <X size={16} />
                        </button>
                      </div>
                    ) : perm.canCreate && available.length > 0 ? (
                      <button onClick={() => { setAddingTo(c.id); setSelectedProfile(''); }}
                        className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline mt-1">
                        <UserPlus size={15} />
                        Inscribir profesor
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
