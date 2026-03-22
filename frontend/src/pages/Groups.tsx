import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { groupAPI, userAPI, Group } from '../lib/supabaseApi';
import { Users, UserCheck, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const GROUP_COLORS: Record<string, string> = {
  'Jardín':       'bg-blue-100 text-blue-800 border-blue-200',
  'Infancia':     'bg-green-100 text-green-800 border-green-200',
  'Pre-Juventud': 'bg-purple-100 text-purple-800 border-purple-200',
};

const GROUP_BG: Record<string, string> = {
  'Jardín':       'from-blue-500 to-blue-600',
  'Infancia':     'from-green-500 to-green-600',
  'Pre-Juventud': 'from-purple-500 to-purple-600',
};

export default function Groups() {
  const queryClient = useQueryClient();
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data } = await groupAPI.getAll();
      return data as Group[];
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-teachers'],
    queryFn: async () => {
      const { data } = await userAPI.getAll();
      return (data.items || []).filter((u: any) => u.role === 'profesor' || u.role === 'admin');
    },
  });

  const teachers = usersData || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, teacher_id }: { id: string; teacher_id: string | null }) =>
      groupAPI.update(id, { teacher_id: teacher_id || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setEditingGroup(null);
    },
    onError: (e: any) => alert('Error al asignar profesor: ' + e.message),
  });

  const handleAssign = (groupId: string) => {
    updateMutation.mutate({ id: groupId, teacher_id: selectedTeacher || null });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
            <Users className="w-7 h-7" />
            Grupos
          </h1>
          <p className="text-blue-100 text-sm">
            Asigna un profesor a cada grupo
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const isEditing = editingGroup === group.id;
              const gradient = GROUP_BG[group.name] || 'from-gray-500 to-gray-600';
              const badge = GROUP_COLORS[group.name] || 'bg-gray-100 text-gray-800';

              return (
                <div key={group.id} className="card p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${badge} mb-1`}>
                        {group.name}
                      </span>
                      <p className="text-sm text-gray-500">{group.description || ''}</p>
                    </div>
                  </div>

                  {/* Profesor asignado */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Profesor asignado
                    </p>

                    {!isEditing ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {(group as any).teacher?.full_name || (group as any).teacher?.email || 'Sin asignar'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingGroup(group.id);
                            setSelectedTeacher((group as any).teacher?.id || '');
                          }}
                          className="text-sm text-blue-600 font-medium hover:underline"
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative">
                          <select
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                            className="input-field pr-10 appearance-none"
                          >
                            <option value="">Sin asignar</option>
                            {teachers.map((t: any) => (
                              <option key={t.id} value={t.id}>
                                {t.full_name || t.email}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAssign(group.id)}
                            disabled={updateMutation.isPending}
                            className="btn-primary flex-1 py-2 text-sm"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingGroup(null)}
                            className="btn-secondary flex-1 py-2 text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
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
